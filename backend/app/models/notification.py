from datetime import datetime, timezone
from typing import Optional
import enum

from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class NotificationType(str, enum.Enum):
    reminder = "reminder"
    habit = "habit"
    goal = "goal"
    finance = "finance"
    system = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), default=NotificationType.system)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User")
