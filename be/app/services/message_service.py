from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, cast
from sqlalchemy import String

from ..models.models import Message, Thread
from ..schemas import MessageCreate


def create_message(db: Session, thread_id: str, message_data: Union[MessageCreate, Dict[str, Any]], user_id: Optional[str] = None) -> Message:
    """Create a new message in a thread."""
    
    # Handle when message_data is dict instead of MessageCreate
    if isinstance(message_data, dict):
        # Accept either "text" or "content" for message content
        text = message_data.get("text", message_data.get("content", ""))
        # Accept either "sender" or "sender_type" for the sender role
        sender = message_data.get("sender", message_data.get("sender_type", "system"))
        print(f"Creating message from dict: text='{text}', sender='{sender}'")
    else:
        text = message_data.text
        sender = message_data.sender
        print(f"Creating message from Pydantic model: text='{text}', sender='{sender}'")
    
    # Tìm ID lớn nhất hiện tại và tăng lên 1
    # Đảm bảo max_id là số nguyên
    try:
        # Sử dụng một con số cao ngẫu nhiên để tránh xung đột
        import random
        import time
        
        # Tạo một ID ngẫu nhiên dựa trên thời gian + số ngẫu nhiên
        # Đảm bảo ID đủ lớn để không trùng với ID hiện có
        timestamp = int(time.time())
        random_part = random.randint(1000, 9999)
        next_id = timestamp + random_part
        
        print(f"Using timestamp-based ID: {next_id}")
    except Exception as e:
        # Fallback to a very large number
        import random
        next_id = random.randint(100000, 999999)
        print(f"Error generating message ID: {e}")
        print(f"Using random ID: {next_id}")
    
    # Create the message with the integer ID
    db_message = Message(
        id=next_id,
        thread_id=thread_id,
        user_id=user_id,
        sender=sender,
        text=text
    )
    
    try:
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        # No need to modify the db_message directly
        # The conversion will happen in the router when creating the response
        
        return db_message
    except Exception as e:
        db.rollback()
        print(f"Error creating message: {e}")
        raise


def get_message(db: Session, message_id: str) -> Optional[Message]:
    """Get a message by ID."""
    return db.query(Message).filter(Message.id == message_id).first()


def list_messages(db: Session, thread_id: str) -> List[Message]:
    """List all messages in a thread."""
    return db.query(Message).filter(Message.thread_id == thread_id).order_by(Message.created_at).all()


def delete_message(db: Session, message_id: str) -> bool:
    """Delete a message."""
    db_message = get_message(db, message_id)
    if not db_message:
        return False
        
    db.delete(db_message)
    db.commit()
    return True
