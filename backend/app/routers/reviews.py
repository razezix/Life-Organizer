from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.task import Task, TaskStatus
from app.models.habit import Habit
from app.models.goal import Goal
from app.models.finance import Transaction, TxType
from app.models.mood import MoodEntry
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _aggregate(db: Session, user_id: int, start: date, end: date):
    tasks_total = db.query(func.count(Task.id)).filter(
        Task.user_id == user_id, func.date(Task.created_at) >= start, func.date(Task.created_at) <= end,
    ).scalar()
    tasks_done = db.query(func.count(Task.id)).filter(
        Task.user_id == user_id, Task.status == TaskStatus.done,
        func.date(Task.created_at) >= start, func.date(Task.created_at) <= end,
    ).scalar()

    habits_count = db.query(func.count(Habit.id)).filter(Habit.user_id == user_id).scalar()
    goals_avg = db.query(func.coalesce(func.avg(Goal.progress), 0)).filter(Goal.user_id == user_id).scalar()

    expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id, Transaction.type == TxType.expense,
        Transaction.transaction_date >= start, Transaction.transaction_date <= end,
    ).scalar()
    income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id, Transaction.type == TxType.income,
        Transaction.transaction_date >= start, Transaction.transaction_date <= end,
    ).scalar()

    avg_mood = db.query(func.coalesce(func.avg(MoodEntry.mood), 0)).filter(
        MoodEntry.user_id == user_id,
        func.date(MoodEntry.logged_at) >= start, func.date(MoodEntry.logged_at) <= end,
    ).scalar()

    return {
        "period": {"start": start.isoformat(), "end": end.isoformat()},
        "tasks": {"total": tasks_total, "done": tasks_done},
        "habits": {"total": habits_count},
        "goals": {"avg_progress": round(float(goals_avg), 1)},
        "finance": {"expense": float(expense), "income": float(income), "balance": float(income) - float(expense)},
        "mood": {"avg": round(float(avg_mood), 1)},
    }


@router.get("/weekly")
def weekly(end: date = Query(default_factory=date.today), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _aggregate(db, current_user.id, end - timedelta(days=6), end)


@router.get("/monthly")
def monthly(end: date = Query(default_factory=date.today), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start = end.replace(day=1)
    return _aggregate(db, current_user.id, start, end)
