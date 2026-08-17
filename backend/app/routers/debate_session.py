from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.debate_session import (
    DebateSessionCreate,
    DebateSessionResponse
)

from app.services.debate_session_service import (
    create_session,
    get_all_sessions,
    get_session,
    update_session,
    delete_session
)

from app.utils.jwt_handler import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/debate",
    tags=["Debate Sessions"]
)


@router.post("/sessions", response_model=DebateSessionResponse)
def create_debate_session(
    session: DebateSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return create_session(
    current_user,
    session,
    db
)


@router.get("/sessions", response_model=list[DebateSessionResponse])
def get_sessions(
    db: Session = Depends(get_db)
):

    return get_all_sessions(db)


@router.get("/sessions/{session_id}", response_model=DebateSessionResponse)
def get_single_session(
    session_id: int,
    db: Session = Depends(get_db)
):

    session = get_session(session_id, db)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return session


@router.put("/sessions/{session_id}")
def update_debate_session(
    session_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    session = update_session(
        session_id,
        status,
        db
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return session


@router.delete("/sessions/{session_id}")
def delete_debate_session(
    session_id: int,
    db: Session = Depends(get_db)
):

    deleted = delete_session(
        session_id,
        db
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return {
        "message": "Session deleted successfully"
    }