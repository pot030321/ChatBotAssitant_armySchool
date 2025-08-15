from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import List, Literal, Optional, Dict, Union
from datetime import datetime

# Role Types
RoleType = Literal["student", "manager", "department", "leadership", "system", "assistant"]

# Định nghĩa lại các Literal cho trạng thái và mức độ ưu tiên
ThreadStatus = Literal["new", "pending", "assigned", "in_progress", "resolved", "escalated"]
ThreadPriority = Literal["low", "medium", "normal", "high", "urgent"]

# Import schema của Department để sử dụng
from .department_schemas import DepartmentResponse


# Base schemas for response models
class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    role: RoleType
    department: Optional[str] = None  # Phòng ban được lưu dưới dạng tên


# User creation and response models
class UserCreate(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str
    role: RoleType
    department: Optional[str] = None


class UserResponse(UserBase):
    id: str  # Changed from int to str to support UUID strings
    created_at: datetime

    class Config:
        from_attributes = True


# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBase


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# Cập nhật ThreadStatus để phù hợp với các giá trị mới
ThreadStatus = Literal["new", "pending", "assigned", "in_progress", "resolved", "escalated"]
ThreadPriority = Literal["low", "medium", "normal", "high", "urgent"]

# Thread models
class ThreadBase(BaseModel):
    title: str
    department: Optional[str] = None  # Giữ lại để tương thích ngược
    topic: Optional[str] = None
    issue_type: Optional[str] = None
    status: str = "new"  # Sử dụng str thay vì ThreadStatus để tránh lỗi
    priority: str = "normal"  # Sử dụng str thay vì ThreadPriority để tránh lỗi


class ThreadCreate(ThreadBase):
    issue: Optional[str] = None  # Initial message from student


class ThreadResponse(ThreadBase):
    id: str  # Changed from int to str to support UUID strings
    student: Optional[UserBase] = None
    assigned_to: Optional[str] = None  # Tên phòng ban được phân công
    assignee: Optional[UserBase] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ThreadUpdate(BaseModel):
    assigned_to: Optional[str] = None  # Tên phòng ban được phân công
    status: Optional[str] = None  # Sử dụng str thay vì ThreadStatus để tránh lỗi
    priority: Optional[str] = None  # Sử dụng str thay vì ThreadPriority để tránh lỗi
    assignee_id: Optional[str] = None  # User ID của người được phân công (string for UUID support)
    response: Optional[str] = None  # For staff to provide responses


# Message models
class MessageBase(BaseModel):
    text: str
    sender: RoleType = "student"


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str  # Changed from int to str to support UUID strings
    thread_id: str  # Changed from int to str to support UUID strings
    user: Optional[UserBase] = None
    created_at: datetime

    class Config:
        from_attributes = True


# List response models
class ThreadListResponse(BaseModel):
    threads: List[ThreadResponse]


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]


# Statistics models
class ThreadStatistics(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    escalated: int
    by_department: dict[str, int]
