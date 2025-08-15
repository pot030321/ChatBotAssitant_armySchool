from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from ..database.db import get_db
from ..services import department_service, auth_service
from ..schemas.department_schemas import (
    DepartmentCreate, 
    DepartmentResponse, 
    DepartmentListResponse, 
    DepartmentUpdate
)

router = APIRouter(tags=["departments"])


@router.post("/departments", response_model=DepartmentResponse)
def create_department(
    department_data: DepartmentCreate,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Chỉ manager và leadership mới có quyền tạo phòng ban
    if current_user["role"] not in ["manager", "leadership"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Kiểm tra xem đã có phòng ban cùng tên chưa
    existing_dept = department_service.get_department_by_name(db, department_data.name)
    if existing_dept:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    # Tạo phòng ban mới
    return department_service.create_department(db, department_data)


@router.get("/departments", response_model=DepartmentListResponse)
def list_departments(
    skip: int = 0, 
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Tất cả người dùng đã đăng nhập đều có thể xem danh sách phòng ban
    departments = department_service.list_departments(db, skip, limit)
    return {"departments": departments}


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Tất cả người dùng đã đăng nhập đều có thể xem thông tin phòng ban
    department = department_service.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.patch("/departments/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Chỉ manager và leadership mới có quyền cập nhật phòng ban
    if current_user["role"] not in ["manager", "leadership"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Kiểm tra phòng ban tồn tại
    department = department_service.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Nếu thay đổi tên, kiểm tra xem tên mới đã tồn tại chưa
    if department_data.name and department_data.name != department.name:
        existing_dept = department_service.get_department_by_name(db, department_data.name)
        if existing_dept:
            raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    # Cập nhật phòng ban
    updated_department = department_service.update_department(db, department_id, department_data)
    return updated_department


@router.delete("/departments/{department_id}", status_code=204)
def delete_department(
    department_id: int,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Chỉ manager và leadership mới có quyền xóa phòng ban
    if current_user["role"] not in ["manager", "leadership"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Kiểm tra phòng ban tồn tại
    department = department_service.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Xóa phòng ban
    success = department_service.delete_department(db, department_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete department")
    return None
