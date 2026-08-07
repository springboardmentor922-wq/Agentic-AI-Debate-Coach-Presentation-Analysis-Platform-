"""
Milestone 4 — Educator Analytics, Topic Assignment, and Final Review/Approval.
"""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.core.database import (
    session_transcripts_collection,
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    debate_sessions_collection,
    presentation_analysis_collection,
    debate_topics_collection,
    announcements_collection,
    users_collection,
    notifications_collection,
)
from app.core.deps import require_roles
from app.schemas.user import UserRole
from app.schemas.educator import (
    LearnerSummaryOut, ClassroomAnalyticsOut, LearnerComparisonOut,
    TopicAssignmentCreate, TopicAssignmentOut,
)
from app.schemas.coach_review import CoachReviewOut, EducatorReviewSubmit
from app.services import educator_analytics_service as svc
from app.services import coach_review_service, skill_gap_service
from app.routers.coaching_plans import generate_and_store_plan
from app.routers.notifications import create_notification
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/educator", tags=["Educator Analytics"])


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid id")


class RubricIn(BaseModel):
    title: str
    criteria: list[str] = Field(default_factory=list)
    debate_format: str = "one_on_one"


class AnnouncementIn(BaseModel):
    title: str
    message: str


@router.get("/learners", response_model=list[LearnerSummaryOut])
async def get_all_learners(current_user: dict = Depends(require_roles(UserRole.educator))):
    return await svc.list_all_learners()


@router.get("/classroom-analytics", response_model=list[ClassroomAnalyticsOut])
async def get_classroom_analytics(current_user: dict = Depends(require_roles(UserRole.educator))):
    return await svc.classroom_analytics()


@router.get("/compare", response_model=LearnerComparisonOut)
async def compare_learners(
    learner_ids: list[str] = Query(..., description="Repeat the param per learner id"),
    current_user: dict = Depends(require_roles(UserRole.educator)),
):
    learners = await svc.compare_learners(learner_ids)
    return LearnerComparisonOut(learners=learners)


@router.post("/assign-topic", response_model=TopicAssignmentOut)
async def assign_topic(payload: TopicAssignmentCreate, current_user: dict = Depends(require_roles(UserRole.educator))):
    doc = await svc.assign_topic(
        current_user["id"], payload.learner_id, payload.topic, payload.debate_format, payload.note, payload.due_at
    )
    return TopicAssignmentOut(id=str(doc["_id"]), educator_id=doc["educator_id"], learner_id=doc["learner_id"],
                               learner_name="", topic=doc["topic"], debate_format=doc["debate_format"],
                               note=doc.get("note"), due_at=doc.get("due_at"), created_at=doc["created_at"],
                               completed=False)


@router.get("/assignments", response_model=list[TopicAssignmentOut])
async def get_assignments(current_user: dict = Depends(require_roles(UserRole.educator))):
    return await svc.list_assignments(current_user["id"])


@router.get("/reports/export")
async def export_classroom_report(current_user: dict = Depends(require_roles(UserRole.educator))):
    """Exports real classroom analytics as CSV — no fabricated rows."""
    classrooms = await svc.classroom_analytics()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Classroom", "Learner Count", "Total Sessions Completed", "Average Score"])
    for c in classrooms:
        writer.writerow([c["classroom"], c["learner_count"], c["total_sessions_completed"], c["average_score"]])
    buf.seek(0)
    return StreamingResponse(
        buf, media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=classroom_report.csv"},
    )


# --------------------------------------------------------------------------
# Final review, grading, and approval — the last stage of the
# AI -> Coach -> Educator -> Learner workflow. Only debates a Coach has
# already reviewed (status='reviewed') appear here; approving one publishes
# the final report (AI + Coach + Educator scores) back to the learner.
# --------------------------------------------------------------------------

@router.get("/review-queue", response_model=list[CoachReviewOut])
async def get_educator_review_queue(
    status: str | None = Query(default=None, description="Omit for pending queue, or 'educator_approved' for finalized reports"),
    current_user: dict = Depends(require_roles(UserRole.educator)),
):
    return await coach_review_service.list_educator_queue(status=status)


