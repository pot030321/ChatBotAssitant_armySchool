from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..database.db import Base


class Department(Base):
    """
    Mô hình dữ liệu cho phòng ban.
    Bảng này giúp quản lý danh sách phòng ban một cách nhất quán
    và cung cấp ID duy nhất cho mỗi phòng ban.
    """
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships tạm thời bị comment vì các bảng khác chưa có foreign key liên kết
    # users = relationship("User", back_populates="department_info")
    # assigned_threads = relationship("Thread", back_populates="assigned_department")
