from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.habit import Habit, HabitLog
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitUpdate, HabitLogCreate, HabitOut

router = APIRouter(prefix="/habits", tags=["habits"])


def calc_streak(logs: list, frequency: str) -> int:
    completed_dates = sorted(
        {log.log_date for log in logs if log.completed}, reverse=True
    )
    if not completed_dates:
        return 0

    streak = 0
    current = date.today()
    step = timedelta(days=1) if frequency == "daily" else timedelta(weeks=1)

    for d in completed_dates:
        if d == current or d == current - step:
            streak += 1
            current = d - step
        else:
            break
    return streak


def habit_to_out(habit: Habit) -> HabitOut:
    streak = calc_streak(habit.logs, habit.frequency)
    return HabitOut(
        id=habit.id,
        title=habit.title,
        description=habit.description,
        frequency=habit.frequency,
        created_at=habit.created_at,
        streak=streak,
    )


@router.get("", response_model=List[HabitOut])
def list_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    return [habit_to_out(h) for h in habits]


@router.post("", response_model=HabitOut, status_code=201)
def create_habit(body: HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = Habit(user_id=current_user.id, **body.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit_to_out(habit)


@router.get("/{habit_id}", response_model=HabitOut)
def get_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    return habit_to_out(habit)


@router.put("/{habit_id}", response_model=HabitOut)
def update_habit(habit_id: int, body: HabitUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(habit, field, value)
    db.commit()
    db.refresh(habit)
    return habit_to_out(habit)


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    db.delete(habit)
    db.commit()


@router.post("/{habit_id}/log", status_code=201)
def log_habit(habit_id: int, body: HabitLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    existing = db.query(HabitLog).filter(HabitLog.habit_id == habit_id, HabitLog.log_date == body.log_date).first()
    if existing:
        existing.completed = body.completed
    else:
        db.add(HabitLog(habit_id=habit_id, log_date=body.log_date, completed=body.completed))
    db.commit()
    return {"detail": "logged"}
