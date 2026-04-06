from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.models.habit import Frequency


class HabitCreate(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: Frequency = Frequency.daily


class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[Frequency] = None


class HabitLogCreate(BaseModel):
    log_date: date
    completed: bool = True


class HabitOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    frequency: Frequency
    created_at: datetime
    streak: int = 0

    model_config = {"from_attributes": True}
