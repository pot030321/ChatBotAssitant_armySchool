from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any

from ..database.db import get_db
from ..services import thread_service, message_service, auth_service
from ..schemas import (
    ThreadCreate, 
    ThreadResponse, 
    ThreadListResponse, 
    ThreadUpdate
)

router = APIRouter(tags=["threads"])


@router.post("/threads", response_model=ThreadResponse)
def create_thread(
    thread_data: ThreadCreate,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Create the thread
    thread = thread_service.create_thread(
        db=db, 
        thread_data=thread_data, 
        student_id=current_user["id"] if current_user["role"] == "student" else None
    )
    
    # If initial issue provided, post it as first message
    if thread_data.issue:
        message_service.create_message(
            db=db,
            thread_id=thread.id,
            message_data={"text": thread_data.issue, "sender": "student"},
            user_id=current_user["id"] if current_user["role"] == "student" else None
        )
    
    return thread


@router.get("/threads", response_model=ThreadListResponse)
def list_threads(
    skip: int = 0, 
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Different listing based on user role
    if current_user["role"] == "student":
        threads = thread_service.list_threads_by_student(db, current_user["id"], skip, limit)
    elif current_user["role"] == "department":
        # Lấy threads theo phòng ban
        if current_user.get("department_id"):
            # Ưu tiên dùng department_id nếu có
            threads = thread_service.list_threads_by_department(db, current_user["department_id"], skip, limit)
        elif current_user.get("department"):
            # Fallback về tên phòng ban nếu chưa có id
            threads = thread_service.list_threads_by_department(db, current_user["department"], skip, limit)
        else:
            # Nếu không có thông tin phòng ban thì trả về danh sách rỗng
            threads = []
    elif current_user["role"] in ["manager", "leadership"]:
        threads = thread_service.list_threads(db, skip, limit)
    else:
        threads = []
    
    # Lưu ý: Thread sẽ được tự động join với Department thông qua relationship
    return {"threads": threads}


@router.get("/threads/{thread_id}", response_model=ThreadResponse)
def get_thread(
    thread_id: str,  # Changed from int to str to support UUID strings
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Check permissions
    if current_user["role"] == "student" and thread.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user["role"] == "department" and thread.assigned_to != current_user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return thread


@router.patch("/threads/{thread_id}", response_model=ThreadResponse)
def update_thread(
    thread_id: str,  # Changed from int to str to support UUID strings
    thread_data: ThreadUpdate,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Check permissions
    if current_user["role"] not in ["manager", "department", "leadership"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Department users can only update threads assigned to their department
    if current_user["role"] == "department" and thread.assigned_to != current_user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update the thread
    updated_thread = thread_service.update_thread(db, thread_id, thread_data)
    
    # Add response message if provided
    if thread_data.response:
        message_service.create_message(
            db=db,
            thread_id=thread_id,
            message_data={"text": thread_data.response, "sender": current_user["role"]},
            user_id=current_user["id"]
        )
        
        # Add system notification if status changed to resolved
        if thread_data.status == "resolved":
            message_service.create_message(
                db=db,
                thread_id=thread_id,
                message_data={
                    "text": f"[SYSTEM] Vấn đề của bạn đã được {current_user['department'] if current_user['department'] else 'giải quyết'} giải quyết.",
                    "sender": "system"
                }
            )
    
    return updated_thread


@router.post("/threads/{thread_id}/assign", response_model=ThreadResponse)
def assign_thread(
    thread_id: str,  # Changed from int to str to support UUID strings
    department: str,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Access denied")
    
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Import department_service để sử dụng
    from ..services.department_service import get_department_by_name
    
    # Kiểm tra xem phòng ban có tồn tại không
    department_obj = get_department_by_name(db, department)
    if not department_obj:
        # Tạo department mới nếu chưa tồn tại
        from ..services.department_service import create_department
        from ..schemas.department_schemas import DepartmentCreate
        
        department_obj = create_department(db, DepartmentCreate(name=department, description="Auto-created department"))
    
    # Cập nhật thread với tên phòng ban
    thread_data = ThreadUpdate(
        assigned_to=department,
        status="assigned"  # Đổi thành "assigned" thay vì "in_progress" để phù hợp với workflow
    )
    updated_thread = thread_service.update_thread(db, thread_id, thread_data)
    
    # Add system message about assignment
    message_service.create_message(
        db=db,
        thread_id=thread_id,
        message_data={
            "text": f"[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: {department}",
            "sender": "system"
        }
    )
    
    return updated_thread


@router.post("/threads/{thread_id}/escalate", response_model=ThreadResponse)
def escalate_thread(
    thread_id: str,  # Changed from int to str to support UUID strings
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in ["manager", "department"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Update the thread
    thread_data = ThreadUpdate(status="escalated")
    updated_thread = thread_service.update_thread(db, thread_id, thread_data)
    
    # Add system message about escalation
    message_service.create_message(
        db=db,
        thread_id=thread_id,
        message_data={
            "text": f"[SYSTEM] Vấn đề đã được chuyển lên cấp cao hơn.",
            "sender": "system"
        }
    )
    
    return updated_thread


@router.get("/threads/statistics", response_model=Dict)
def get_thread_statistics(
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in ["manager", "leadership"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return thread_service.get_thread_statistics(db)
