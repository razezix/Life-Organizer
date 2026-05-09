from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class WaterLog(Base):
    __tablename__ = "water_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    amount_ml: Mapped[int] = mapped_column(Integer)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SleepLog(Base):
    __tablename__ = "sleep_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    sleep_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    sleep_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    quality: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    exercise_type: Mapped[str] = mapped_column(String(100))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    calories: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
