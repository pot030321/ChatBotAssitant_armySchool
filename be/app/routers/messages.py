from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..database.db import get_db
from ..services import message_service, auth_service, thread_service
from ..schemas import MessageCreate, MessageResponse, MessageListResponse

router = APIRouter(tags=["messages"])


@router.get("/threads/{thread_id}/messages", response_model=MessageListResponse)
def list_messages(
    thread_id: int,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if thread exists
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Check permissions
    if current_user["role"] == "student" and thread.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user["role"] == "department" and thread.assigned_to != current_user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages
    messages = message_service.list_messages(db, thread_id)
    return {"messages": messages}


@router.post("/threads/{thread_id}/messages", response_model=MessageResponse)
def post_message(
    thread_id: int,
    message: MessageCreate,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if thread exists
    thread = thread_service.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Check permissions
    if current_user["role"] == "student" and thread.student_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user["role"] == "department" and thread.assigned_to != current_user["department"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify sender role
    if message.sender != current_user["role"] and current_user["role"] != "system":
        # Only allow sending as own role
        message.sender = current_user["role"]
    
    # Create message
    new_message = message_service.create_message(
        db=db,
        thread_id=thread_id,
        message_data=message,
        user_id=current_user["id"]
    )
    
    return new_message
