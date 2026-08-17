from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from chatbot import ask_gemini
from ai.title_generator import generate_chat_title

from memory import (
    save_chat,
    update_session_title,
)

from database import SessionLocal
from models import ChatSession

from routes.sessions import get_current_user_id

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: int
    message: str


# ==========================================
# Verify Session Belongs To User
# ==========================================

def verify_session(session_id: int, user_id: int):

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

        return session

    finally:
        db.close()


# ==========================================
# Update Title
# ==========================================

def _update_title_if_needed(
    session_id: int,
    message: str
):

    db = SessionLocal()

    try:

        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == session_id
            )
            .first()
        )

        if session and session.title == "New Chat":

            title = generate_chat_title(message)

            session.title = title

            db.commit()

    finally:

        db.close()


# ==========================================
# Normal Chat
# ==========================================

@router.post("/chat")
def chat(
    request: ChatRequest,
    user_id: int = Depends(get_current_user_id)
):

    verify_session(
        request.session_id,
        user_id
    )

    answer = ask_gemini(
        request.session_id,
        request.message
    )

    save_chat(
        request.session_id,
        request.message,
        answer
    )

    _update_title_if_needed(
        request.session_id,
        request.message
    )

    return {
        "reply": answer
    }


# ==========================================
# Streaming Chat
# ==========================================

@router.post("/chat/stream")
def stream_chat(
    request: ChatRequest,
    user_id: int = Depends(get_current_user_id)
):

    verify_session(
        request.session_id,
        user_id
    )

    def generator():

        try:

            answer = ask_gemini(
                request.session_id,
                request.message
            )

            # Send answer character by character
            for ch in answer:
                yield ch

            # Save only after successful generation
            save_chat(
                request.session_id,
                request.message,
                answer
            )

            _update_title_if_needed(
                request.session_id,
                request.message
            )

        except Exception as e:

            print(
                "STREAMING ERROR:",
                repr(e)
            )

            yield "\n[Streaming error]"

    return StreamingResponse(
        generator(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )