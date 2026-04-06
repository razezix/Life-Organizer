from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.task import Task, TaskStatus
from app.models.habit import Habit
from app.models.goal import Goal, GoalStatus
from app.models.user import User
from app.routers.habits import calc_streak

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Tasks stats
    all_tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    tasks_total = len(all_tasks)
    tasks_done = sum(1 for t in all_tasks if t.status == TaskStatus.done)
    tasks_this_week = [t for t in all_tasks if t.created_at.date() >= week_ago]
    tasks_done_this_week = sum(1 for t in tasks_this_week if t.status == TaskStatus.done)

    # Habits stats
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    habits_with_streaks = [
        {"id": h.id, "title": h.title, "streak": calc_streak(h.logs, h.frequency)}
        for h in habits
    ]
    top_streak = max((h["streak"] for h in habits_with_streaks), default=0)

    # Goals stats
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    goals_active = sum(1 for g in goals if g.status == GoalStatus.active)
    goals_completed = sum(1 for g in goals if g.status == GoalStatus.completed)
    avg_progress = (
        sum(g.progress for g in goals if g.status == GoalStatus.active) / goals_active
        if goals_active else 0
    )

    # Weekly task completion chart (last 7 days)
    weekly_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        done_count = sum(
            1 for t in all_tasks
            if t.status == TaskStatus.done and t.created_at.date() == day
        )
        weekly_chart.append({"date": day.isoformat(), "completed": done_count})

    return {
        "tasks": {
            "total": tasks_total,
            "done": tasks_done,
            "this_week_total": len(tasks_this_week),
            "this_week_done": tasks_done_this_week,
        },
        "habits": {
            "total": len(habits),
            "top_streak": top_streak,
            "streaks": habits_with_streaks,
        },
        "goals": {
            "active": goals_active,
            "completed": goals_completed,
            "avg_progress": round(avg_progress, 1),
        },
        "weekly_chart": weekly_chart,
    }
