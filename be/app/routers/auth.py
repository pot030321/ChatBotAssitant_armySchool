from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Optional, Any

from ..database.db import get_db
from ..services import auth_service
from ..schemas import Token, UserCreate, UserResponse

router = APIRouter(tags=["authentication"], prefix="/auth")


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Tạo token đơn giản
    access_token = auth_service.create_access_token(
        data={"sub": user.username}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user with simple password
    return auth_service.create_user(
        db=db,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password=user.password,  # No hashing for demo
        role=user.role,
        department=user.department
    )


@router.get("/me")
async def get_current_user_info(current_user: Optional[Dict[str, Any]] = Depends(auth_service.get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user": current_user}
