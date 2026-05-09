from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class MoodEntry(Base):
    __tablename__ = "mood_entries"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mood: Mapped[int] = mapped_column(Integer)  # 1-5
    energy: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
