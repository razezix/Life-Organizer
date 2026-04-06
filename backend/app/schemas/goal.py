from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.goal import GoalStatus


class MilestoneCreate(BaseModel):
    title: str


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


class MilestoneOut(BaseModel):
    id: int
    title: str
    completed: bool

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[GoalStatus] = None


class GoalOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    target_date: Optional[datetime]
    progress: int
    status: GoalStatus
    created_at: datetime
    milestones: List[MilestoneOut] = []

    model_config = {"from_attributes": True}
