from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import threading
import time
from queue import Queue, Empty
from typing import Dict, Tuple, cast

from .database.db import engine, Base
from .models.models import User, Thread, Message
from .models.departments import Department
from .services import gemini_service
from .schemas import RoleType
from .schemas.schemas import MessageCreate
from .routers import auth, threads, messages, leadership, departments


# Create tables in database
Base.metadata.create_all(bind=engine)

# Worker for background processing
class RouterWorker:
    def __init__(self) -> None:
        self.queue: Queue[Tuple[str, RoleType, str]] = Queue()
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        self._thread.join(timeout=2)

    def enqueue(self, thread_id: str, sender: RoleType, text: str) -> None:
        self.queue.put((thread_id, sender, text))

    def _run(self) -> None:
        from sqlalchemy.orm import sessionmaker
        from .database.db import engine
        
        Session = sessionmaker(engine)
        
        while not self._stop.is_set():
            try:
                thread_id, sender, _text = self.queue.get(timeout=0.5)
            except Empty:
                continue
                
            # Process in a new session
            with Session() as session:
                try:
                    thread = session.query(Thread).filter(Thread.id == thread_id).first()
                    messages = session.query(Message).filter(Message.thread_id == thread_id).order_by(Message.created_at).all()
                    
                    reply: str | None = None
                    if sender == "student":
                        # Ask Gemini for a reply if configured
                        reply = gemini_service.generate_reply(thread, messages, _text)
                        
                    if not reply:
                        reply = (
                            "[QLSV] Đã tiếp nhận ý kiến, sẽ chuyển đến phòng/khoa phù hợp."
                            if sender == "student"
                            else "[SYSTEM] Message processed."
                        )
                        
                    # Create assistant message
                    message_data = MessageCreate(text=reply, sender="assistant")
                    new_message = Message(
                        thread_id=thread_id,
                        sender="assistant",
                        text=reply
                    )
                    session.add(new_message)
                    session.commit()
                    
                except Exception as e:
                    print(f"Error in background worker: {str(e)}")
                    # As a last resort, ensure user gets an ack
                    try:
                        new_message = Message(
                            thread_id=thread_id,
                            sender="assistant",
                            text="[QLSV] Đã tiếp nhận ý kiến và sẽ phản hồi sớm."
                        )
                        session.add(new_message)
                        session.commit()
                    except Exception:
                        pass


router_worker = RouterWorker()


@asynccontextmanager
async def lifespan(app: FastAPI):
    router_worker.start()
    try:
        yield
    finally:
        router_worker.stop()


app = FastAPI(title="Student Support Chat API", lifespan=lifespan)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    # Allow any localhost/127.0.0.1 port for Vite dev server
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(threads.router)
app.include_router(messages.router)
app.include_router(leadership.router)
app.include_router(departments.router)



@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# Empty string to remove all this code as it's now handled in the routers




