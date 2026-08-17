from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


# ==========================================
# User
# ==========================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    # OTP fields
    otp_code_hash = Column(
    String,
    nullable=True
)

    otp_expires_at = Column(
    String,
    nullable=True
)

    otp_attempts = Column(
    Integer,
    default=0,
    nullable=False
)

    otp_purpose = Column(
    String,
    nullable=True
)

    sessions = relationship(
        "ChatSession",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ==========================================
# Chat Session
# ==========================================

class ChatSession(Base):

    __tablename__ = "chat_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(
        String,
        default="New Chat",
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="sessions"
    )

    messages = relationship(
        "ChatHistory",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    memories = relationship(
        "UserMemory",
        back_populates="session",
        cascade="all, delete-orphan"
    )


# ==========================================
# Chat History
# ==========================================

class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False
    )

    user = Column(
        Text,
        nullable=False
    )

    bot = Column(
        Text,
        nullable=False
    )

    session = relationship(
        "ChatSession",
        back_populates="messages"
    )


# ==========================================
# User Memory
# ==========================================

class UserMemory(Base):

    __tablename__ = "user_memory"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False
    )

    key = Column(
        String,
        nullable=False
    )

    value = Column(
        Text,
        nullable=False
    )

    session = relationship(
        "ChatSession",
        back_populates="memories"
    )