from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_active_user
from app.db.postgres import get_db
from app.models.debate_session import DebateSession, SessionStatus
from app.models.debate_topic import DebateTopic
from app.models.user import User
from app.schemas.schedule import (
    ScheduleCreate, ScheduleRespond, ScheduleOut,
    ScheduleUserSummary, ScheduleTopicSummary,
)

router = APIRouter(prefix="/api/v1/schedule", tags=["Schedule"])


def _to_out(s: DebateSession, db: Session) -> ScheduleOut:
    inviter = db.query(User).filter(User.id == s.scheduled_by).first()
    invitee = db.query(User).filter(User.id == s.invitee_id).first()
    topic = db.query(DebateTopic).filter(DebateTopic.id == s.topic_id).first() if s.topic_id else None
    return ScheduleOut(
        id=s.id,
        scheduled_by=ScheduleUserSummary(id=inviter.id, full_name=inviter.full_name, role=inviter.role.name),
        invitee=ScheduleUserSummary(id=invitee.id, full_name=invitee.full_name, role=invitee.role.name),
        topic=ScheduleTopicSummary(id=topic.id, title=topic.title) if topic else None,
        scheduled_datetime=s.scheduled_at,
        status=s.status.value,
        created_at=s.created_at,
    )


@router.get("/directory", response_model=list[ScheduleUserSummary])
def list_directory(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """All other active users — powers the 'Debate with' search step."""
    users = db.query(User).filter(User.id != current_user.id, User.is_active == True).all()
    return [ScheduleUserSummary(id=u.id, full_name=u.full_name, role=u.role.name) for u in users]


@router.get("", response_model=list[ScheduleOut])
def list_my_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    sessions = (
        db.query(DebateSession)
        .filter(
            or_(DebateSession.scheduled_by == current_user.id, DebateSession.invitee_id == current_user.id),
            DebateSession.scheduled_by.isnot(None),
        )
        .order_by(DebateSession.scheduled_at.asc())
        .all()
    )
    return [_to_out(s, db) for s in sessions]


@router.post("", response_model=ScheduleOut, status_code=201)
def create_schedule(
    payload: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    invitee = db.query(User).filter(User.id == payload.invitee_id).first()
    if not invitee:
        raise HTTPException(status_code=404, detail="Invitee not found")
    if invitee.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot schedule a session with yourself")
    if payload.topic_id is not None and not db.query(DebateTopic).filter(DebateTopic.id == payload.topic_id).first():
        raise HTTPException(status_code=404, detail="Topic not found")

    session_obj = DebateSession(
        user_id=current_user.id,
        scheduled_by=current_user.id,
        invitee_id=payload.invitee_id,
        topic_id=payload.topic_id,
        scheduled_at=payload.scheduled_datetime,
        status=SessionStatus.PENDING,
    )
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)
    return _to_out(session_obj, db)


@router.post("/{schedule_id}/respond", response_model=ScheduleOut)
def respond_to_schedule(
    schedule_id: int,
    payload: ScheduleRespond,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    s = db.query(DebateSession).filter(DebateSession.id == schedule_id).first()
    if not s or s.invitee_id != current_user.id:
        raise HTTPException(status_code=404, detail="Schedule invite not found")
    if s.status != SessionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Already responded to")
    s.status = SessionStatus.CONFIRMED if payload.accept else SessionStatus.DECLINED
    db.commit()
    db.refresh(s)
    return _to_out(s, db)


@router.patch("/{schedule_id}/topic", response_model=ScheduleOut)
def set_schedule_topic(
    schedule_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    s = db.query(DebateSession).filter(DebateSession.id == schedule_id).first()
    if not s or current_user.id not in (s.scheduled_by, s.invitee_id):
        raise HTTPException(status_code=404, detail="Schedule invite not found")
    if not db.query(DebateTopic).filter(DebateTopic.id == topic_id).first():
        raise HTTPException(status_code=404, detail="Topic not found")
    s.topic_id = topic_id
    db.commit()
    db.refresh(s)
    return _to_out(s, db)