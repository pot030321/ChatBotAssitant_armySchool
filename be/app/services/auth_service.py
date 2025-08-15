from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.db import get_db
from ..models.models import User

# Đơn giản hóa: Sử dụng fake token cho demo
fake_token_db = {}  # username -> token
fake_users_db = {}  # token -> user_data

# OAuth2 scheme vẫn giữ để tương thích với API
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Xác thực người dùng bằng username và password đơn giản."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    # Demo: mật khẩu là plaintext để đơn giản
    if password != user.hashed_password:  # Lưu ý: trong production thì phải hash password
        return None
    return user


def create_access_token(data: Dict[str, Any]) -> str:
    """Tạo token đơn giản cho demo."""
    username = data["sub"]
    token = f"demo_token_{username}_{hash(username)}"
    
    # Lưu thông tin trong bộ nhớ
    fake_token_db[username] = token
    fake_users_db[token] = {
        "username": username
    }
    
    return token


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[Dict[str, Any]]:
    """Lấy thông tin người dùng hiện tại từ token đơn giản."""
    if not token or token not in fake_users_db:
        return None
    
    username = fake_users_db[token]["username"]
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return None
    
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": user.department
    }


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Lấy thông tin người dùng bằng username."""
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, email: str, full_name: str, password: str, role: str, department: Optional[str] = None) -> User:
    """Tạo người dùng mới."""
    # Bỏ user_id và để MySQL tự tạo auto increment
    
    # Demo: không hash password
    db_user = User(
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=password,  # Lưu password plaintext
        role=role,
        department=department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
