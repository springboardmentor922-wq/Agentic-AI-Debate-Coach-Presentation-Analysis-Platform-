import asyncio
import json
import os
import tempfile

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.postgres import get_db
import random

from app.models.debate_session import DebateSession, OpponentType, SessionStance
from app.models.debate_topic import DebateTopic
from app.schemas.debate import DebateMessageRequest, DebateMessageResponse, QuickstartRequest, QuickstartResponse
from app.models.user import User
from app.schemas.debate import DebateMessageRequest, DebateMessageResponse, PersonaSettings, AudioDebateMessageResponse
from app.services.debate_orchestrator import process_debate_message
from app.services.presentation_audio import transcribe_audio, compute_presentation_metrics
from app.services.coach_node import push_coaching_nudge

router = APIRouter(prefix="/api/v1/debate", tags=["Debate Engine"])


@router.post("/{session_id}/message", response_model=DebateMessageResponse)
async def send_debate_message(
    session_id: int,
    payload: DebateMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Debate session not found")

    try:
        ai_reply, turn_number, fallacy_result, score_result, argument_analysis, counterargument_result = await process_debate_message(
            db, session, payload.text, payload.persona, current_user.id,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Debate engine failed: {e}")

    return DebateMessageResponse(
        ai_message=ai_reply,
        turn_number=turn_number,
        user_fallacy_check=fallacy_result,
        user_score=score_result,
        argument_analysis=argument_analysis,
        counterarguments=counterargument_result.model_dump() if counterargument_result else None,
        challenge_questions=counterargument_result.challenge_questions if counterargument_result else [],
    )


@router.post("/{session_id}/audio-turn", response_model=AudioDebateMessageResponse)
async def send_audio_turn(
    session_id: int,
    audio: UploadFile = File(...),
    persona: str = Form(default="{}"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Debate session not found")

    persona_settings = PersonaSettings(**json.loads(persona))

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        transcript, duration = transcribe_audio(tmp_path)
    finally:
        os.remove(tmp_path)

    metrics = compute_presentation_metrics(transcript, duration)
    asyncio.create_task(push_coaching_nudge(session_id, current_user.id, metrics))

    try:
        ai_reply, turn_number, fallacy_result, score_result, argument_analysis = await process_debate_message(
            db, session, transcript, persona_settings, current_user.id, presentation_metrics=metrics.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Debate engine failed: {e}")

    return AudioDebateMessageResponse(
        ai_message=ai_reply,
        turn_number=turn_number,
        user_fallacy_check=fallacy_result,
        user_score=score_result,
        presentation_metrics=metrics,
        argument_analysis=argument_analysis,
    )

@router.post("/quickstart", response_model=QuickstartResponse, status_code=201)
def quickstart_debate(
    payload: QuickstartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    topic = None

    if payload.topic_id:
        topic = db.query(DebateTopic).filter(DebateTopic.id == payload.topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
    else:
        # "Surprise me" — weight toward topics this learner hasn't attempted yet
        attempted_ids = {
            s.topic_id
            for s in db.query(DebateSession).filter(DebateSession.user_id == current_user.id).all()
        }
        all_topics = db.query(DebateTopic).all()
        if not all_topics:
            raise HTTPException(status_code=404, detail="No topics available yet")

        unattempted = [t for t in all_topics if t.id not in attempted_ids]
        topic = random.choice(unattempted) if unattempted else random.choice(all_topics)

    session = DebateSession(
        user_id=current_user.id,
        topic_id=topic.id,
        stance=random.choice([SessionStance.FOR, SessionStance.AGAINST]),
        opponent_type=OpponentType.AI,
        duration_minutes=10,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return QuickstartResponse(session_id=session.id, topic_id=topic.id)