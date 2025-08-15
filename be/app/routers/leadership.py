from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from ..database.db import get_db
from ..services import thread_service, auth_service
from ..schemas import ThreadStatistics, ThreadListResponse

router = APIRouter(prefix="/leadership", tags=["leadership"])


@router.get("/threads", response_model=ThreadListResponse)
def list_leadership_threads(
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "leadership":
        raise HTTPException(status_code=403, detail="Access denied")
        
    threads = thread_service.list_threads(db, skip, limit)
    return {"threads": threads}


@router.get("/analytics", response_model=ThreadStatistics)
def get_leadership_analytics(
    current_user: Dict = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "leadership":
        raise HTTPException(status_code=403, detail="Access denied")
        
    stats = thread_service.get_thread_statistics(db)
    return ThreadStatistics(**stats)
