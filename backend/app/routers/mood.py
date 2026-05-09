from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.mood import MoodEntry
from app.models.user import User
from app.schemas.life import MoodCreate, MoodOut

router = APIRouter(prefix="/mood", tags=["mood"])


@router.get("", response_model=list[MoodOut])
def list_mood(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MoodEntry).filter(MoodEntry.user_id == current_user.id).order_by(MoodEntry.logged_at.desc()).limit(60).all()


@router.post("", response_model=MoodOut, status_code=201)
def log_mood(body: MoodCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    m = MoodEntry(user_id=current_user.id, **body.model_dump())
    db.add(m); db.commit(); db.refresh(m)
    return m


@router.get("/heatmap")
def heatmap(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Возвращает {date: avg_mood} за последний месяц."""
    today = date.today()
    start = today - timedelta(days=30)
    rows = db.query(
        func.date(MoodEntry.logged_at).label("d"),
        func.avg(MoodEntry.mood).label("avg_mood"),
    ).filter(
        MoodEntry.user_id == current_user.id,
        func.date(MoodEntry.logged_at) >= start,
    ).group_by(func.date(MoodEntry.logged_at)).all()
    return [{"date": r.d.isoformat(), "mood": round(float(r.avg_mood), 1)} for r in rows]
