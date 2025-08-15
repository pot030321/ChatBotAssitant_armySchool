from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.departments import Department
from ..schemas.department_schemas import DepartmentCreate, DepartmentUpdate


def create_department(db: Session, department_data: DepartmentCreate) -> Department:
    """Tạo một phòng ban mới."""
    db_department = Department(
        # Bỏ id để MySQL tự tạo auto increment
        name=department_data.name,
        description=department_data.description
    )
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def get_department(db: Session, department_id: int) -> Optional[Department]:
    """Lấy phòng ban theo ID."""
    return db.query(Department).filter(Department.id == department_id).first()


def get_department_by_name(db: Session, name: str) -> Optional[Department]:
    """Lấy phòng ban theo tên."""
    return db.query(Department).filter(Department.name == name).first()


def list_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
    """Liệt kê tất cả phòng ban."""
    return db.query(Department).offset(skip).limit(limit).all()


def update_department(db: Session, department_id: int, department_data: DepartmentUpdate) -> Optional[Department]:
    """Cập nhật thông tin phòng ban."""
    db_department = get_department(db, department_id)
    if not db_department:
        return None
        
    # Cập nhật các trường
    if department_data.name is not None:
        db_department.name = department_data.name
    
    if department_data.description is not None:
        db_department.description = department_data.description
    
    db.commit()
    db.refresh(db_department)
    return db_department


def delete_department(db: Session, department_id: int) -> bool:
    """Xóa phòng ban theo ID."""
    db_department = get_department(db, department_id)
    if not db_department:
        return False
        
    db.delete(db_department)
    db.commit()
    return True
