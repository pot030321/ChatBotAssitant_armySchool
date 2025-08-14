from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime, timezone
from uuid import UUID

RoleType = Literal["student", "manager", "department", "system", "assistant"]


class Message(BaseModel):
    id: UUID
    thread_id: UUID
    sender: RoleType  # Use RoleType for sender
    text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Thread(BaseModel):
    id: UUID
    title: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # optional metadata to describe the conversation
    student_name: Optional[str] = None
    department: Optional[str] = None
    topic: Optional[str] = None
    issue_type: Optional[str] = None  # complaint, violation, etc.
    assigned_to: Optional[str] = None  # department or leadership
    status: Optional[str] = "pending"  # pending, in_progress, resolved, escalated
    priority: Optional[str] = "normal"  # low, normal, high, urgent
    assignee: Optional[str] = None  # specific teacher or staff assigned


class CreateThreadRequest(BaseModel):
    title: Optional[str] = None
    student_name: Optional[str] = None
    department: Optional[str] = None
    topic: Optional[str] = None
    # initial issue/description from the student
    issue: Optional[str] = None
    issue_type: Optional[str] = None  # complaint, violation, etc.


class CreateThreadResponse(BaseModel):
    id: UUID
    title: str


class PostMessageRequest(BaseModel):
    text: str
    sender: RoleType = "student"


class PostMessageResponse(BaseModel):
    id: UUID
    thread_id: UUID


class ListThreadsResponse(BaseModel):
    threads: List[Thread]  # Include new fields in the response


class ListMessagesResponse(BaseModel):
    messages: List[Message]


class UserInfo(BaseModel):
    username: str
    full_name: str
    role: str
    department: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class UpdateThreadRequest(BaseModel):
    assigned_to: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    response: Optional[str] = None  # For teachers/departments to provide responses


class Role(BaseModel):
    name: str
    permissions: list[str]
