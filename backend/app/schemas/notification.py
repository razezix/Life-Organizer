from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationOut(BaseModel):
    id: int
    title: str
    body: Optional[str]
    type: NotificationType
    read: bool
    link: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
