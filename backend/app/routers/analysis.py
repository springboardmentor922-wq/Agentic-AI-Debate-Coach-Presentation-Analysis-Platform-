from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import (
    fallacy_reports_collection,
    argument_analysis_collection,
    session_transcripts_collection,
    debate_sessions_collection,
    debate_feedback_reports_collection,
    performance_scores_collection,
    counterargument_reports_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.fallacy import (
    FallacyAnalysisRequest,
    FallacyReport,
    ArgumentAnalysisRequest,
    ArgumentAnalysis,
    DebateFeedbackReport,
)
from app.schemas.debate import DebateTurnRequest
from app.schemas.debate_simulation import CounterargumentBundle
from app.services.fallacy_agent import detect_fallacy, analyze_argument, generate_feedback_report
from app.services.counterargument_service import generate_counterarguments
from app.agents.chatbot_engine import generate_opponent_rebuttal

router = APIRouter(prefix="/api/v1/analysis", tags=["Argument & Fallacy Analysis"])


def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")


@router.post("/fallacy", response_model=FallacyReport)
async def analyze_fallacy(payload: FallacyAnalysisRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    """Module 5: Logical Fallacy Detection Engine — Agent 1: The Auditor."""
    report = await detect_fallacy(payload.text)

    await fallacy_reports_collection.insert_one(
        {
            "session_id": payload.session_id,
            "user_id": current_user["id"],
            "input_text": payload.text,
            "report": report.model_dump(),
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    return report


@router.post("/argument", response_model=ArgumentAnalysis)
async def analyze_argument_endpoint(payload: ArgumentAnalysisRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    """Module 4: Argument Analysis Engine — Agent 1: The Auditor."""
    result = await analyze_argument(payload.text)

    await argument_analysis_collection.insert_one(
        {
            "session_id": payload.session_id,
            "user_id": current_user["id"],
            "input_text": payload.text,
            "analysis": result.model_dump(),
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    return result


@router.post("/counterargument", response_model=CounterargumentBundle)
async def generate_counterargument_endpoint(
    payload: ArgumentAnalysisRequest, current_user: dict = Depends(require_roles(UserRole.learner))
):
    """Module 6: Counterargument Generation Engine — standalone tool, backs
    the Counterargument Generator sidebar page (also reused by the global
    chatbot's Counterargument Agent)."""
    result = await generate_counterarguments(payload.text, topic=None)

    await counterargument_reports_collection.insert_one(
        {
            "session_id": payload.session_id,
            "user_id": current_user["id"],
            "input_text": payload.text,
            "result": result.model_dump(),
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    return result


@router.post("/debate/process-turn")
async def process_turn(payload: DebateTurnRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    """
    Live API Endpoint Route (Step 5 of the PDF spec).
    Runs fallacy detection + argument analysis on the user's turn, saves logs to
    MongoDB (transcript + fallacy_reports + argument_analysis), then generates the
    AI opponent's rebuttal (Agent 2), routed dynamically by the session's debate_format.
    """
    session = await debate_sessions_collection.find_one({"_id": _object_id(payload.session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if session["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have access to this session")
    if session.get("status") not in ("active", "scheduled"):
        raise HTTPException(status_code=400, detail=f"Session is '{session.get('status')}' and cannot accept turns")

    # Two-stage pipeline (spec requirement): Module 4 extracts and scores the
    # argument first; Module 5 then validates against those structured
    # results rather than re-reading the raw text in isolation.
    argument_report = await analyze_argument(payload.text)
    fallacy_report = await detect_fallacy(payload.text, argument_analysis=argument_report)

    now = datetime.utcnow().isoformat()

    await fallacy_reports_collection.insert_one(
        {
            "session_id": payload.session_id,
            "user_id": current_user["id"],
            "input_text": payload.text,
            "report": fallacy_report.model_dump(),
            "created_at": now,
        }
    )
    await argument_analysis_collection.insert_one(
        {
            "session_id": payload.session_id,
            "user_id": current_user["id"],
            "input_text": payload.text,
            "analysis": argument_report.model_dump(),
            "created_at": now,
        }
    )

    # First turn on a scheduled session moves it to active automatically.
    if session.get("status") == "scheduled":
        await debate_sessions_collection.update_one(
            {"_id": session["_id"]}, {"$set": {"status": "active", "updated_at": now}}
        )

    ai_rebuttal = await generate_opponent_rebuttal(
        topic=session["topic"],
        debate_format=session["debate_format"],
        user_text=payload.text,
        fallacy_flag=fallacy_report.model_dump(),
    )

    turn_record = {
        "user_text": payload.text,
        "ai_rebuttal": ai_rebuttal,
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
        "fallacy_report": fallacy_report,
        "argument_analysis": argument_report,
    }


@router.get("/session/{session_id}/fallacies")
async def get_session_fallacies(session_id: str, current_user: dict = Depends(get_current_user)):
    """All logical fallacies detected across this session's turns, for the
    current user only. Empty list if none were detected — never fabricated."""
    cursor = fallacy_reports_collection.find(
        {"user_id": current_user["id"], "session_id": session_id, "report.fallacy_detected": True}
    ).sort("created_at", 1)
    return {"items": [doc["report"] async for doc in cursor]}


@router.get("/history")
async def get_analysis_history(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """
    Module 11 (Dashboard & Analytics) support: a merged, paginated history of every
    argument analysis + fallacy report the current user has generated, newest first.
    Each entry pairs an argument analysis with the fallacy report from the same
    input where available (they are always written together by this router).
    """
    arg_cursor = (
        argument_analysis_collection.find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    arg_docs = [doc async for doc in arg_cursor]

    total = await argument_analysis_collection.count_documents({"user_id": current_user["id"]})

    items = []
    for doc in arg_docs:
        fallacy_doc = await fallacy_reports_collection.find_one(
            {
                "user_id": current_user["id"],
                "input_text": doc["input_text"],
                "session_id": doc.get("session_id"),
            },
            sort=[("created_at", -1)],
        )
        items.append(
            {
                "id": str(doc["_id"]),
                "session_id": doc.get("session_id"),
                "input_text": doc["input_text"],
                "argument_analysis": doc["analysis"],
                "fallacy_report": fallacy_doc["report"] if fallacy_doc else None,
                "created_at": doc["created_at"],
            }
        )

    return {"items": items, "total": total, "limit": limit, "skip": skip}


@router.get("/history/{analysis_id}")
async def get_analysis_detail(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Single analysis record for the feedback report page."""
    doc = await argument_analysis_collection.find_one({"_id": _object_id(analysis_id)})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Analysis not found")

    fallacy_doc = await fallacy_reports_collection.find_one(
        {
            "user_id": current_user["id"],
            "input_text": doc["input_text"],
            "session_id": doc.get("session_id"),
        },
        sort=[("created_at", -1)],
    )

    return {
        "id": str(doc["_id"]),
        "session_id": doc.get("session_id"),
        "input_text": doc["input_text"],
        "argument_analysis": doc["analysis"],
        "fallacy_report": fallacy_doc["report"] if fallacy_doc else None,
        "created_at": doc["created_at"],
    }


# --------------------------------------------------------------------------
# Debate Feedback Report Generation (Milestone 2)
# --------------------------------------------------------------------------

@router.post("/debate/{session_id}/report", response_model=DebateFeedbackReport)
async def generate_session_feedback_report(
    session_id: str, current_user: dict = Depends(require_roles(UserRole.learner))
):
    """
    Generates (and stores) one synthesized feedback report — strengths,
    weaknesses, missing evidence, logical issues, recommended improvements,
    final summary, overall rating — covering every turn recorded for this
    debate session so far.
    """
    session = await debate_sessions_collection.find_one({"_id": _object_id(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if session["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You do not have access to this session")

    transcript = await session_transcripts_collection.find_one({"session_id": session_id})
    turns = transcript.get("turns", []) if transcript else []
    if not turns:
        raise HTTPException(
            status_code=400, detail="This session has no recorded turns yet — nothing to generate a report from."
        )

    report = await generate_feedback_report(topic=session["topic"], turns=turns)

    now = datetime.utcnow().isoformat()
    await debate_feedback_reports_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "session_id": session_id,
                "user_id": current_user["id"],
                "report": report.model_dump(),
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    # Record a performance-score entry for this session's overall_rating so
    # the dashboard summary and leaderboard can aggregate real scores
    # without recomputing from every report on each request. Idempotent per
    # session: re-generating a report updates the same score record.
    await performance_scores_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "session_id": session_id,
                "user_id": current_user["id"],
                "score": round(report.overall_rating * 10, 2),
                "created_at": now,
            }
        },
        upsert=True,
    )

    return report


@router.get("/debate/{session_id}/report", response_model=DebateFeedbackReport)
async def get_session_feedback_report(session_id: str, current_user: dict = Depends(get_current_user)):
    """Fetches a previously generated feedback report for a session, if one exists."""
    doc = await debate_feedback_reports_collection.find_one({"session_id": session_id})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=404, detail="No feedback report has been generated for this session yet."
        )
    return doc["report"]
