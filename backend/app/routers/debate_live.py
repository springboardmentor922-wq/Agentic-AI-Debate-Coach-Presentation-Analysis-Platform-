"""
Milestone 3 — AI Debate Simulation Engine, Live AI Debate, Audio
Upload pipeline, and AI Opponent personalities.

This router is additive: it does not modify the existing `/api/v1/debate`
routes in debate_sessions.py (session CRUD) or `/api/v1/analysis` routes in
analysis.py (turn-by-turn text analysis) — it reuses their collections and
service functions so a single session's data stays consistent everywhere.
"""
import asyncio
import logging
import os
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form

logger = logging.getLogger(__name__)

from app.core.database import (
    debate_sessions_collection,
    session_transcripts_collection,
    fallacy_reports_collection,
    argument_analysis_collection,
    debate_feedback_reports_collection,
    performance_scores_collection,
    presentation_analysis_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.debate import DebateSessionOut, DebateRecordingMetadata
from app.services import coach_review_service
from app.services.achievement_engine import evaluate_achievements_for_user
from app.services.certificate_engine import evaluate_certificates_for_user
from app.schemas.debate_simulation import (
    DebateTopicOut,
    DebateStartRequest,
    DebateLiveTurnRequest,
    PresentationAnalysisOut,
)
from app.services import topics_service, media_service, whisper_service, presentation_service, job_service
from app.services.fallacy_agent import detect_fallacy, analyze_argument, generate_feedback_report
from app.services.counterargument_service import generate_counterarguments
from app.agents.chatbot_engine import generate_opponent_rebuttal
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/v1/debate", tags=["AI Debate Simulation (Milestone 3)"])


async def _transcribe_with_retry(file_path: str, attempts: int = 2, delay_seconds: float = 1.5):
    """transcribe_file() already falls back OpenAI -> local internally; this
    retries the whole call in case *both* are transiently unavailable
    (e.g. a momentary network blip), rather than failing the job on the
    first hiccup."""
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return await whisper_service.transcribe_file(file_path)
        except whisper_service.TranscriptionUnavailableError as exc:
            last_error = exc
            if attempt < attempts:
                logger.warning("Transcription attempt %s/%s failed, retrying: %s", attempt, attempts, exc)
                await asyncio.sleep(delay_seconds)
    raise last_error


def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")


async def _get_owned_session(session_id: str, current_user: dict) -> dict:
    doc = await debate_sessions_collection.find_one({"_id": _object_id(session_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if doc["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have access to this session")
    return doc


def _serialize_session(doc: dict) -> DebateSessionOut:
    return DebateSessionOut(
        id=str(doc["_id"]),
        topic=doc["topic"],
        debate_format=doc["debate_format"],
        position=doc.get("position"),
        scheduled_at=doc.get("scheduled_at"),
        owner_id=doc["owner_id"],
        status=doc.get("status", "active"),
        created_at=doc["created_at"],
        updated_at=doc.get("updated_at"),
        recording=DebateRecordingMetadata(**doc["recording"]) if doc.get("recording") else None,
        recorded_at=doc.get("recorded_at"),
    )


# --------------------------------------------------------------------------
# PART 1 — Curated topics, stored in MongoDB (debate_topics collection)
# --------------------------------------------------------------------------

@router.on_event("startup")
async def _seed_topics_on_startup():
    await topics_service.ensure_seeded()


@router.get("/topics", response_model=list[DebateTopicOut])
async def get_topics(debate_format: str | None = None, current_user: dict = Depends(get_current_user)):
    docs = await topics_service.list_topics(debate_format=debate_format)
    return [
        DebateTopicOut(
            id=str(d["_id"]),
            title=d["title"],
            category=d["category"],
            difficulty=d["difficulty"],
            debate_format=d["debate_format"],
            popularity=d["popularity"],
        )
        for d in docs
    ]


# --------------------------------------------------------------------------
# PART 2 — Live AI Debate (start + turn-by-turn, with AI personality)
# --------------------------------------------------------------------------

@router.post("/start", response_model=DebateSessionOut, status_code=201)
async def start_debate(payload: DebateStartRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    """
    Starts a debate session. If no topic is supplied, a curated topic is
    picked from MongoDB for the chosen format. Stores the chosen
    ai_personality on the session so every subsequent turn/upload uses the
    same opponent consistently.
    """
    topic = payload.topic
    if not topic:
        picked = await topics_service.pick_random_topic(payload.debate_format)
        if not picked:
            raise HTTPException(status_code=400, detail=f"No curated topics available for format '{payload.debate_format}'")
        topic = picked["title"]

    now = datetime.utcnow().isoformat()
    doc = {
        "topic": topic,
        "debate_format": payload.debate_format,
        "position": payload.position,
        "scheduled_at": None,
        "owner_id": current_user["id"],
        "status": "active",
        "ai_personality": payload.ai_personality.value,
        "created_at": now,
        "updated_at": now,
    }
    result = await debate_sessions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_session(doc)


@router.post("/live")
async def live_turn(payload: DebateLiveTurnRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    """
    One turn of the live, multi-turn AI debate: user text in, AI opponent
    rebuttal out, with fallacy + argument analysis run and persisted exactly
    like /api/v1/analysis/debate/process-turn — this endpoint additionally
    respects the session's (or an override) ai_personality.
    """
    session = await _get_owned_session(payload.session_id, current_user)
    if session.get("status") not in ("active", "scheduled"):
        raise HTTPException(status_code=400, detail=f"Session is '{session.get('status')}' and cannot accept turns")

    personality = (payload.ai_personality.value if payload.ai_personality else session.get("ai_personality", "intermediate"))

    argument_report = await analyze_argument(payload.text)
    fallacy_report = await detect_fallacy(payload.text, argument_analysis=argument_report)
    now = datetime.utcnow().isoformat()

    await fallacy_reports_collection.insert_one({
        "session_id": payload.session_id, "user_id": current_user["id"],
        "input_text": payload.text, "report": fallacy_report.model_dump(), "created_at": now,
    })
    await argument_analysis_collection.insert_one({
        "session_id": payload.session_id, "user_id": current_user["id"],
        "input_text": payload.text, "analysis": argument_report.model_dump(), "created_at": now,
    })

    if session.get("status") == "scheduled":
        await debate_sessions_collection.update_one({"_id": session["_id"]}, {"$set": {"status": "active", "updated_at": now}})

    ai_rebuttal = await generate_opponent_rebuttal(
        topic=session["topic"],
        debate_format=session["debate_format"],
        user_text=payload.text,
        fallacy_flag=fallacy_report.model_dump(),
        ai_personality=personality,
    )

    turn_record = {
        "user_text": payload.text,
        "ai_rebuttal": ai_rebuttal,
        "ai_personality": personality,
        "fallacy_report": fallacy_report.model_dump(),
        "argument_analysis": argument_report.model_dump(),
        "timestamp": now,
    }
    await session_transcripts_collection.update_one(
        {"session_id": payload.session_id},
        {"$push": {"turns": turn_record}, "$setOnInsert": {"session_id": payload.session_id}},
        upsert=True,
    )

    return {
        "ai_rebuttal": ai_rebuttal,
        "ai_personality": personality,
        "fallacy_report": fallacy_report,
        "argument_analysis": argument_report,
    }


@router.post("/transcribe")
async def transcribe_live_turn(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    """
    Lightweight Whisper-only transcription used by the live mic recorder
    (Part 2) to fill in a turn's text before it is submitted to /debate/live
    for full analysis — kept separate from /upload-audio so every live turn
    doesn't pay for the full argument+fallacy+counterargument pipeline twice.
    """
    saved_path = await media_service.save_upload(file, kind="audio")
    try:
        result = await whisper_service.transcribe_file(saved_path)
        return {
            "transcript": result.text,
            "engine": result.engine,
            "fallback_reason": result.fallback_reason,
        }
    except whisper_service.TranscriptionUnavailableError as exc:
        return {"success": False, "message": str(exc), "transcript": ""}
    finally:
        media_service.cleanup(saved_path)


# --------------------------------------------------------------------------
# PART 3 — Audio Upload pipeline
# --------------------------------------------------------------------------

async def _process_audio_job(job_id: str, saved_path: str, user_id: str, session_id: str | None, duration_seconds: float, topic: str | None, debate_format: str | None) -> None:
    """Background task: everything that used to run inline in the request
    now runs here, updating the job's stage as it goes so the frontend can
    show real progress instead of a faked client-side sequence."""
    try:
        await job_service.set_stage(job_id, "transcribing", "Transcribing audio…")
        try:
            transcription = await _transcribe_with_retry(saved_path)
        except whisper_service.TranscriptionUnavailableError as exc:
            media_service.cleanup(saved_path)
            await job_service.fail_job(job_id, str(exc))
            return

        transcript = transcription.text
        if not transcript.strip():
            media_service.cleanup(saved_path)
            await job_service.fail_job(job_id, "No speech was detected in this audio file.")
            return

        await job_service.set_stage(job_id, "analyzing", "Analyzing arguments and checking for fallacies…")
        metrics = presentation_service.compute_speech_metrics(transcript, duration_seconds or 30.0)
        argument_report = await analyze_argument(transcript)
        fallacy_report = await detect_fallacy(transcript, argument_analysis=argument_report)
        counter = await generate_counterarguments(transcript, topic=topic)

        await job_service.set_stage(job_id, "scoring", "Scoring your presentation…")
        score = await presentation_service.score_presentation(transcript, metrics)

        await job_service.set_stage(job_id, "saving", "Saving your report…")
        now = datetime.utcnow().isoformat()
        doc = {
            "session_id": session_id,
            "user_id": user_id,
            "topic": topic,
            "debate_format": debate_format,
            "media_type": "audio",
            "audio_filename": os.path.basename(saved_path),  # real, persisted audio — kept on disk, never deleted below
            "transcript": transcript,
            "speech_metrics": metrics.model_dump(),
            "presentation_score": score.model_dump(),
            "argument_analysis": argument_report.model_dump(),
            "fallacy_report": fallacy_report.model_dump(),
            "counterarguments": counter.model_dump(),
            "created_at": now,
            "transcription_engine": transcription.engine,
            "transcription_fallback_reason": transcription.fallback_reason,
        }
        result = await presentation_analysis_collection.insert_one(doc)
        doc_id = str(result.inserted_id)

        await create_notification(
            user_id=user_id, type_="learning_milestone",
            title="Audio analysis ready",
            message=f"Your presentation score is {score.overall_score}/100.",
        )
        await job_service.complete_job(job_id, doc_id, f"Presentation score: {score.overall_score}/100")
    except Exception as exc:  # last-resort safety net: a background task can't raise back to the client
        logger.exception("upload-audio background job failed")
        media_service.cleanup(saved_path)
        await job_service.fail_job(job_id, f"Audio analysis failed: {exc}")


@router.post("/upload-audio", status_code=202)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session_id: str | None = Form(default=None),
    duration_seconds: float = Form(default=0.0),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    """Upload -> (background) Whisper transcription -> Argument Analysis ->
    Fallacy Detection -> Counterarguments -> Score -> save. Validation and
    the actual file save happen synchronously (so a bad upload fails
    immediately); everything after that runs as a background task. Returns
    a job id immediately — poll GET /api/v1/jobs/{job_id} for progress."""
    saved_path = await media_service.save_upload(file, kind="audio")  # validates extension/size, raises 400/413 synchronously

    topic = None
    debate_format = None
    if session_id:
        session = await _get_owned_session(session_id, current_user)
        topic = session["topic"]
        debate_format = session.get("debate_format")

    job = await job_service.create_job(current_user["id"], kind="audio")
    background_tasks.add_task(
        _process_audio_job, job["id"], saved_path, current_user["id"], session_id, duration_seconds, topic, debate_format
    )
    return {"job_id": job["id"], "status": job["status"], "progress": job["progress"]}


@router.get("/presentation-analysis", response_model=list[PresentationAnalysisOut])
async def list_presentation_analysis(limit: int = 10, current_user: dict = Depends(get_current_user)):
    cursor = presentation_analysis_collection.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(limit)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        items.append(PresentationAnalysisOut(**doc))
    return items


# --------------------------------------------------------------------------
# Finish debate — generates feedback report + records score (Part 9/10 tie-in)
# --------------------------------------------------------------------------

@router.post("/finish")
async def finish_debate(session_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    session = await _get_owned_session(session_id, current_user)

    transcript = await session_transcripts_collection.find_one({"session_id": session_id})
    turns = transcript.get("turns", []) if transcript else []
    if not turns:
        raise HTTPException(status_code=400, detail="This session has no recorded turns yet.")

    report = await generate_feedback_report(topic=session["topic"], turns=turns)
    now = datetime.utcnow().isoformat()

    await debate_feedback_reports_collection.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, "user_id": current_user["id"], "report": report.model_dump(), "updated_at": now},
         "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    await performance_scores_collection.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, "user_id": current_user["id"], "score": round(report.overall_rating * 10, 2), "created_at": now}},
        upsert=True,
    )
    await debate_sessions_collection.update_one(
        {"_id": session["_id"]}, {"$set": {"status": "completed", "updated_at": now}}
    )

    await create_notification(
        user_id=current_user["id"], type_="learning_milestone",
        title="Debate feedback ready",
        message=f'Your report for "{session["topic"]}" is ready — overall rating {report.overall_rating}/10.',
        related_session_id=session_id,
    )

    # Milestone 4: every completed debate automatically enters the coach
    # review queue, and unlocked achievements/certificates are re-evaluated
    # against the learner's real (now-updated) history.
    await coach_review_service.create_review_entry(
        session_id=session_id,
        learner_id=current_user["id"],
        topic=session["topic"],
        debate_format=session["debate_format"],
        ai_overall_score=round(report.overall_rating * 10, 2),
    )
    newly_unlocked_achievements = await evaluate_achievements_for_user(current_user["id"])
    newly_issued_certificates = await evaluate_certificates_for_user(current_user["id"])
    for a in newly_unlocked_achievements:
        await create_notification(
            user_id=current_user["id"], type_="achievement_unlocked",
            title="Achievement unlocked", message=f'You unlocked "{a["title"]}"!',
            related_session_id=session_id,
        )
    for c in newly_issued_certificates:
        await create_notification(
            user_id=current_user["id"], type_="certificate_issued",
            title="Certificate earned", message=f'You earned the "{c["title"]}" certificate!',
            related_session_id=session_id,
        )

    return {
        "session": _serialize_session(await debate_sessions_collection.find_one({"_id": session["_id"]})),
        "report": report,
        "newly_unlocked_achievements": newly_unlocked_achievements,
        "newly_issued_certificates": newly_issued_certificates,
    }
