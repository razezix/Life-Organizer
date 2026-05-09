from datetime import date, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.finance import Transaction, ExpenseCategory, TxType
from app.models.user import User

router = APIRouter(prefix="/finance/analytics", tags=["finance-analytics"])


@router.get("/spending-by-category")
def spending_by_category(
    period: str = Query("month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    if period == "week": start = today - timedelta(days=7)
    elif period == "month": start = today.replace(day=1)
    elif period == "quarter": start = today - timedelta(days=90)
    else: start = today.replace(month=1, day=1)

    rows = db.query(
        ExpenseCategory.id, ExpenseCategory.name, ExpenseCategory.icon, ExpenseCategory.color,
        func.coalesce(func.sum(Transaction.amount), 0).label("total"),
    ).outerjoin(Transaction, (Transaction.category_id == ExpenseCategory.id) & (Transaction.user_id == current_user.id) & (Transaction.type == TxType.expense) & (Transaction.transaction_date >= start)
    ).group_by(ExpenseCategory.id).having(func.sum(Transaction.amount) > 0).all()

    return [
        {"category_id": r.id, "name": r.name, "icon": r.icon, "color": r.color, "total": float(r.total)}
        for r in rows
    ]


@router.get("/monthly-trends")
def monthly_trends(months: int = 6, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TxType.income,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date < next_month,
        ).scalar()
        expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TxType.expense,
            Transaction.transaction_date >= month_start,
            Transaction.transaction_date < next_month,
        ).scalar()
        result.append({
            "month": month_start.strftime("%Y-%m"),
            "income": float(income),
            "expense": float(expense),
            "balance": float(income) - float(expense),
        })
    return result


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    month_start = today.replace(day=1)

    month_expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TxType.expense,
        Transaction.transaction_date >= month_start,
    ).scalar()
    month_income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TxType.income,
        Transaction.transaction_date >= month_start,
    ).scalar()

    days_in_month = (today - month_start).days + 1
    avg_per_day = float(month_expense) / max(days_in_month, 1)

    return {
        "month_expense": float(month_expense),
        "month_income": float(month_income),
        "month_balance": float(month_income) - float(month_expense),
        "avg_per_day": round(avg_per_day, 2),
    }


@router.get("/tips")
def tips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Финансовые советы простым языком на основе данных пользователя."""
    today = date.today()
    month_start = today.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    out = []

    # Tip 1: Сравнение с прошлым месяцем
    cur = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id, Transaction.type == TxType.expense,
        Transaction.transaction_date >= month_start,
    ).scalar()
    prev = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id, Transaction.type == TxType.expense,
        Transaction.transaction_date >= last_month_start, Transaction.transaction_date < month_start,
    ).scalar()
    if prev > 0 and cur > prev * Decimal("1.2"):
        diff = round(((float(cur) / float(prev)) - 1) * 100)
        out.append({
            "icon": "📈",
            "title": "Расходы выросли",
            "text": f"В этом месяце ты тратишь на {diff}% больше, чем в прошлом. Возможно, стоит составить бюджет.",
        })

    # Tip 2: Подписки
    subs = db.query(ExpenseCategory).filter(ExpenseCategory.name == "Подписки", ExpenseCategory.is_system == True).first()
    if subs:
        sub_total = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.id, Transaction.category_id == subs.id,
            Transaction.transaction_date >= month_start,
        ).scalar()
        if sub_total > 0:
            yearly = float(sub_total) * 12
            out.append({
                "icon": "📱",
                "title": "Проверь подписки",
                "text": f"Ты тратишь на подписки {float(sub_total):.0f}₽ в месяц — это {yearly:.0f}₽ в год. Проверь, всеми ли пользуешься.",
            })

    # Tip 3: Кафе
    cafe = db.query(ExpenseCategory).filter(ExpenseCategory.name == "Кафе/Рестораны", ExpenseCategory.is_system == True).first()
    if cafe:
        cafe_total = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.id, Transaction.category_id == cafe.id,
            Transaction.transaction_date >= month_start,
        ).scalar()
        if cafe_total > 5000:
            yearly = float(cafe_total) * 12
            out.append({
                "icon": "☕",
                "title": "Кафе и рестораны",
                "text": f"На кафе ушло {float(cafe_total):.0f}₽ за месяц = {yearly:.0f}₽ в год. Готовка дома сэкономит больше половины.",
            })

    # Static tips
    out.append({"icon": "💰", "title": "Правило 50/30/20",
                "text": "50% дохода — на нужное (еда, жильё), 30% — на хотелки, 20% — откладывай. Это простой способ начать копить."})
    out.append({"icon": "🏦", "title": "Подушка безопасности",
                "text": "Скопи сумму на 3-6 месяцев твоих обычных расходов. Это спасёт, если потеряешь работу или заболеешь."})
    out.append({"icon": "📝", "title": "Записывай траты",
                "text": "Просто записывая каждую покупку, люди в среднем тратят на 15% меньше. Попробуй."})

    return out
