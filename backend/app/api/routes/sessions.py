import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, RoleChecker
from app.db.mongodb import session_logs_collection, fallacy_analysis_collection, performance_summaries_collection
from app.db.postgres import get_db
from app.models.debate_session import DebateSession, SessionStatus
from app.models.debate_topic import DebateTopic
from app.models.debate_turn_score import DebateTurnScore
from app.models.presentation_history import PresentationDomain, PresentationHistory, PresentationStatus
from app.models.role import RoleName
from app.models.user import User
from app.schemas.session import SessionCreate, SessionOut, SessionUpdate
from app.services.performance_scoring import generate_performance_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sessions", tags=["Debate Sessions"])

can_manage_sessions = RoleChecker([RoleName.DEBATE_COACH, RoleName.EDUCATOR, RoleName.ADMINISTRATOR])


def _is_session_participant(session_obj: DebateSession, user: User) -> bool:
    """A session can legitimately be viewed/managed by anyone connected to it,
    not just the original creator (user_id) — the scheduled invitee, the
    assigned coach (as opponent or adjudicator), or the opponent in a
    human-vs-human match all need access.
    """
    participant_ids = {
        session_obj.user_id,
        session_obj.coach_id,
        session_obj.scheduled_by,
        session_obj.invitee_id,
        session_obj.opponent_user_id,
    }
    return user.id in participant_ids


@router.get("", response_model=list[SessionOut])
def list_my_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return (
        db.query(DebateSession)
        .filter(DebateSession.user_id == current_user.id)
        .order_by(DebateSession.created_at.desc())
        .all()
    )


# IMPORTANT: this must be declared before the "/{session_id}" route below,
# otherwise FastAPI would try to match "all" as a session_id and fail.
@router.get("/all", response_model=list[SessionOut])
def list_all_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(can_manage_sessions),
):
    return db.query(DebateSession).order_by(DebateSession.created_at.desc()).all()


@router.post("", response_model=SessionOut, status_code=201)
async def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session_obj = DebateSession(user_id=current_user.id, **payload.model_dump())
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)

    # Log session creation in MongoDB (flexible, append-only session activity log)
    await session_logs_collection.insert_one(
        {
            "session_id": session_obj.id,
            "user_id": current_user.id,
            "event": "session_created",
            "timestamp": datetime.now(timezone.utc),
        }
    )
    return session_obj


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session_obj = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if not _is_session_participant(session_obj, current_user):
        raise HTTPException(status_code=404, detail="Debate session not found")
    return session_obj


@router.patch("/{session_id}", response_model=SessionOut)
async def update_session(
    session_id: int,
    payload: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session_obj = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if not _is_session_participant(session_obj, current_user):
        raise HTTPException(status_code=404, detail="Debate session not found")

    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates:
        if updates["status"] == SessionStatus.IN_PROGRESS and not session_obj.started_at:
            session_obj.started_at = datetime.now(timezone.utc)
        if updates["status"] == SessionStatus.COMPLETED and not session_obj.ended_at:
            session_obj.ended_at = datetime.now(timezone.utc)

    for field, value in updates.items():
        setattr(session_obj, field, value)

    db.commit()
    db.refresh(session_obj)

    if "status" in updates and updates["status"] == SessionStatus.COMPLETED:
        turns_cursor = session_logs_collection.find(
            {"session_id": session_obj.id, "event": "debate_turn", "presentation_metrics": {"$ne": None}}
        )
        metrics_list = [t["presentation_metrics"] async for t in turns_cursor]

        fallacy_count = await fallacy_analysis_collection.count_documents({"session_id": session_obj.id})

        if metrics_list:
            avg_confidence = sum(m["confidence_score"] for m in metrics_list) / len(metrics_list)
            topic = db.query(DebateTopic).filter(DebateTopic.id == session_obj.topic_id).first()
            presentation_record = PresentationHistory(
                user_id=current_user.id,
                title=topic.title if topic else f"Debate session #{session_obj.id}",
                domain=PresentationDomain.OTHER,
                duration=session_obj.duration_minutes * 60,
                overall_score=avg_confidence,
                confidence_score=avg_confidence,
                fallacy_count=fallacy_count,
                status=PresentationStatus.COMPLETED,
            )
            db.add(presentation_record)
            db.commit()

        avg_scores = db.query(
            func.avg(DebateTurnScore.clarity),
            func.avg(DebateTurnScore.evidence_strength),
            func.avg(DebateTurnScore.rebuttal_quality),
            func.avg(DebateTurnScore.logical_consistency),
        ).filter(DebateTurnScore.session_id == session_obj.id).first()

        if avg_scores and avg_scores[0] is not None:
            valid_scores = [s for s in avg_scores if s is not None]
            session_obj.overall_score = sum(valid_scores) / len(valid_scores)
            db.commit()

        perf_avg = db.query(
            func.avg(DebateTurnScore.debate_performance_score),
            func.avg(DebateTurnScore.critical_thinking_score),
        ).filter(DebateTurnScore.session_id == session_obj.id).first()

        if perf_avg and perf_avg[0] is not None:
            session_obj.debate_performance_score = round(perf_avg[0], 1)
            session_obj.critical_thinking_score = round(perf_avg[1], 1)
            db.commit()

            breakdown_text = (
                f"Debate Performance Score: {session_obj.debate_performance_score}/100\n"
                f"Critical Thinking Score: {session_obj.critical_thinking_score}/100"
            )
            try:
                summary = generate_performance_summary(breakdown_text)
                await performance_summaries_collection.insert_one(
                    {
                        "session_id": session_obj.id,
                        "user_id": current_user.id,
                        "debate_performance_score": session_obj.debate_performance_score,
                        "critical_thinking_score": session_obj.critical_thinking_score,
                        "summary": summary.model_dump(),
                        "created_at": datetime.now(timezone.utc),
                    }
                )
            except Exception as e:
                logger.error(f"Performance summary generation failed for session {session_obj.id}: {e}")

    await session_logs_collection.insert_one(
        {
            "session_id": session_obj.id,
            "user_id": current_user.id,
            "event": f"status_changed_to_{session_obj.status.value}",
            "timestamp": datetime.now(timezone.utc),
        }
    )
    return session_obj


@router.delete("/{session_id}", status_code=204)
def cancel_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(can_manage_sessions),
):
    session_obj = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
    session_obj.status = SessionStatus.CANCELLED
    db.commit()
    return None