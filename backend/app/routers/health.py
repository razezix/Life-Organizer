from datetime import date, datetime, time, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.health import WaterLog, SleepLog, ExerciseLog
from app.models.user import User
from app.schemas.life import WaterCreate, WaterOut, SleepCreate, SleepOut, ExerciseCreate, ExerciseOut

router = APIRouter(prefix="/health", tags=["health"])


# Water
@router.post("/water", response_model=WaterOut, status_code=201)
def log_water(body: WaterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    w = WaterLog(user_id=current_user.id, **body.model_dump())
    db.add(w); db.commit(); db.refresh(w)
    return w


@router.get("/water/today")
def water_today(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today_start = datetime.combine(date.today(), time.min, tzinfo=timezone.utc)
    total = db.query(func.coalesce(func.sum(WaterLog.amount_ml), 0)).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.logged_at >= today_start,
    ).scalar()
    return {"total_ml": int(total), "goal_ml": 2000}


# Sleep
@router.get("/sleep", response_model=list[SleepOut])
def list_sleep(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SleepLog).filter(SleepLog.user_id == current_user.id).order_by(SleepLog.sleep_start.desc()).limit(30).all()


@router.post("/sleep", response_model=SleepOut, status_code=201)
def log_sleep(body: SleepCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = SleepLog(user_id=current_user.id, **body.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    return s


# Exercise
@router.get("/exercise", response_model=list[ExerciseOut])
def list_exercise(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ExerciseLog).filter(ExerciseLog.user_id == current_user.id).order_by(ExerciseLog.logged_at.desc()).limit(30).all()


@router.post("/exercise", response_model=ExerciseOut, status_code=201)
def log_exercise(body: ExerciseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = ExerciseLog(user_id=current_user.id, **body.model_dump())
    db.add(e); db.commit(); db.refresh(e)
    return e
