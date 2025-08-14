from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Dict, List, Set
from uuid import UUID

from .storage import store
from . import auth


class ConnectionManager:
    def __init__(self):
        # Map user_id -> Set[WebSocket connections]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map thread_id -> Set[user_id subscribed]
        self.thread_subscribers: Dict[UUID, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Remove from thread subscriptions
        for thread_id, subscribers in list(self.thread_subscribers.items()):
            if user_id in subscribers:
                subscribers.discard(user_id)
                if not subscribers:
                    del self.thread_subscribers[thread_id]

    def subscribe_to_thread(self, thread_id: UUID, user_id: str):
        if thread_id not in self.thread_subscribers:
            self.thread_subscribers[thread_id] = set()
        self.thread_subscribers[thread_id].add(user_id)

    def unsubscribe_from_thread(self, thread_id: UUID, user_id: str):
        if thread_id in self.thread_subscribers:
            self.thread_subscribers[thread_id].discard(user_id)
            if not self.thread_subscribers[thread_id]:
                del self.thread_subscribers[thread_id]

    async def broadcast_to_thread(self, thread_id: UUID, message: dict):
        if thread_id not in self.thread_subscribers:
            return
        
        for user_id in self.thread_subscribers[thread_id]:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    await connection.send_json(message)


manager = ConnectionManager()


async def websocket_auth(websocket: WebSocket):
    try:
        # Extract token from query params or headers
        token = websocket.query_params.get("token")
        if not token:
            # Try to get from headers
            auth_header = websocket.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]  # Remove "Bearer " prefix
            
        if not token:
            await websocket.close(code=1008, reason="unauthorized")
            raise HTTPException(status_code=401, detail="unauthorized")
        
        # Validate token and get user
        user = await auth.get_current_user_from_token(token)
        return user
    except Exception:
        await websocket.close(code=1008, reason="unauthorized")
        raise HTTPException(status_code=401, detail="unauthorized")
