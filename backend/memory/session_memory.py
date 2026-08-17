from database import SessionLocal
from models import ChatSession, ChatHistory


def update_session_title(session_id, title):

    db = SessionLocal()

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id)
        .first()
    )

    if session:
        session.title = title
        db.commit()

    db.close()


def rename_session(session_id, title):

    db = SessionLocal()

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id)
        .first()
    )

    if session:
        session.title = title
        db.commit()

    db.close()


def delete_session(session_id):

    db = SessionLocal()

    db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).delete()

    db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).delete()

    db.commit()
    db.close()