from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class DepartmentBase(BaseModel):
    """Schema cơ bản cho Department"""
    name: str
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    """Schema dùng để tạo Department mới"""
    pass


class DepartmentResponse(DepartmentBase):
    """Schema dùng để trả về thông tin Department"""
    id: str  # Changed from int to str to support UUID strings
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentUpdate(BaseModel):
    """Schema dùng để cập nhật Department"""
    name: Optional[str] = None
    description: Optional[str] = None


class DepartmentListResponse(BaseModel):
    """Schema dùng để trả về danh sách Department"""
    departments: List[DepartmentResponse]
