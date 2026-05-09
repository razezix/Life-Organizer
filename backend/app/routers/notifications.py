from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.pagination import PaginationParams, PaginatedResponse
from app.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=PaginatedResponse[NotificationOut])
def list_notifications(
    read: bool | None = None,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Notification).filter(Notification.user_id == current_user.id)
    if read is not None:
        q = q.filter(Notification.read == read)
    total = q.count()
    items = q.order_by(Notification.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    return PaginatedResponse(items=items, total=total, skip=pagination.skip, limit=pagination.limit)


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.read == False
    ).count()
    return {"count": count}


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(404, "Notification not found")
    n.read = True
    db.commit()
    db.refresh(n)
    return n


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"detail": "ok"}
