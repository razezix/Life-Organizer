from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="UTC")
    currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True, default="KZT")
    language: Mapped[Optional[str]] = mapped_column(String(2), nullable=True, default="en")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    password_reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_notifications_enabled: Mapped[bool] = mapped_column(default=True)
    daily_digest_enabled: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
