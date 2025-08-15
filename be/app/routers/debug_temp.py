from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..database.db import get_db
from ..models.models import User, Thread
from ..services import auth_service

router = APIRouter(tags=['debug'])

@router.get('/debug/users')
def list_users(current_user: Dict[str, Any] = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    if current_user['role'] not in ['manager', 'leadership']:
        return {'message': 'Access denied'}
    
    users = db.query(User).all()
    return {'users': [{'id': user.id, 'username': user.username, 'role': user.role, 'department': user.department} for user in users]}

@router.get('/debug/threads')
def list_all_threads(current_user: Dict[str, Any] = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    if current_user['role'] not in ['manager', 'leadership']:
        return {'message': 'Access denied'}
    
    threads = db.query(Thread).all()
    return {'threads': [{'id': thread.id, 'title': thread.title, 'assigned_to': thread.assigned_to, 'status': thread.status} for thread in threads]}
