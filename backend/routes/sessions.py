from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from database import SessionLocal

from models import ChatSession

from memory import (
    rename_session,
    delete_session,
    get_session_messages,
    update_session_title,
)

from auth.security import decode_access_token


router = APIRouter()

security = HTTPBearer()


# ==========================================
# Request Models
# ==========================================

class RenameSessionRequest(BaseModel):
    title: str


# ==========================================
# Get Current User ID
# ==========================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    user_id = decode_access_token(
        credentials.credentials
    )

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return user_id


# ==========================================
# Create Session
# ==========================================

@router.post("/sessions")
def create_session(
    user_id: int = Depends(get_current_user_id)
):

    db = SessionLocal()

    try:

        session = ChatSession(
            user_id=user_id,
            title="New Chat"
        )

        db.add(session)

        db.commit()

        db.refresh(session)

        return {
            "session_id": session.id,
            "title": session.title
        }

    finally:

        db.close()


# ==========================================
# Get Sessions
# ==========================================

@router.get("/sessions")
def get_sessions(
    user_id: int = Depends(get_current_user_id)
):

    db = SessionLocal()

    try:

        sessions = (
            db.query(ChatSession)
            .filter(
                ChatSession.user_id == user_id
            )
            .order_by(
                ChatSession.id.desc()
            )
            .all()
        )

        result = []

        for session in sessions:

            result.append({
                "id": session.id,
                "title": session.title
            })

        return result

    finally:

        db.close()


# ==========================================
# Rename Session
# ==========================================

@router.put("/sessions/{session_id}")
def rename_chat(
    session_id: int,
    request: RenameSessionRequest,
    user_id: int = Depends(get_current_user_id)
):

    db = SessionLocal()

    try:

        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            )
            .first()
        )

        if not session:

            raise HTTPException(
                status_code=404,
                detail="Session not found."
            )

        session.title = request.title.strip()

        db.commit()

        return {
            "message": "Session renamed successfully"
        }

    finally:

        db.close()


# ==========================================
# Delete Session
# ==========================================

@router.delete("/sessions/{session_id}")
def delete_chat(
    session_id: int,
    user_id: int = Depends(get_current_user_id)
):

    db = SessionLocal()

    try:

        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            )
            .first()
        )

        if not session:

            raise HTTPException(
                status_code=404,
                detail="Session not found."
            )

        delete_session(session_id)

        return {
            "message": "Session deleted successfully"
        }

    finally:

        db.close()


# ==========================================
# Get Session Messages
# ==========================================

@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: int,
    user_id: int = Depends(get_current_user_id)
):

    db = SessionLocal()

    try:

        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            )
            .first()
        )

        if not session:

            raise HTTPException(
                status_code=404,
                detail="Session not found."
            )

    finally:

        db.close()

    chats = get_session_messages(
        session_id
    )

    result = []

    for chat in chats:

        result.append({
            "sender": "user",
            "text": chat.user
        })

        result.append({
            "sender": "bot",
            "text": chat.bot
        })

    return result