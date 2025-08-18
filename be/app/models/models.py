from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Enum, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
# Thay thế UUID bằng VARCHAR để tương thích với MySQL
import uuid

from ..database.db import Base

# Định nghĩa các trạng thái của Thread
THREAD_STATUS = ('new', 'pending', 'assigned', 'in_progress', 'resolved', 'escalated')
THREAD_PRIORITY = ('low', 'medium', 'normal', 'high', 'urgent')
USER_ROLES = ('student', 'manager', 'department', 'leadership', 'system', 'assistant')


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)  # Sẽ lưu password plaintext cho demo
    role = Column(Enum(*USER_ROLES), default="student", nullable=False)
    department = Column(String(100), nullable=True)  # Giữ lại trường cũ để tương thích
    # department_id bị comment vì cột này chưa tồn tại trong database
    # department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    threads = relationship("Thread", back_populates="student", foreign_keys="Thread.student_id")
    assigned_threads = relationship("Thread", back_populates="assignee_user", foreign_keys="Thread.assignee_id")
    messages = relationship("Message", back_populates="user")
    # department_info = relationship("Department", back_populates="users")


class Thread(Base):
    __tablename__ = "threads"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"))
    department = Column(String(100), nullable=True)  # Giữ lại trường cũ để tương thích
    topic = Column(String(100), nullable=True)
    issue_type = Column(String(100), nullable=True)
    assigned_to = Column(String(100), nullable=True)  # Giữ lại trường cũ để tương thích
    # assigned_department_id bị comment vì cột này chưa tồn tại trong database
    # assigned_department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    status = Column(Enum(*THREAD_STATUS), default="new", nullable=False)  # Thay đổi trạng thái mặc định thành "new"
    priority = Column(Enum(*THREAD_PRIORITY), default="normal", nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("User", back_populates="threads", foreign_keys=[student_id])
    assignee_user = relationship("User", back_populates="assigned_threads", foreign_keys=[assignee_id])
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan")
    # assigned_department = relationship("Department", back_populates="assigned_threads")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    thread_id = Column(String(36), ForeignKey("threads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender = Column(Enum(*USER_ROLES), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    thread = relationship("Thread", back_populates="messages")
    user = relationship("User", back_populates="messages")
