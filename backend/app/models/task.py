from datetime import datetime, date, time, timezone
from typing import Optional
import enum

from sqlalchemy import String, Text, DateTime, Date, Time, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, enum.Enum):
    todo = "todo"
    done = "done"


class Recurrence(str, enum.Enum):
    none = "none"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    scheduled_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reminder_minutes_before: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    recurrence: Mapped[Recurrence] = mapped_column(Enum(Recurrence), default=Recurrence.none)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.medium)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.todo)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="tasks")
