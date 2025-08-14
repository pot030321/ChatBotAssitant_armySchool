from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, TypedDict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext


SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class User(TypedDict, total=False):
    username: str
    full_name: str
    role: str  # student | manager | department | leadership
    department: str | None
    hashed_password: str


# Demo users (in-memory). Replace with DB later.
_USERS: Dict[str, User] = {}


def _hpw(pw: str) -> str:
    return pwd_context.hash(pw)


def _init_users() -> None:
    global _USERS
    if _USERS:
        return
    _USERS = {
        "student1": {
            "username": "student1",
            "full_name": "Sinh viên A",
            "role": "student",
            "department": None,
            "hashed_password": _hpw("123456"),
        },
        "qlsv": {
            "username": "qlsv",
            "full_name": "Phòng QLSV",
            "role": "manager",
            "department": "QLSV",
            "hashed_password": _hpw("123456"),
        },
        "cntt": {
            "username": "cntt",
            "full_name": "Khoa CNTT",
            "role": "department",
            "department": "CNTT",
            "hashed_password": _hpw("123456"),
        },
        "boss": {
            "username": "boss",
            "full_name": "Ban Giám Hiệu",
            "role": "leadership",
            "department": None,
            "hashed_password": _hpw("123456"),
        },
    }


_init_users()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str) -> Optional[User]:
    user = _USERS.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def decode_token(token: str) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = _USERS.get(username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    return await decode_token(token)


async def get_current_user_from_token(token: str) -> User:
    return await decode_token(token)


async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user["username"], "role": user["role"], "department": user.get("department")})
    return {"access_token": token, "token_type": "bearer", "user": {"username": user["username"], "full_name": user["full_name"], "role": user["role"], "department": user.get("department")}}
