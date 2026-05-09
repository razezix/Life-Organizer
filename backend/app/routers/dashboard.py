from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, case, and_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.task import Task, TaskStatus
from app.models.habit import Habit, HabitLog
from app.models.goal import Goal, GoalStatus
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Tasks stats via SQL aggregates
    task_stats = db.query(
        func.count(Task.id).label("total"),
        func.count(case((Task.status == TaskStatus.done, 1))).label("done"),
        func.count(case((func.date(Task.created_at) >= week_ago, 1))).label("this_week_total"),
        func.count(case((
            and_(Task.status == TaskStatus.done, func.date(Task.created_at) >= week_ago), 1
        ))).label("this_week_done"),
    ).filter(Task.user_id == current_user.id).one()

    # Habits — need logs for streak calc, but only load minimal data
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    from app.routers.habits import calc_streak
    habits_with_streaks = [
        {"id": h.id, "title": h.title, "streak": calc_streak(h.logs, h.frequency)}
        for h in habits
    ]
    top_streak = max((h["streak"] for h in habits_with_streaks), default=0)

    # Goals stats via SQL aggregates
    goal_stats = db.query(
        func.count(case((Goal.status == GoalStatus.active, 1))).label("active"),
        func.count(case((Goal.status == GoalStatus.completed, 1))).label("completed"),
        func.coalesce(func.avg(case((Goal.status == GoalStatus.active, Goal.progress))), 0).label("avg_progress"),
    ).filter(Goal.user_id == current_user.id).one()

    # Weekly chart via SQL
    weekly_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(func.count(Task.id)).filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.done,
            func.date(Task.created_at) == day,
        ).scalar()
        weekly_chart.append({"date": day.isoformat(), "completed": count})

    return {
        "tasks": {
            "total": task_stats.total,
            "done": task_stats.done,
            "this_week_total": task_stats.this_week_total,
            "this_week_done": task_stats.this_week_done,
        },
        "habits": {
            "total": len(habits),
            "top_streak": top_streak,
            "streaks": habits_with_streaks,
        },
        "goals": {
            "active": goal_stats.active,
            "completed": goal_stats.completed,
            "avg_progress": round(float(goal_stats.avg_progress), 1),
        },
        "weekly_chart": weekly_chart,
    }
