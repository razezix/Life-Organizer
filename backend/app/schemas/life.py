from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field
from app.models.pomodoro import PomodoroType


# Pomodoro
class PomodoroStart(BaseModel):
    task_id: Optional[int] = None
    duration_minutes: int = 25
    type: PomodoroType = PomodoroType.work


class PomodoroOut(BaseModel):
    id: int
    task_id: Optional[int]
    started_at: datetime
    duration_minutes: int
    type: PomodoroType
    completed: bool
    model_config = {"from_attributes": True}


# Notes
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    is_journal: bool = False
    mood: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[str] = None
    pinned: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[str] = None
    pinned: Optional[bool] = None


class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    is_journal: bool
    mood: Optional[int]
    tags: Optional[str]
    pinned: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# Health
class WaterCreate(BaseModel):
    amount_ml: int


class WaterOut(BaseModel):
    id: int
    amount_ml: int
    logged_at: datetime
    model_config = {"from_attributes": True}


class SleepCreate(BaseModel):
    sleep_start: datetime
    sleep_end: datetime
    quality: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class SleepOut(BaseModel):
    id: int
    sleep_start: datetime
    sleep_end: datetime
    quality: Optional[int]
    notes: Optional[str]
    model_config = {"from_attributes": True}


class ExerciseCreate(BaseModel):
    exercise_type: str
    duration_minutes: int
    calories: Optional[int] = None
    notes: Optional[str] = None


class ExerciseOut(BaseModel):
    id: int
    exercise_type: str
    duration_minutes: int
    calories: Optional[int]
    notes: Optional[str]
    logged_at: datetime
    model_config = {"from_attributes": True}


# Mood
class MoodCreate(BaseModel):
    mood: int = Field(..., ge=1, le=5)
    energy: Optional[int] = Field(None, ge=1, le=5)
    note: Optional[str] = None
    tags: Optional[str] = None


class MoodOut(BaseModel):
    id: int
    mood: int
    energy: Optional[int]
    note: Optional[str]
    tags: Optional[str]
    logged_at: datetime
    model_config = {"from_attributes": True}
