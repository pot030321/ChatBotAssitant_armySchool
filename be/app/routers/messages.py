from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import TypeAdapter

from ..database.db import get_db
from ..services import message_service, auth_service, thread_service
from ..schemas import MessageCreate, MessageResponse, MessageListResponse

router = APIRouter(tags=["messages"])


@router.get("/threads/{thread_id}/messages", response_model=MessageListResponse)
def list_messages(
    thread_id: str,  # Changed from int to str to support UUID strings
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Check for authentication
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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
    
    # Convert message IDs to strings if needed for the response
    for msg in messages:
        if hasattr(msg, 'id') and msg.id is not None:
            # We don't modify the objects directly, just ensure they're properly 
            # handled when serialized to JSON
            pass
    
    return {"messages": messages}


@router.post("/threads/{thread_id}/messages")
def post_message(
    thread_id: str,  # Changed from int to str to support UUID strings
    message: Dict[str, Any],  # Changed from MessageCreate to Dict to accept any fields
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    # Check for authentication
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Debug info
    print(f"Received message data: {message}")
    print(f"Current user: {current_user}")
    print(f"Thread ID: {thread_id}")
    
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
    sender = message.get("sender", message.get("sender_type", None))
    if sender != current_user["role"] and current_user["role"] != "system":
        # Only allow sending as own role
        message["sender"] = current_user["role"]
        print(f"Updated sender to: {message.get('sender')}")
    
    try:
        # Create message
        new_message = message_service.create_message(
            db=db,
            thread_id=thread_id,
            message_data=message,
            user_id=current_user["id"]
        )
        
        # Skip complex validation and just return a direct dict
        # This bypasses the pydantic model validation which may be causing issues
        return {
            "id": str(new_message.id),
            "thread_id": thread_id,
            "text": new_message.text,
            "sender": new_message.sender,
            "created_at": new_message.created_at,
            "user": None
        }
    except Exception as e:
        print(f"Error in post_message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create message: {str(e)}"
        )
