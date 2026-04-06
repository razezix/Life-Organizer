from datetime import datetime, date, timezone
from typing import Optional

from sqlalchemy import String, Text, DateTime, Date, ForeignKey, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class Frequency(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    frequency: Mapped[Frequency] = mapped_column(Enum(Frequency), default=Frequency.daily)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), nullable=False, index=True)
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=True)

    habit = relationship("Habit", back_populates="logs")
