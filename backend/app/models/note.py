from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, String, Text, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Note(Base):
    __tablename__ = "notes"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_journal: Mapped[bool] = mapped_column(Boolean, default=False)
    mood: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # comma-separated
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
