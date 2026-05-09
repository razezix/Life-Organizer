from datetime import datetime, timezone
from typing import Optional
import enum
from sqlalchemy import DateTime, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class PomodoroType(str, enum.Enum):
    work = "work"
    short_break = "short_break"
    long_break = "long_break"


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    task_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    duration_minutes: Mapped[int] = mapped_column(Integer, default=25)
    type: Mapped[PomodoroType] = mapped_column(Enum(PomodoroType), default=PomodoroType.work)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
