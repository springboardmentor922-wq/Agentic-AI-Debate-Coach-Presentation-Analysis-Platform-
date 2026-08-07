"""
Milestone 4 — Learning Hub: Practice Exercises, Quizzes, Learning Materials,
AI Mentor.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import (
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    presentation_analysis_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.learning_hub import (
    PracticeExerciseOut, QuizTopicOut, QuizAttemptOut, QuizQuestionOut,
    QuizSubmission, LearningMaterialOut, MentorAskRequest, MentorMessageOut,
)
from app.services import practice_engine, quiz_engine, mentor_service
from app.services.learning_materials_service import recommend_materials

router = APIRouter(prefix="/api/v1", tags=["Learning Hub (Milestone 4)"])


async def _gather_evidence(user_id: str) -> dict:
    """Same real-evidence-only pattern as learning_plan.py's _gather_evidence
    — kept as a local copy here so this module doesn't depend on another
    router's private helper."""
    reports = [doc async for doc in debate_feedback_reports_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(5)]
    fallacies = [doc async for doc in fallacy_reports_collection.find({"user_id": user_id, "report.fallacy_detected": True}).sort("created_at", -1).limit(20)]
    presentations = [doc async for doc in presentation_analysis_collection.find({"user_id": user_id}).sort("created_at", -1).limit(3)]
    return {
        "recent_feedback_reports": [r["report"] for r in reports],
        "recent_fallacies": [{"type": f["report"].get("fallacy_type"), "severity": f["report"].get("severity")} for f in fallacies],
        "recent_presentation_scores": [
            {"speech_metrics": p["speech_metrics"], "presentation_score": p["presentation_score"]} for p in presentations
        ],
    }


def _weakness_keywords(evidence: dict) -> list[str]:
    keywords = []
    for r in evidence["recent_feedback_reports"]:
        keywords.extend(r.get("weaknesses", []))
        keywords.extend(r.get("logical_issues", []))
    for f in evidence["recent_fallacies"]:
        if f.get("type"):
            keywords.append(f["type"])
    return keywords


# --------------------------------------------------------------------------
# Practice Exercises
# --------------------------------------------------------------------------

@router.get("/practice-exercises", response_model=list[PracticeExerciseOut])
async def get_practice_exercises(current_user: dict = Depends(require_roles(UserRole.learner))):
    docs = await practice_engine.list_practice_exercises(current_user["id"])
    return [PracticeExerciseOut(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]


@router.post("/practice-exercises/generate", response_model=list[PracticeExerciseOut])
async def generate_practice_exercises(current_user: dict = Depends(require_roles(UserRole.learner))):
    evidence = await _gather_evidence(current_user["id"])
    if not evidence["recent_feedback_reports"] and not evidence["recent_fallacies"]:
        raise HTTPException(status_code=400, detail="Complete a debate first — exercises are generated from your real weaknesses.")
    docs = await practice_engine.generate_practice_exercises(current_user["id"], evidence)
    return [PracticeExerciseOut(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]


@router.post("/practice-exercises/{exercise_id}/complete", response_model=PracticeExerciseOut)
async def complete_practice_exercise(exercise_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    doc = await practice_engine.mark_exercise_completed(current_user["id"], exercise_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return PracticeExerciseOut(**{k: v for k, v in doc.items() if k != "_id"})


# --------------------------------------------------------------------------
# Quizzes
# --------------------------------------------------------------------------

@router.get("/quizzes", response_model=list[QuizTopicOut])
async def get_quiz_topics(current_user: dict = Depends(require_roles(UserRole.learner))):
    evidence = await _gather_evidence(current_user["id"])
    history = await quiz_engine.list_history(current_user["id"])
    return quiz_engine.recommend_topics(_weakness_keywords(evidence), history)


@router.post("/quizzes/{topic}/start", response_model=QuizAttemptOut)
async def start_quiz(topic: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    doc = await quiz_engine.start_quiz(current_user["id"], topic)
    return QuizAttemptOut(
        id=doc["id"], topic=doc["topic"],
        questions=[QuizQuestionOut(question=q["question"], options=q["options"]) for q in doc["questions"]],
        score=doc["score"], completed=doc["completed"], created_at=doc["created_at"],
    )


@router.post("/quizzes/attempt/{attempt_id}/submit")
async def submit_quiz(attempt_id: str, payload: QuizSubmission, current_user: dict = Depends(require_roles(UserRole.learner))):
    doc = await quiz_engine.submit_attempt(current_user["id"], attempt_id, payload.answers)
    if not doc:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    return {"score": doc["score"]}


# --------------------------------------------------------------------------
# Learning Materials
# --------------------------------------------------------------------------

@router.get("/learning-materials", response_model=list[LearningMaterialOut])
async def get_learning_materials(current_user: dict = Depends(get_current_user)):
    evidence = await _gather_evidence(current_user["id"])
    return recommend_materials(_weakness_keywords(evidence))


# --------------------------------------------------------------------------
# AI Mentor
# --------------------------------------------------------------------------

@router.post("/mentor/ask", response_model=MentorMessageOut)
async def ask_mentor(payload: MentorAskRequest, current_user: dict = Depends(require_roles(UserRole.learner))):
    evidence = await _gather_evidence(current_user["id"])
    answer = await mentor_service.ask_mentor(current_user["id"], payload.question, evidence)
    history = await mentor_service.get_history(current_user["id"], limit=1)
    latest = history[-1] if history else {"id": "", "role": "mentor", "text": answer, "created_at": ""}
    return MentorMessageOut(id=latest["id"], role="mentor", text=answer, created_at=latest.get("created_at", ""))


@router.get("/mentor/history", response_model=list[MentorMessageOut])
async def mentor_history(current_user: dict = Depends(require_roles(UserRole.learner))):
    docs = await mentor_service.get_history(current_user["id"])
    return [MentorMessageOut(**d) for d in docs]