@router.get("/review/{review_id}")
async def get_educator_review_detail(review_id: str, current_user: dict = Depends(require_roles(UserRole.educator))):
    """Full detail for one review: coach's write-up + real transcript + real AI report,
    exactly what the educator needs to make a final grading decision."""
    review = await coach_review_service.get_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    transcript = await session_transcripts_collection.find_one({"session_id": review["session_id"]})
    report = await debate_feedback_reports_collection.find_one({"session_id": review["session_id"]})
    fallacies = [
        doc async for doc in fallacy_reports_collection.find(
            {"session_id": review["session_id"], "report.fallacy_detected": True}
        )
    ]

    return {
        "review": review,
        "transcript": transcript.get("turns", []) if transcript else [],
        "ai_report": report.get("report") if report else None,
        "fallacies_detected": [f["report"] for f in fallacies],
    }


@router.post("/review/{review_id}/approve", response_model=CoachReviewOut)
async def approve_review(
    review_id: str, payload: EducatorReviewSubmit, current_user: dict = Depends(require_roles(UserRole.educator))
):
    existing = await coach_review_service.get_review(review_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")
    if existing["status"] != "reviewed":
        raise HTTPException(
            status_code=400,
            detail="This debate hasn't been reviewed by a Debate Coach yet, so it can't be given final approval.",
        )

    review = await coach_review_service.submit_educator_review(review_id, current_user["id"], payload.model_dump())

    # Publish back to the learner — this is the final step of the pipeline,
    # so the notification explicitly surfaces all three scores.
    await create_notification(
        user_id=review["learner_id"],
        type_="educator_feedback",
        title="Your final debate report is ready",
        message=(
            f'Your educator finalized the report for "{review["topic"]}" — '
            f'AI Score: {review.get("ai_overall_score", "—")}, '
            f'Coach Score: {review.get("coach_score", "—")}, '
            f'Educator Score: {review.get("educator_score", "—")}.'
        ),
        related_session_id=review["session_id"],
    )

    try:
        await generate_and_store_plan(review["learner_id"], review["session_id"])
    except Exception:
        pass

    return review


# =========================================================================
# Debate Sessions — every session across every learner (educator sees the
# whole platform's learners, unlike a coach's roster-scoped view).
# =========================================================================
@router.get("/debate-sessions")
async def educator_debate_sessions(current_user: dict = Depends(require_roles(UserRole.educator))):
    cursor = debate_sessions_collection.find({}).sort("created_at", -1).limit(150)
    out = []
    async for s in cursor:
        out.append(
            {
                "id": str(s["_id"]),
                "learner_id": s.get("owner_id"),
                "topic": s.get("topic"),
                "debate_format": s.get("debate_format"),
                "status": s.get("status"),
                "created_at": s.get("created_at"),
            }
        )
    return out


# =========================================================================
# Presentation Reports — real presentation analyses across all learners.
# =========================================================================
@router.get("/presentation-reports")
async def educator_presentation_reports(current_user: dict = Depends(require_roles(UserRole.educator))):
    cursor = presentation_analysis_collection.find({}).sort("created_at", -1).limit(150)
    out = []
    async for p in cursor:
        learner = await users_collection.find_one({"_id": _oid(p["user_id"])}) if p.get("user_id") else None
        out.append(
            {
                "id": str(p["_id"]),
                "user_id": p["user_id"],
                "learner_name": learner.get("full_name") if learner else None,
                "session_id": p.get("session_id"),
                "topic": p.get("topic"),
                "audio_filename": p.get("audio_filename"),
                "created_at": p.get("created_at"),
                "speech_metrics": p.get("speech_metrics"),
                "presentation_score": p.get("presentation_score"),
                "transcript": p.get("transcript"),
            }
        )
    return out


# =========================================================================
# Skill Gap Analysis — filterable by learner or department, with historical
# trend, strengths/weaknesses, improvement %, and recommendations.
# =========================================================================
@router.get("/skill-gap")
async def educator_skill_gap(
    learner_id: str | None = None,
    department: str | None = None,
    current_user: dict = Depends(require_roles(UserRole.educator)),
):
    # Educators see the whole platform by default (base scope = None); a
    # department/learner filter narrows that, same helper the coach uses.
    target_ids = await skill_gap_service.resolve_learner_ids(None, learner_id, department)
    return await skill_gap_service.compute_skill_gap(target_ids)


# =========================================================================
# Practice Topics — read-only browse of the same real topics collection
# Content Management (Admin) maintains and learners practice with.
# =========================================================================
@router.get("/topics")
async def educator_topics(current_user: dict = Depends(require_roles(UserRole.educator))):
    cursor = debate_topics_collection.find({}).sort("popularity", -1)
    out = []
    async for t in cursor:
        out.append(
            {
                "id": str(t["_id"]),
                "title": t.get("title", ""),
                "category": t.get("category", "General"),
                "difficulty": t.get("difficulty", "beginner"),
                "debate_format": t.get("debate_format", "one_on_one"),
                "popularity": t.get("popularity", 50),
            }
        )
    return out


# =========================================================================
# Rubrics & Criteria — real, persisted grading rubrics an educator creates.
# =========================================================================
@router.get("/rubrics")
async def list_rubrics(current_user: dict = Depends(require_roles(UserRole.educator))):
    cursor = rubrics_collection.find({"educator_id": current_user["id"]}).sort("created_at", -1)
    out = []
    async for r in cursor:
        out.append({"id": str(r["_id"]), "title": r["title"], "criteria": r["criteria"], "debate_format": r["debate_format"], "created_at": r["created_at"]})
    return out


@router.post("/rubrics", status_code=status.HTTP_201_CREATED)
async def create_rubric(payload: RubricIn, current_user: dict = Depends(require_roles(UserRole.educator))):
    doc = {**payload.model_dump(), "educator_id": current_user["id"], "created_at": datetime.utcnow().isoformat()}
    result = await rubrics_collection.insert_one(doc)
    return {"id": str(result.inserted_id), **payload.model_dump(), "created_at": doc["created_at"]}


@router.delete("/rubrics/{rubric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rubric(rubric_id: str, current_user: dict = Depends(require_roles(UserRole.educator))):
    result = await rubrics_collection.delete_one({"_id": _oid(rubric_id), "educator_id": current_user["id"]})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Rubric not found")


# =========================================================================
# Announcements — real class-wide broadcasts, written into the same
# notifications_collection every learner dashboard already reads from.
# =========================================================================
@router.get("/announcements")
async def list_announcements(current_user: dict = Depends(require_roles(UserRole.educator))):
    cursor = announcements_collection.find({"educator_id": current_user["id"]}).sort("created_at", -1)
    out = []
    async for a in cursor:
        out.append({"id": str(a["_id"]), "title": a["title"], "message": a["message"], "recipient_count": a["recipient_count"], "created_at": a["created_at"]})
    return out


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
async def create_announcement(payload: AnnouncementIn, current_user: dict = Depends(require_roles(UserRole.educator))):
    learner_ids = [u["_id"] async for u in users_collection.find({"role": UserRole.learner.value}, {"_id": 1})]
    now = datetime.utcnow().isoformat()
    if learner_ids:
        await notifications_collection.insert_many(
            [
                {
                    "user_id": str(uid),
                    "type": "platform_announcement",
                    "title": payload.title,
                    "message": payload.message,
                    "read": False,
                    "created_at": now,
                    "related_session_id": None,
                }
                for uid in learner_ids
            ]
        )
    doc = {
        "educator_id": current_user["id"],
        "title": payload.title,
        "message": payload.message,
        "recipient_count": len(learner_ids),
        "created_at": now,
    }
    result = await announcements_collection.insert_one(doc)
    return {
        "id": str(result.inserted_id),
        "title": payload.title,
        "message": payload.message,
        "recipient_count": len(learner_ids),
        "created_at": now,
    }
