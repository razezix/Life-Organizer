from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.task import Priority, TaskStatus


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Priority = Priority.medium
    category: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    category: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    priority: Priority
    status: TaskStatus
    category: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
