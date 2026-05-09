from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.task import Task
from app.models.habit import Habit
from app.models.goal import Goal
from app.models.user import User

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events")
def get_events(
    start: date = Query(...),
    end: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    events = []

    # Tasks with scheduled_date
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.scheduled_date >= start,
        Task.scheduled_date <= end,
    ).all()
    for t in tasks:
        events.append({
            "id": f"task-{t.id}",
            "type": "task",
            "title": t.title,
            "date": t.scheduled_date.isoformat(),
            "time": t.scheduled_time.isoformat() if t.scheduled_time else None,
            "duration": t.duration_minutes,
            "color": "#6366f1",
            "status": t.status,
            "entity_id": t.id,
        })

    # Habits as recurring events
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    for h in habits:
        events.append({
            "id": f"habit-{h.id}",
            "type": "habit",
            "title": h.title,
            "frequency": h.frequency,
            "color": "#22c55e",
            "entity_id": h.id,
        })

    # Goals with target_date in range
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.target_date != None,
    ).all()
    for g in goals:
        if g.target_date and start <= g.target_date.date() <= end:
            events.append({
                "id": f"goal-{g.id}",
                "type": "goal",
                "title": f"Дедлайн: {g.title}",
                "date": g.target_date.date().isoformat(),
                "color": "#f59e0b",
                "progress": g.progress,
                "entity_id": g.id,
            })

    return events


@router.put("/events/{event_type}/{entity_id}/reschedule")
def reschedule(
    event_type: str,
    entity_id: int,
    new_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if event_type == "task":
        task = db.query(Task).filter(Task.id == entity_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(404, "Task not found")
        task.scheduled_date = new_date
        db.commit()
        return {"detail": "rescheduled"}
    raise HTTPException(400, "Only tasks can be rescheduled")
