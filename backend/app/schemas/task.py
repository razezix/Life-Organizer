from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel
from app.models.task import Priority, TaskStatus, Recurrence


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    reminder_minutes_before: Optional[int] = None
    recurrence: Recurrence = Recurrence.none
    priority: Priority = Priority.medium
    category: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    reminder_minutes_before: Optional[int] = None
    recurrence: Optional[Recurrence] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    category: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    scheduled_date: Optional[date]
    scheduled_time: Optional[time]
    duration_minutes: Optional[int]
    reminder_minutes_before: Optional[int]
    recurrence: Recurrence
    priority: Priority
    status: TaskStatus
    category: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
