from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.pagination import PaginationParams, PaginatedResponse
from app.dependencies import get_current_user
from app.models.note import Note
from app.models.user import User
from app.schemas.life import NoteCreate, NoteUpdate, NoteOut

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=PaginatedResponse[NoteOut])
def list_notes(
    search: Optional[str] = Query(None),
    is_journal: Optional[bool] = None,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Note).filter(Note.user_id == current_user.id)
    if search:
        q = q.filter(Note.title.ilike(f"%{search}%") | Note.content.ilike(f"%{search}%"))
    if is_journal is not None:
        q = q.filter(Note.is_journal == is_journal)
    total = q.count()
    items = q.order_by(Note.pinned.desc(), Note.updated_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    return PaginatedResponse(items=items, total=total, skip=pagination.skip, limit=pagination.limit)


@router.post("", response_model=NoteOut, status_code=201)
def create_note(body: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = Note(user_id=current_user.id, **body.model_dump())
    db.add(n); db.commit(); db.refresh(n)
    return n


@router.put("/{note_id}", response_model=NoteOut)
def update_note(note_id: int, body: NoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not n: raise HTTPException(404, "Note not found")
    for k, v in body.model_dump(exclude_unset=True).items(): setattr(n, k, v)
    db.commit(); db.refresh(n)
    return n


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not n: raise HTTPException(404, "Note not found")
    db.delete(n); db.commit()
