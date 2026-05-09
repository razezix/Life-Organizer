from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.pomodoro import PomodoroSession, PomodoroType
from app.models.user import User
from app.schemas.life import PomodoroStart, PomodoroOut

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])


@router.post("/start", response_model=PomodoroOut, status_code=201)
def start(body: PomodoroStart, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = PomodoroSession(user_id=current_user.id, **body.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    return s


@router.put("/{session_id}/complete", response_model=PomodoroOut)
def complete(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(PomodoroSession).filter(PomodoroSession.id == session_id, PomodoroSession.user_id == current_user.id).first()
    if not s: raise HTTPException(404, "Session not found")
    s.completed = True
    db.commit(); db.refresh(s)
    return s


@router.get("/stats")
def stats(period: str = "week", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    start = today - timedelta(days=7 if period == "week" else 30)
    completed = db.query(func.count(PomodoroSession.id), func.coalesce(func.sum(PomodoroSession.duration_minutes), 0)).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.completed == True,
        PomodoroSession.type == PomodoroType.work,
        func.date(PomodoroSession.started_at) >= start,
    ).one()
    return {"sessions": completed[0], "total_minutes": int(completed[1]), "period": period}
