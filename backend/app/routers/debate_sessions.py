from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import (
    debate_sessions_collection,
    session_transcripts_collection,
    performance_scores_collection,
    debate_feedback_reports_collection,
    presentation_analysis_collection,
    fallacy_reports_collection,
    coach_assignments_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.debate import (
    DebateSessionCreate,
    DebateSessionUpdate,
    DebateSessionStatusUpdate,
    DebateSessionOut,
    DebateRecordingMetadata,
)

router = APIRouter(prefix="/api/v1/debate", tags=["Debate Sessions"])

# Only these transitions are allowed via the generic status endpoint.
# NOTE: 'completed' is intentionally NOT reachable from here. The only
# path to 'completed' is POST /api/v1/debate/finish (debate_live.py),
# which synchronously generates the feedback report, performance score,
# and coach-review entry before flipping the status. Allowing 'completed'
# here would let a session end up in that state with none of that AI
# output ever generated — which is exactly what produced orphaned
# "Pending Review" / "No AI Report Generated" sessions.
_ALLOWED_TRANSITIONS = {
    "scheduled": {"active", "cancelled"},
    "active": {"paused", "cancelled"},
    "paused": {"active", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def _serialize(doc: dict) -> DebateSessionOut:
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


def _object_id(session_id: str) -> ObjectId:
    try:
        return ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session id")


async def _get_owned_session(session_id: str, current_user: dict) -> dict:
    doc = await debate_sessions_collection.find_one({"_id": _object_id(session_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if doc["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have access to this session")
    return doc


@router.post("/sessions", response_model=DebateSessionOut, status_code=201)
async def create_session(payload: DebateSessionCreate, current_user: dict = Depends(require_roles(UserRole.learner))):
    now = datetime.utcnow().isoformat()
    doc = {
        "topic": payload.topic,
        "debate_format": payload.debate_format.value,
        "position": payload.position,
        "scheduled_at": payload.scheduled_at,
        "owner_id": current_user["id"],
        "status": "scheduled" if payload.scheduled_at else "active",
        "created_at": now,
        "updated_at": now,
    }
    result = await debate_sessions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.get("/sessions", response_model=list[DebateSessionOut])
async def list_my_sessions(current_user: dict = Depends(get_current_user)):
    cursor = debate_sessions_collection.find({"owner_id": current_user["id"]}).sort("created_at", -1)
    return [_serialize(doc) async for doc in cursor]


@router.get("/sessions/upcoming", response_model=list[DebateSessionOut])
async def list_upcoming_sessions(current_user: dict = Depends(get_current_user)):
    """Learner-created sessions with status 'scheduled', soonest first. No sessions are ever auto-generated."""
    cursor = debate_sessions_collection.find(
        {"owner_id": current_user["id"], "status": "scheduled"}
    ).sort("scheduled_at", 1)
    return [_serialize(doc) async for doc in cursor]


@router.get("/sessions/history")
async def list_debate_history(current_user: dict = Depends(get_current_user)):
    """
    Every completed debate for this learner, enriched with its real score
    (from the generated feedback report, if any) and recording duration.
    Sessions without a generated report yet show score=null rather than a
    fabricated number.
    """
    cursor = debate_sessions_collection.find(
        {"owner_id": current_user["id"], "status": "completed"}
    ).sort("updated_at", -1)

    items = []
    async for doc in cursor:
        session_id = str(doc["_id"])
        perf = await performance_scores_collection.find_one({"session_id": session_id})
        score = perf["score"] if perf else None

        duration_seconds = None
        if doc.get("recording") and doc["recording"].get("duration_seconds"):
            duration_seconds = doc["recording"]["duration_seconds"]

        if score is None:
            result_label = "Pending Review"
        elif score >= 75:
            result_label = "Strong"
        elif score >= 50:
            result_label = "Fair"
        else:
            result_label = "Needs Work"

        items.append({
            "id": session_id,
            "topic": doc["topic"],
            "format": doc["debate_format"],
            "date": doc.get("updated_at"),
            "duration_seconds": duration_seconds,
            "score": score,
            "result": result_label,
        })

    return {"items": items, "total": len(items)}


@router.get("/sessions/{session_id}", response_model=DebateSessionOut)
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    doc = await _get_owned_session(session_id, current_user)
    return _serialize(doc)


@router.get("/sessions/{session_id}/transcript")
async def get_session_transcript(session_id: str, current_user: dict = Depends(get_current_user)):
    """Real turn-by-turn transcript for this session (learner argument + AI
    opponent reply per turn), used by the AI Analysis detail page and PDF
    reports. Empty list if no turns were recorded, never fabricated content."""
    doc = await _get_owned_session(session_id, current_user)
    transcript = await session_transcripts_collection.find_one({"session_id": session_id})
    return {"session_id": session_id, "turns": transcript.get("turns", []) if transcript else []}


@router.put("/sessions/{session_id}", response_model=DebateSessionOut)
async def update_session(
    session_id: str, payload: DebateSessionUpdate, current_user: dict = Depends(require_roles(UserRole.learner))
):
    """Edit a session's topic/format/position/schedule. Only allowed while
    the session hasn't finished (not completed/cancelled)."""
    doc = await _get_owned_session(session_id, current_user)
    if doc.get("status") in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot edit a session that has ended")

    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if "debate_format" in updates:
        updates["debate_format"] = updates["debate_format"].value
    if updates:
        updates["updated_at"] = datetime.utcnow().isoformat()
        await debate_sessions_collection.update_one({"_id": doc["_id"]}, {"$set": updates})
    doc = await debate_sessions_collection.find_one({"_id": doc["_id"]})
    return _serialize(doc)


@router.patch("/sessions/{session_id}/status", response_model=DebateSessionOut)
async def update_session_status(
    session_id: str, payload: DebateSessionStatusUpdate, current_user: dict = Depends(require_roles(UserRole.learner))
):
    """Session status management: scheduled -> active -> paused, or cancel at
    any point. Reaching 'completed' is intentionally not possible here —
    only POST /api/v1/debate/finish can complete a session, since that is
    the endpoint that generates the AI feedback report and score."""
    doc = await _get_owned_session(session_id, current_user)
    current_status = doc.get("status", "active")
    target_status = payload.status.value

    if target_status not in _ALLOWED_TRANSITIONS.get(current_status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot move session from '{current_status}' to '{target_status}'",
        )

    now = datetime.utcnow().isoformat()
    await debate_sessions_collection.update_one(
        {"_id": doc["_id"]}, {"$set": {"status": target_status, "updated_at": now}}
    )
    doc = await debate_sessions_collection.find_one({"_id": doc["_id"]})
    return _serialize(doc)


@router.patch("/sessions/{session_id}/cancel", response_model=DebateSessionOut)
async def cancel_session(session_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    """Convenience shortcut for the common 'cancel' action."""
    doc = await _get_owned_session(session_id, current_user)
    current_status = doc.get("status", "active")
    if "cancelled" not in _ALLOWED_TRANSITIONS.get(current_status, set()):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a session that is already '{current_status}'")

    now = datetime.utcnow().isoformat()
    await debate_sessions_collection.update_one(
        {"_id": doc["_id"]}, {"$set": {"status": "cancelled", "updated_at": now}}
    )
    doc = await debate_sessions_collection.find_one({"_id": doc["_id"]})
    return _serialize(doc)


@router.get("/sessions/{session_id}/transcript")
async def get_transcript(session_id: str, current_user: dict = Depends(get_current_user)):
    await _get_owned_session(session_id, current_user)
    doc = await session_transcripts_collection.find_one({"session_id": session_id})
    return doc.get("turns", []) if doc else []


@router.delete("/sessions/{session_id}", status_code=200)
async def delete_session(session_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    """Completes CRUD: permanently removes a session and its transcript."""
    doc = await _get_owned_session(session_id, current_user)
    await debate_sessions_collection.delete_one({"_id": doc["_id"]})
    await session_transcripts_collection.delete_one({"session_id": session_id})
    return {"message": "Debate session deleted"}


@router.post("/sessions/{session_id}/recording", response_model=DebateSessionOut)
async def attach_recording(
    session_id: str, payload: DebateRecordingMetadata, current_user: dict = Depends(require_roles(UserRole.learner))
):
    """
    Debate recording metadata (Module 3): attaches the URL/duration/format of
    an uploaded debate recording to a session. Actual file storage is handled
    by the client's upload step (e.g. to object storage); this endpoint
    records the resulting metadata against the session.
    """
    doc = await _get_owned_session(session_id, current_user)
    now = datetime.utcnow().isoformat()
    await debate_sessions_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"recording": payload.model_dump(), "recorded_at": now, "updated_at": now}},
    )
    doc = await debate_sessions_collection.find_one({"_id": doc["_id"]})
    return _serialize(doc)


# =========================================================================
# Comprehensive Scoring Report — merges every score the platform has
# actually computed for a session into one consistent report, shown the
# same way to Learner, Coach, Educator, and Admin (role only gates *access*,
# never which fields are shown, so a coach and a learner see identical data
# for the same session — no divergent or duplicated scoring logic).
# =========================================================================
async def _can_view_session_report(current_user: dict, owner_user_id: str) -> bool:
    if current_user["role"] in ("educator", "administrator"):
        return True
    if current_user["id"] == owner_user_id:
        return True
    if current_user["role"] == "debate_coach":
        assignment = await coach_assignments_collection.find_one(
            {"coach_id": current_user["id"], "learner_id": owner_user_id}
        )
        return assignment is not None
    return False


@router.get("/sessions/{session_id}/comprehensive-report")
async def comprehensive_report(session_id: str, current_user: dict = Depends(get_current_user)):
    """
    One unified report per debate/presentation, combining:
    - Debate Feedback Report (Argument Quality, Logical Reasoning, Evidence
      Usage, Rebuttal Quality, Communication Skills, Overall Rating)
    - Presentation Analysis, if the learner also submitted a recording for
      this session (Confidence, Fluency, Pronunciation, Grammar, Speaking
      Pace, Persuasiveness)
    - Fallacies detected during the session
    - Time Management, computed from the session's real start/end timestamps
      (no fabricated data — omitted if the session was never completed)
    - Body Language: explicitly marked unavailable — no computer-vision
      analysis is implemented in this build, and it is never faked as a number.
    """
    try:
        oid = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session id")

    session = await debate_sessions_collection.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    owner_id = session.get("owner_id", "")
    if not await _can_view_session_report(current_user, owner_id):
        raise HTTPException(status_code=403, detail="You do not have permission to view this report")

    debate_report_doc = await debate_feedback_reports_collection.find_one({"session_id": session_id})
    presentation_doc = await presentation_analysis_collection.find_one(
        {"session_id": session_id}, sort=[("created_at", -1)]
    )
    fallacy_count = await fallacy_reports_collection.count_documents(
        {"session_id": session_id, "report.fallacy_detected": True}
    )

    time_management = None
    if session.get("status") == "completed" and session.get("created_at") and session.get("updated_at"):
        try:
            start = datetime.fromisoformat(session["created_at"])
            end = datetime.fromisoformat(session["updated_at"])
            time_management = {"duration_seconds": round((end - start).total_seconds(), 1)}
        except ValueError:
            time_management = None

    debate_scores = None
    if debate_report_doc:
        r = debate_report_doc["report"]
        debate_scores = {
            "argument_quality": r.get("argument_quality"),
            "logical_reasoning": r.get("logical_consistency"),
            "evidence_usage": r.get("evidence_usage"),
            "rebuttal_quality": r.get("rebuttal_effectiveness"),
            "communication_skills": r.get("communication_skills"),
            "overall_rating": r.get("overall_rating"),
            "strengths": r.get("strengths", []),
            "weaknesses": r.get("weaknesses", []),
            "recommended_improvements": r.get("recommended_improvements", []),
            "final_summary": r.get("final_summary"),
        }

    presentation_scores = None
    if presentation_doc:
        p = presentation_doc["presentation_score"]
        presentation_scores = {
            "confidence": p.get("confidence_score"),
            "fluency": p.get("fluency_score"),
            "pronunciation": p.get("pronunciation_score"),
            "grammar": p.get("grammar_score"),
            "speaking_pace": p.get("pacing_score"),
            "persuasiveness": p.get("persuasion_score"),
            "clarity": p.get("clarity_score"),
            "engagement": p.get("engagement_score"),
            "overall_presentation_score": p.get("overall_score"),
            "strengths": p.get("strengths", []),
            "weaknesses": p.get("weaknesses", []),
            "improvement_suggestions": p.get("improvement_suggestions", []),
        }

    overall_candidates = []
    if debate_scores and debate_scores["overall_rating"] is not None:
        overall_candidates.append(debate_scores["overall_rating"] * 10)  # normalize 0-10 -> 0-100
    if presentation_scores and presentation_scores["overall_presentation_score"] is not None:
        overall_candidates.append(presentation_scores["overall_presentation_score"])
    overall_performance = round(sum(overall_candidates) / len(overall_candidates), 1) if overall_candidates else None

    return {
        "session_id": session_id,
        "topic": session.get("topic"),
        "debate_format": session.get("debate_format"),
        "learner_id": owner_id,
        "status": session.get("status"),
        "debate_scores": debate_scores,
        "presentation_scores": presentation_scores,
        "fallacies_detected_count": fallacy_count,
        "time_management": time_management,
        "body_language": {
            "available": False,
            "note": "Body language scoring requires video + computer-vision analysis, which is not implemented in this build.",
        },
        "overall_performance": overall_performance,
        "has_debate_analysis": debate_scores is not None,
        "has_presentation_analysis": presentation_scores is not None,
    }
