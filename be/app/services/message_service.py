from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session

from ..models.models import Message, Thread
from ..schemas import MessageCreate


def create_message(db: Session, thread_id: str, message_data: Union[MessageCreate, Dict[str, Any]], user_id: Optional[str] = None) -> Message:
    """Create a new message in a thread."""
    
    # Handle when message_data is dict instead of MessageCreate
    if isinstance(message_data, dict):
        text = message_data.get("text", "")
        sender = message_data.get("sender", "system")
    else:
        text = message_data.text
        sender = message_data.sender
    
    db_message = Message(
        # Bỏ id để MySQL tự tạo auto increment
        thread_id=thread_id,
        user_id=user_id,
        sender=sender,
        text=text
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


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
