from database import SessionLocal
from models import ChatHistory


def save_chat(session_id, user, bot):
    db = SessionLocal()

    chat = ChatHistory(
        session_id=session_id,
        user=user,
        bot=bot
    )

    db.add(chat)
    db.commit()
    db.close()


def get_last_chats(session_id, limit=5):

    db = SessionLocal()

    chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    return chats[::-1]


def get_session_messages(session_id):

    db = SessionLocal()

    chats = (
        db.query(ChatHistory)
        .filter(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.id.asc())
        .all()
    )

    db.close()

    return chats