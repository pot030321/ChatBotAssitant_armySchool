import google.generativeai as genai
from typing import List, Optional

from ..config.settings import GEMINI_API_KEY, GEMINI_MODEL
from ..models.models import Thread, Message
from ..schemas import RoleType

# Configure the Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def format_messages_for_gemini(thread: Thread, messages: List[Message], new_message: str) -> List[dict]:
    """Format messages for the Gemini API."""
    formatted_messages = []
    
    # Add system prompt with context about the thread
    system_prompt = f"""
    You are an AI assistant for student support at a school. 
    
    CONTEXT:
    - Student: {thread.student.full_name if thread.student else 'Unknown'}
    - Department: {thread.department if thread.department else 'Not specified'}
    - Topic: {thread.topic if thread.topic else 'General'}
    - Current status: {thread.status}
    
    Your role is to provide helpful, accurate information to student queries,
    be respectful and professional in your responses, and refer the student to
    the appropriate department when necessary. If you don't know the answer to a
    question, admit that you don't know and suggest contacting the appropriate department.
    
    Respond in the same language the student uses.
    """
    formatted_messages.append({"role": "system", "parts": [{"text": system_prompt}]})
    
    # Add conversation history
    for msg in messages:
        role = "user" if msg.sender == "student" else "model"
        if msg.sender in ["manager", "department", "leadership"]:
            # Convert staff messages to model responses prefixed with their role
            formatted_messages.append({
                "role": "model", 
                "parts": [{"text": f"[{msg.sender.upper()}]: {msg.text}"}]
            })
        elif msg.sender in ["system"]:
            # Skip system messages or add them differently if needed
            continue
        else:
            formatted_messages.append({
                "role": role, 
                "parts": [{"text": msg.text}]
            })
    
    # Add new message from student
    formatted_messages.append({"role": "user", "parts": [{"text": new_message}]})
    
    return formatted_messages


def generate_reply(thread: Thread, messages: List[Message], new_message: str) -> Optional[str]:
    """Generate a reply using Gemini API."""
    if not GEMINI_API_KEY:
        return None
        
    try:
        formatted_messages = format_messages_for_gemini(thread, messages, new_message)
        
        # Get response from Gemini
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(formatted_messages)
        
        if response and hasattr(response, 'text'):
            return response.text
        
        return None
    except Exception as e:
        print(f"Error generating reply with Gemini: {str(e)}")
        return None
