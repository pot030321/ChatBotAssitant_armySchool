from __future__ import annotations

import threading
from collections import defaultdict
from typing import Dict, List
from uuid import uuid4, UUID

from .schemas import Message, Thread, RoleType


class ChatStore:
    """Thread-safe in-memory store for threads and messages."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._threads: Dict[UUID, Thread] = {}
        self._messages: Dict[UUID, List[Message]] = defaultdict(list)

    def create_thread(self, title: str, *, student_name: str | None = None, department: str | None = None, topic: str | None = None) -> Thread:
        with self._lock:
            tid = uuid4()
            thread = Thread(id=tid, title=title, student_name=student_name, department=department, topic=topic)
            self._threads[tid] = thread
            return thread

    def list_threads(self) -> List[Thread]:
        with self._lock:
            return sorted(self._threads.values(), key=lambda t: t.created_at)

    def get_thread(self, thread_id: UUID) -> Thread:
        with self._lock:
            if thread_id not in self._threads:
                raise KeyError("thread_not_found")
            return self._threads[thread_id]

    def post_message(self, thread_id: UUID, sender: RoleType, text: str) -> Message:
        with self._lock:
            if thread_id not in self._threads:
                raise KeyError("thread_not_found")
            msg = Message(id=uuid4(), thread_id=thread_id, sender=sender, text=text)
            self._messages[thread_id].append(msg)
            return msg

    def list_messages(self, thread_id: UUID) -> List[Message]:
        with self._lock:
            if thread_id not in self._threads:
                raise KeyError("thread_not_found")
            return list(self._messages[thread_id])


store = ChatStore()
