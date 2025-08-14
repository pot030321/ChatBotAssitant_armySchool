from __future__ import annotations
from typing import TypedDict, Any, cast

import threading
import time
from queue import Queue, Empty
from typing import Dict
from uuid import UUID

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CreateThreadRequest,
    CreateThreadResponse,
    ListMessagesResponse,
    ListThreadsResponse,
    PostMessageRequest,
    PostMessageResponse,
    RoleType,
    TokenResponse,
    UserInfo,
    Thread,
)
from .models import ThreadStatistics
from .storage import store
from . import auth
from . import gemini_client


app = FastAPI(title="Student Support Chat API")

# Allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    # Allow any localhost/127.0.0.1 port for Vite dev server
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include extended endpoints
from .extended_endpoints import router as extended_router
app.include_router(extended_router)


# Simple background worker to simulate routing to departments/manager
class RouterWorker:
    def __init__(self) -> None:
        self.queue: "Queue[tuple[UUID, RoleType, str]]" = Queue()
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        self._thread.join(timeout=2)

    def enqueue(self, thread_id: UUID, sender: RoleType, text: str) -> None:
        self.queue.put((thread_id, sender, text))

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                thread_id, sender, _text = self.queue.get(timeout=0.5)
            except Empty:
                continue
            # Simulate processing time and posting an automated acknowledgement
            time.sleep(0.1)
            try:
                thread = store.get_thread(thread_id)
                history = store.list_messages(thread_id)
                reply: str | None = None
                if sender == "student":
                    # Ask Gemini for a reply if configured
                    reply = gemini_client.generate_reply(thread, history, _text)
                if not reply:
                    reply = (
                        "[QLSV] Đã tiếp nhận ý kiến, sẽ chuyển đến phòng/khoa phù hợp."
                        if sender == "student"
                        else "[SYSTEM] Message processed."
                    )
                store.post_message(thread_id, sender="assistant", text=reply)
            except Exception:
                # As a last resort, ensure user gets an ack
                store.post_message(
                    thread_id,
                    sender="assistant",
                    text="[QLSV] Đã tiếp nhận ý kiến và sẽ phản hồi sớm.",
                )


router_worker = RouterWorker()

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    router_worker.start()
    try:
        yield
    finally:
        router_worker.stop()


app.router.lifespan_context = lifespan


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# Auth endpoints
from typing import Any


@app.post("/auth/login", response_model=TokenResponse)
async def auth_login(data: auth.OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    res = cast(Dict[str, Any], await auth.login(data))
    return TokenResponse(
        access_token=res["access_token"],
        token_type=res.get("token_type", "bearer"),
        user=UserInfo(**res["user"]),
    )


from typing import TypedDict


class _UserTD(TypedDict):
    username: str
    full_name: str
    role: str
    department: str | None


@app.get("/me", response_model=Dict[str, UserInfo])
async def get_me(user: _UserTD = Depends(auth.get_current_user)) -> Dict[str, UserInfo]:
    return {"user": UserInfo(
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        department=user.get("department"),
    )}


@app.post("/threads", response_model=CreateThreadResponse)
def create_thread(req: CreateThreadRequest) -> CreateThreadResponse:
    title = req.title or "Trao đổi với quản lý sinh viên"
    thread = store.create_thread(title, student_name=req.student_name, department=req.department, topic=req.topic)
    # if initial issue provided, post it as first message from student
    if req.issue:
        store.post_message(thread.id, sender="student", text=req.issue)
        router_worker.enqueue(thread.id, "student", req.issue)
    return CreateThreadResponse(id=thread.id, title=thread.title)


@app.get("/threads", response_model=ListThreadsResponse)
def list_threads() -> ListThreadsResponse:
    return ListThreadsResponse(threads=store.list_threads())


@app.get("/threads/{thread_id}/messages", response_model=ListMessagesResponse)
def list_messages(thread_id: UUID) -> ListMessagesResponse:
    try:
        return ListMessagesResponse(messages=store.list_messages(thread_id))
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


@app.post("/threads/{thread_id}/messages", response_model=PostMessageResponse)
def post_message(thread_id: UUID, req: PostMessageRequest) -> PostMessageResponse:
    try:
        msg = store.post_message(thread_id, sender=req.sender, text=req.text)
        # enqueue for background processing (routing/ack)
        router_worker.enqueue(thread_id, req.sender, req.text)
        return PostMessageResponse(id=msg.id, thread_id=msg.thread_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


@app.get("/manager/threads", response_model=ListThreadsResponse)
def list_manager_threads(user: _UserTD = Depends(auth.get_current_user)) -> ListThreadsResponse:
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="access_denied")
    return ListThreadsResponse(threads=store.list_threads())


@app.get("/leadership/threads", response_model=ListThreadsResponse)
def list_leadership_threads(user: _UserTD = Depends(auth.get_current_user)) -> ListThreadsResponse:
    if user["role"] != "leadership":
        raise HTTPException(status_code=403, detail="access_denied")
    return ListThreadsResponse(threads=store.list_threads())


@app.get("/department/threads", response_model=ListThreadsResponse)
def list_department_threads(user: _UserTD = Depends(auth.get_current_user)) -> ListThreadsResponse:
    if user["role"] != "department":
        raise HTTPException(status_code=403, detail="access_denied")
    return ListThreadsResponse(threads=[t for t in store.list_threads() if t.assigned_to == user["department"]])


@app.post("/threads/{thread_id}/assign", response_model=Thread)
def assign_thread(
    thread_id: UUID, 
    department: str,
    user: _UserTD = Depends(auth.get_current_user)
) -> Thread:
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="access_denied")
    try:
        thread = store.get_thread(thread_id)
        thread.assigned_to = department
        thread.status = "in_progress"
        
        # Notify about assignment
        store.post_message(
            thread_id,
            sender=cast(RoleType, "system"),
            text=f"[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: {department}"
        )
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


@app.post("/threads/{thread_id}/escalate", response_model=Thread)
def escalate_thread(
    thread_id: UUID,
    user: _UserTD = Depends(auth.get_current_user)
) -> Thread:
    if user["role"] not in ["manager", "department"]:
        raise HTTPException(status_code=403, detail="access_denied")
    try:
        thread = store.get_thread(thread_id)
        thread.status = "escalated"
        
        # Add escalation message
        store.post_message(
            thread_id,
            sender=cast(RoleType, "system"),
            text=f"[SYSTEM] Vấn đề đã được chuyển lên cấp cao hơn."
        )
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


from .schemas import UpdateThreadRequest


@app.patch("/threads/{thread_id}", response_model=Thread)
def update_thread(thread_id: UUID, req: UpdateThreadRequest, user: _UserTD = Depends(auth.get_current_user)) -> Thread:
    if user["role"] not in ["manager", "department", "leadership"]:
        raise HTTPException(status_code=403, detail="access_denied")
    try:
        thread = store.get_thread(thread_id)
        if req.assigned_to:
            thread.assigned_to = req.assigned_to
        if req.status:
            thread.status = req.status
        if req.priority:
            thread.priority = req.priority
        if req.assignee:
            thread.assignee = req.assignee
        
        # If response provided, add it as a message
        if req.response:
            sender_role = user["role"]
            store.post_message(thread_id, sender=cast(RoleType, sender_role), text=req.response)
            
            # If department is responding and marking as resolved, notify student
            if user["role"] == "department" and req.status == "resolved":
                store.post_message(
                    thread_id, 
                    sender="system", 
                    text=f"[SYSTEM] Vấn đề của bạn đã được {user['department']} giải quyết."
                )
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")
