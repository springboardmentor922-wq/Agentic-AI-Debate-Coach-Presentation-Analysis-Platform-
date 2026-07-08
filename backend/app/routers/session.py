from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import DebateSession
from app.schemas.session import SessionCreate, SessionUpdate
from app.dependencies import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/sessions")
def create_session(
    session: SessionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_session = DebateSession(
        title=session.title,
        topic=session.topic,
        position=session.position,
        user_id=current_user.id
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "message": "Debate session created successfully",
        "session_id": new_session.id
    }


@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sessions = db.query(DebateSession).filter(
        DebateSession.user_id == current_user.id
    ).all()

    return sessions

@router.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Debate session not found"
        )

    return session

@router.put("/sessions/{session_id}")
def update_session(
    session_id: int,
    updated_session: SessionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Debate session not found"
        )

    session.title = updated_session.title
    session.topic = updated_session.topic
    session.position = updated_session.position

    db.commit()
    db.refresh(session)

    return {
        "message": "Debate session updated successfully",
        "session": session
    }

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Debate session not found"
        )

    db.delete(session)
    db.commit()

    return {
        "message": "Debate session deleted successfully"
    }