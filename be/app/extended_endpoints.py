# Additional endpoints for the student support system
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from uuid import UUID
from typing import Dict, Optional, Any

from .websockets import manager, websocket_auth

from .schemas import (
    Thread,
    RoleType,
    ListThreadsResponse
)
from .storage import store
from . import auth
from typing import TypedDict, Any, cast

class _UserTD(TypedDict):
    username: str
    full_name: str
    role: str
    department: str | None

# Create a router for advanced endpoints
router = APIRouter(tags=["extended"])

# Statistics model for leadership dashboard
from pydantic import BaseModel

class ThreadStatistics(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    escalated: int
    by_department: Dict[str, int]

@router.get("/leadership/statistics", response_model=ThreadStatistics)
def get_leadership_statistics(user: _UserTD = Depends(auth.get_current_user)) -> ThreadStatistics:
    if user["role"] != "leadership":
        raise HTTPException(status_code=403, detail="access_denied")
    
    threads = store.list_threads()
    by_department: Dict[str, int] = {}
    
    # Count threads by status and department
    pending = 0
    in_progress = 0
    resolved = 0
    escalated = 0
    
    for thread in threads:
        # Count by status
        if thread.status == "pending":
            pending += 1
        elif thread.status == "in_progress":
            in_progress += 1
        elif thread.status == "resolved":
            resolved += 1
        elif thread.status == "escalated":
            escalated += 1
        
        # Count by department
        if thread.assigned_to:
            by_department[thread.assigned_to] = by_department.get(thread.assigned_to, 0) + 1
    
    return ThreadStatistics(
        total=len(threads),
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        escalated=escalated,
        by_department=by_department
    )

# Endpoint for departments to list their assigned threads by status
@router.get("/department/threads/by-status/{status}", response_model=ListThreadsResponse)
def list_department_threads_by_status(
    status: str, 
    user: _UserTD = Depends(auth.get_current_user)
) -> ListThreadsResponse:
    if user["role"] != "department":
        raise HTTPException(status_code=403, detail="access_denied")
    
    department = user["department"]
    if not department:
        raise HTTPException(status_code=400, detail="department_not_assigned")
    
    threads = [
        t for t in store.list_threads() 
        if t.assigned_to == department and t.status == status
    ]
    
    return ListThreadsResponse(threads=threads)

# Endpoint for department to mark a thread as resolved with a response
@router.post("/threads/{thread_id}/resolve", response_model=Thread)
async def resolve_thread(
    thread_id: UUID,
    response: str,
    user: _UserTD = Depends(auth.get_current_user)
) -> Thread:
    if user["role"] not in ["department", "leadership"]:
        raise HTTPException(status_code=403, detail="access_denied")
    
    try:
        thread = store.get_thread(thread_id)
        thread.status = "resolved"
        
        # Add resolution message
        sender_role = user["role"]
        store.post_message(thread_id, sender=cast(RoleType, sender_role), text=response)
        
        # Add system notification
        message = store.post_message(
            thread_id, 
            sender=cast(RoleType, "system"), 
            text=f"[SYSTEM] Vấn đề đã được {user['department'] or 'ban lãnh đạo'} giải quyết."
        )
        
        # Broadcast the update via WebSocket
        await manager.broadcast_to_thread(thread_id, {
            "type": "resolution",
            "thread_id": str(thread_id),
            "message_id": str(message.id),
            "status": "resolved"
        })
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


# Endpoint for QLSV to assign threads to departments
@router.post("/threads/{thread_id}/assign", response_model=Thread)
async def assign_thread(
    thread_id: UUID, 
    department: str,
    user: _UserTD = Depends(auth.get_current_user)
) -> Thread:
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="access_denied")
    try:
        thread = store.get_thread(thread_id)
        thread.assigned_to = department
        thread.status = "in_progress"
        
        # Notify about assignment
        message = store.post_message(
            thread_id,
            sender=cast(RoleType, "system"),
            text=f"[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: {department}"
        )
        
        # Broadcast the update via WebSocket
        await manager.broadcast_to_thread(thread_id, {
            "type": "assignment",
            "thread_id": str(thread_id),
            "department": department,
            "message_id": str(message.id)
        })
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


# Endpoint for escalating issues to leadership
@router.post("/threads/{thread_id}/escalate", response_model=Thread)
async def escalate_thread(
    thread_id: UUID,
    user: _UserTD = Depends(auth.get_current_user)
) -> Thread:
    if user["role"] not in ["manager", "department"]:
        raise HTTPException(status_code=403, detail="access_denied")
    try:
        thread = store.get_thread(thread_id)
        thread.status = "escalated"
        
        # Add escalation message
        message = store.post_message(
            thread_id,
            sender=cast(RoleType, "system"),
            text=f"[SYSTEM] Vấn đề đã được chuyển lên ban lãnh đạo."
        )
        
        # Broadcast the update via WebSocket
        await manager.broadcast_to_thread(thread_id, {
            "type": "escalation",
            "thread_id": str(thread_id),
            "message_id": str(message.id)
        })
        
        return thread
    except KeyError:
        raise HTTPException(status_code=404, detail="thread_not_found")


# Endpoint for students to view their threads
@router.get("/student/threads", response_model=ListThreadsResponse)
def list_student_threads(user: _UserTD = Depends(auth.get_current_user)) -> ListThreadsResponse:
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="access_denied")
    
    # Filter threads for the specific student (based on student_name matching username)
    filtered_threads = [
        t for t in store.list_threads() 
        if t.student_name == user["username"]
    ]
    
    return ListThreadsResponse(threads=filtered_threads)


# WebSocket connection for real-time updates
@router.websocket("/ws/threads/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: UUID):
    try:
        user = await websocket_auth(websocket)
        user_id = user["username"]
        
        # Connect and subscribe to thread updates
        await manager.connect(websocket, user_id)
        manager.subscribe_to_thread(thread_id, user_id)
        
        try:
            while True:
                # Wait for messages (ping/pong to keep connection alive)
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
    except HTTPException:
        # Already handled in websocket_auth
        pass
