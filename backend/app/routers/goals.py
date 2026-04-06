from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.goal import Goal, GoalMilestone
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalUpdate, GoalOut, MilestoneCreate, MilestoneUpdate, MilestoneOut

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=List[GoalOut])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(body: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = Goal(user_id=current_user.id, **body.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    return goal


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: int, body: GoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    db.delete(goal)
    db.commit()


@router.post("/{goal_id}/milestones", response_model=MilestoneOut, status_code=201)
def add_milestone(goal_id: int, body: MilestoneCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    m = GoalMilestone(goal_id=goal_id, title=body.title)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/{goal_id}/milestones/{milestone_id}", response_model=MilestoneOut)
def update_milestone(goal_id: int, milestone_id: int, body: MilestoneUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    m = db.query(GoalMilestone).filter(GoalMilestone.id == milestone_id, GoalMilestone.goal_id == goal_id).first()
    if not m:
        raise HTTPException(404, "Milestone not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(m, field, value)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{goal_id}/milestones/{milestone_id}", status_code=204)
def delete_milestone(goal_id: int, milestone_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")
    m = db.query(GoalMilestone).filter(GoalMilestone.id == milestone_id, GoalMilestone.goal_id == goal_id).first()
    if not m:
        raise HTTPException(404, "Milestone not found")
    db.delete(m)
    db.commit()
