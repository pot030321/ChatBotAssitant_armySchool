from typing import List, Optional, Dict, Any
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from ..models.models import Thread, Message, User
from ..schemas import ThreadCreate, ThreadUpdate


def create_thread(db: Session, thread_data: ThreadCreate, student_id: Optional[int] = None) -> Thread:
    """Create a new thread."""
    # Tạo ID UUID mới cho thread
    thread_id = str(uuid.uuid4())
    
    db_thread = Thread(
        id=thread_id,  # Gán ID tường minh
        title=thread_data.title,
        student_id=student_id,
        department=thread_data.department,
        topic=thread_data.topic,
        issue_type=thread_data.issue_type,
        status="pending",
        priority=thread_data.priority
    )
    db.add(db_thread)
    db.commit()
    db.refresh(db_thread)
    return db_thread


def get_thread(db: Session, thread_id: str) -> Optional[Thread]:
    """Get a thread by ID."""
    return db.query(Thread).filter(Thread.id == thread_id).first()


def list_threads(db: Session, skip: int = 0, limit: int = 100) -> List[Thread]:
    """List all threads."""
    return db.query(Thread).order_by(Thread.created_at.desc()).offset(skip).limit(limit).all()


def list_threads_by_student(db: Session, student_id: int, skip: int = 0, limit: int = 100) -> List[Thread]:
    """List threads by student ID."""
    return db.query(Thread).filter(Thread.student_id == student_id).order_by(Thread.created_at.desc()).offset(skip).limit(limit).all()


def list_threads_by_department(db: Session, department: str, skip: int = 0, limit: int = 100) -> List[Thread]:
    """List threads by department name."""
    # Tìm kiếm chỉ theo assigned_to vì chúng ta chỉ sử dụng tên phòng ban
    return db.query(Thread).filter(
        Thread.assigned_to == department
    ).order_by(Thread.created_at.desc()).offset(skip).limit(limit).all()


def update_thread(db: Session, thread_id: str, thread_data: ThreadUpdate) -> Optional[Thread]:
    """Update a thread."""
    db_thread = get_thread(db, thread_id)
    if not db_thread:
        return None
        
    # Update thread fields
    if thread_data.assigned_to is not None:
        setattr(db_thread, 'assigned_to', thread_data.assigned_to)
    
    if thread_data.status is not None:
        setattr(db_thread, 'status', thread_data.status)
    
    if thread_data.priority is not None:
        setattr(db_thread, 'priority', thread_data.priority)
    
    if thread_data.assignee_id is not None:
        setattr(db_thread, 'assignee_id', thread_data.assignee_id)
    
    db.commit()
    db.refresh(db_thread)
    return db_thread


def get_thread_statistics(db: Session) -> Dict[str, Any]:
    """Get thread statistics."""
    total = db.query(func.count(Thread.id)).scalar()
    
    # Count by status
    status_counts = {
        "pending": 0,
        "in_progress": 0,
        "resolved": 0,
        "escalated": 0
    }
    
    for status in status_counts.keys():
        status_counts[status] = db.query(func.count(Thread.id)).filter(Thread.status == status).scalar()
    
    # Count by department
    departments = db.query(Thread.assigned_to).filter(Thread.assigned_to != None).distinct().all()
    by_department = {}
    
    for dept in departments:
        if dept[0]:  # Check if department is not None
            count = db.query(func.count(Thread.id)).filter(Thread.assigned_to == dept[0]).scalar()
            by_department[dept[0]] = count
    
    return {
        "total": total,
        "pending": status_counts["pending"],
        "in_progress": status_counts["in_progress"],
        "resolved": status_counts["resolved"],
        "escalated": status_counts["escalated"],
        "by_department": by_department
    }
