from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.session import DebateSession

from app.models.user import User
from app.schemas.debate import DebateTurnResponseSchema
from app.schemas.session import SessionCreate
from app.services.ai.debate_engine import DebateEngine

router = APIRouter(
    prefix="/sessions",
    tags=["Debate Sessions"]
)

engine = DebateEngine()

VALID_FORMATS = [
    "One-on-One Debate",
    "Parliamentary Debate",
    "Oxford Debate",
    "Policy Debate",
    "Public Forum Debate",
    "AI Debate Simulation",
]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_session(
    session: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if session.debate_format not in VALID_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Invalid debate format"
        )

    if session.position not in ["For", "Against"]:
        raise HTTPException(
            status_code=400,
            detail="Position must be For or Against"
        )

    if current_user.role not in [
        "Coach",
        "Educator",
        "Admin"
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Coach, Educator or Admin can create sessions."
        )

    new_session = DebateSession(

        user_id=current_user.id,

        topic_id=session.topic_id,

        session_type=session.session_type,

        debate_format=session.debate_format,

        position=session.position,

        status=session.status,

        duration=session.duration

    )

    db.add(new_session)

    db.commit()

    db.refresh(new_session)

    return new_session

@router.get("/")
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(DebateSession).all()


@router.post(
    "/{session_id}/debate",
    response_model=DebateTurnResponseSchema
)
async def debate_with_ai(
    session_id: int,
    text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    debate_session = (
        db.query(DebateSession)
        .filter(DebateSession.id == session_id)
        .first()
    )

    if debate_session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found."
        )

    topic = debate_session.topic
    result = await engine.process_text(
    session_id=session_id,
    user_id=current_user.id,
    topic=topic.title,
    text=text,
    position=debate_session.position,
    debate_format=debate_session.debate_format
)
    return result