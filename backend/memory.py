from pathlib import Path

from database import SessionLocal
from models import (
    ChatHistory,
    UserMemory,
)

# ==========================================
# Chat History
# ==========================================

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


# ==========================================
# Session
# ==========================================

def update_session_title(session_id, title):

    from models import ChatSession

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

    update_session_title(session_id, title)


def delete_session(session_id):

    from models import ChatSession

    db = SessionLocal()

    db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).delete()

    db.query(ChatSession).filter(
        ChatSession.id == session_id
    ).delete()

    db.query(UserMemory).filter(
        UserMemory.session_id == session_id
    ).delete()

    db.commit()

    db.close()


# ==========================================
# AI Long-Term Memory
# ==========================================

def save_memory(session_id, key, value):

    db = SessionLocal()

    memory = (
        db.query(UserMemory)
        .filter(
            UserMemory.session_id == session_id,
            UserMemory.key == key
        )
        .first()
    )

    if memory:

        memory.value = value

    else:

        memory = UserMemory(
            session_id=session_id,
            key=key,
            value=value
        )

        db.add(memory)

    db.commit()

    db.close()


def get_memory(session_id):

    db = SessionLocal()

    memories = (
        db.query(UserMemory)
        .filter(
            UserMemory.session_id == session_id
        )
        .all()
    )

    db.close()

    return memories


def get_memory_value(session_id, key):

    db = SessionLocal()

    memory = (
        db.query(UserMemory)
        .filter(
            UserMemory.session_id == session_id,
            UserMemory.key == key
        )
        .first()
    )

    db.close()

    if memory:

        return memory.value

    return None


def delete_memory(session_id, key):

    db = SessionLocal()

    db.query(UserMemory).filter(
        UserMemory.session_id == session_id,
        UserMemory.key == key
    ).delete()

    db.commit()

    db.close()


# ==========================================
# Storage
# ==========================================

IMAGE_DIR = Path("storage/images")
DOCUMENT_DIR = Path("storage/documents")

IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)

DOCUMENT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# Documents
# ==========================================

def save_document(
    session_id,
    filename,
    text
):

    session_dir = DOCUMENT_DIR / str(session_id)

    session_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    txt_file = session_dir / f"{filename}.txt"

    txt_file.write_text(
        text,
        encoding="utf-8"
    )


def get_documents(session_id):

    session_dir = DOCUMENT_DIR / str(session_id)

    if not session_dir.exists():

        return []

    documents = []

    for file in session_dir.glob("*.txt"):

        documents.append(

            file.read_text(
                encoding="utf-8"
            )

        )

    return documents


# ==========================================
# Images
# ==========================================

def save_image(
    session_id,
    image_path
):

    session_dir = IMAGE_DIR / str(session_id)

    session_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    destination = (
        session_dir /
        Path(image_path).name
    )

    if Path(image_path) != destination:

        destination.write_bytes(

            Path(image_path).read_bytes()

        )


def get_images(session_id):

    session_dir = IMAGE_DIR / str(session_id)

    if not session_dir.exists():

        return []

    return [

        str(file)

        for file in session_dir.iterdir()

        if file.is_file()

    ]