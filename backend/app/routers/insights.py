"""AI-инсайты — пока на основе паттернов в данных, без LLM."""
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.task import Task, TaskStatus
from app.models.habit import Habit
from app.models.mood import MoodEntry
from app.models.finance import Transaction, TxType
from app.models.user import User

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/weekly")
def weekly_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    insights = []
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Productivity by weekday
    by_weekday = db.query(
        func.extract('dow', Task.created_at).label("dow"),
        func.count(Task.id).label("cnt"),
    ).filter(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.done,
        func.date(Task.created_at) >= today - timedelta(days=30),
    ).group_by("dow").order_by(func.count(Task.id).desc()).first()

    if by_weekday and by_weekday.cnt > 3:
        days = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу']
        insights.append({
            "icon": "📅",
            "title": "Твой продуктивный день",
            "text": f"Ты чаще всего завершаешь задачи в {days[int(by_weekday.dow)]}. Планируй важное на этот день.",
        })

    # Task completion rate
    total = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id,
        func.date(Task.created_at) >= week_ago,
    ).scalar()
    done = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id,
        Task.status == TaskStatus.done,
        func.date(Task.created_at) >= week_ago,
    ).scalar()
    if total > 0:
        rate = (done / total) * 100
        if rate >= 70:
            insights.append({"icon": "🔥", "title": "Отличная неделя",
                "text": f"Ты выполнил {rate:.0f}% задач за неделю. Так держать!"})
        elif rate < 40 and total >= 5:
            insights.append({"icon": "💪", "title": "Попробуй меньше задач",
                "text": f"Выполнено {rate:.0f}% задач. Может, разбить большие на маленькие?"})

    # Mood vs habits correlation (simplified)
    avg_mood = db.query(func.avg(MoodEntry.mood)).filter(
        MoodEntry.user_id == current_user.id,
        func.date(MoodEntry.logged_at) >= week_ago,
    ).scalar()
    if avg_mood and float(avg_mood) >= 4:
        insights.append({"icon": "😊", "title": "Хорошая неделя для настроения",
            "text": "Среднее настроение выше 4/5 — продолжай делать то, что делаешь."})
    elif avg_mood and float(avg_mood) < 2.5:
        insights.append({"icon": "🌱", "title": "Позаботься о себе",
            "text": "Настроение снижено. Попробуй больше сна, прогулок и спорта."})

    # Spending pattern: weekend vs weekday
    weekday_exp = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id, Transaction.type == TxType.expense,
        Transaction.transaction_date >= week_ago,
        func.extract('dow', Transaction.transaction_date).in_([1, 2, 3, 4, 5]),
    ).scalar()
    weekend_exp = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id, Transaction.type == TxType.expense,
        Transaction.transaction_date >= week_ago,
        func.extract('dow', Transaction.transaction_date).in_([0, 6]),
    ).scalar()
    if float(weekend_exp) > float(weekday_exp) and float(weekday_exp) > 0:
        insights.append({"icon": "🎉", "title": "Расходы в выходные",
            "text": "В выходные ты тратишь больше, чем в будни. Планируй покупки заранее."})

    # Habit count
    habit_count = db.query(func.count(Habit.id)).filter(Habit.user_id == current_user.id).scalar()
    if habit_count == 0:
        insights.append({"icon": "✨", "title": "Начни с одной привычки",
            "text": "У тебя ещё нет привычек. Начни с простого — пить стакан воды утром."})

    if not insights:
        insights.append({"icon": "👋", "title": "Накапливай данные",
            "text": "Чем больше ты используешь приложение, тем точнее будут советы."})

    return insights
