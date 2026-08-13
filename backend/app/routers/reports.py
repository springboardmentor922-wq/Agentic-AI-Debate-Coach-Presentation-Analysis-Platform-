"""
Milestone 4 — Reports Module.

Every report listed here corresponds to one real, completed debate session
that has a generated feedback report. There is no separate "reports"
collection to seed or fake — this is a read + PDF-render view over data
that already exists (debate_sessions, debate_feedback_reports,
debate_performance, fallacy_reports).
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.core.database import (
    debate_sessions_collection,
    debate_feedback_reports_collection,
    performance_scores_collection,
    fallacy_reports_collection,
    coach_reviews_collection,
    presentation_analysis_collection,
    coach_assignments_collection,
    users_collection,
)
from app.core.deps import get_current_user
from app.schemas.user import UserRole
from app.services.report_pdf_service import build_debate_report_pdf
from app.services.report_excel_service import build_debate_report_xlsx, build_reports_summary_xlsx

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


async def _can_access_report(current_user: dict, owner_id: str) -> bool:
    if current_user["role"] in (UserRole.educator, UserRole.administrator):
        return True
    if current_user["id"] == owner_id:
        return True
    if current_user["role"] == UserRole.debate_coach:
        return await coach_assignments_collection.find_one({"coach_id": current_user["id"], "learner_id": owner_id}) is not None
    return False


@router.get("")
async def list_my_reports(learner_id: str | None = None, current_user: dict = Depends(get_current_user)):
    """Only debates that are completed AND have a generated feedback report.
    Coach/Educator scores are included once those review stages have
    actually happened — null until then, never fabricated. Learners see
    only their own; coach/educator/admin can pass ?learner_id= for a
    learner under their purview."""
    target_id = current_user["id"] if current_user["role"] == UserRole.learner else learner_id
    if not target_id:
        raise HTTPException(status_code=400, detail="learner_id is required for this role")
    if not await _can_access_report(current_user, target_id):
        raise HTTPException(status_code=403, detail="Not authorized to view this learner's reports")

    cursor = debate_sessions_collection.find(
        {"owner_id": target_id, "status": "completed"}
    ).sort("updated_at", -1)

    items = []
    async for session in cursor:
        session_id = str(session["_id"])
        report_doc = await debate_feedback_reports_collection.find_one({"session_id": session_id})
        if not report_doc:
            continue  # no fake "pending" entry — only real, generated reports are listed
        perf = await performance_scores_collection.find_one({"session_id": session_id})
        review = await coach_reviews_collection.find_one({"session_id": session_id})
        items.append({
            "id": session_id,
            "title": f"Debate Report — {session['topic']}",
            "topic": session["topic"],
            "debate_format": session["debate_format"],
            "date": session.get("updated_at"),
            "overall_score": perf["score"] if perf else None,
            "coach_score": review.get("coach_score") if review else None,
            "coach_comments": review.get("coach_comments") if review else None,
            "educator_score": review.get("educator_score") if review else None,
            "educator_comments": review.get("educator_comments") if review else None,
            "review_status": review.get("status") if review else None,
        })

    return {"items": items, "total": len(items)}


async def _gather_full_report_data(session_id: str, current_user: dict) -> dict:
    """Shared by both the PDF and single-session Excel export endpoints so
    the DB-fetching logic (and its authorization check) exists in exactly
    one place. Raises the same HTTPExceptions download_report_pdf always
    has, so both formats behave identically for 400/403/404 cases."""
    from bson import ObjectId
    from bson.errors import InvalidId
    try:
        oid = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session id")

    session = await debate_sessions_collection.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")
    if not await _can_access_report(current_user, session["owner_id"]):
        raise HTTPException(status_code=404, detail="Debate session not found")

    report_doc = await debate_feedback_reports_collection.find_one({"session_id": session_id})
    if not report_doc:
        raise HTTPException(status_code=404, detail="No report has been generated for this debate yet")

    perf = await performance_scores_collection.find_one({"session_id": session_id})
    review = await coach_reviews_collection.find_one({"session_id": session_id})
    fallacies = [
        f["report"] async for f in fallacy_reports_collection.find(
            {"session_id": session_id, "report.fallacy_detected": True}
        )
    ]
    presentation = await presentation_analysis_collection.find_one({"session_id": session_id})

    learner = await users_collection.find_one({"_id": ObjectId(session["owner_id"])})
    coach = await users_collection.find_one({"_id": ObjectId(review["coach_id"])}) if review and review.get("coach_id") else None
    educator = await users_collection.find_one({"_id": ObjectId(review["educator_id"])}) if review and review.get("educator_id") else None

    return {
        "session": session, "report_doc": report_doc, "perf": perf, "review": review,
        "fallacies": fallacies, "presentation": presentation,
        "learner": learner, "coach": coach, "educator": educator,
    }


@router.get("/{session_id}/pdf")
async def download_report_pdf(session_id: str, current_user: dict = Depends(get_current_user)):
    data = await _gather_full_report_data(session_id, current_user)
    session, report_doc, perf, review = data["session"], data["report_doc"], data["perf"], data["review"]
    fallacies, presentation = data["fallacies"], data["presentation"]
    learner, coach, educator = data["learner"], data["coach"], data["educator"]

    pdf_bytes = build_debate_report_pdf(
        topic=session["topic"],
        debate_format=session["debate_format"],
        date=session.get("updated_at", ""),
        overall_score=perf["score"] if perf else None,
        report=report_doc.get("report"),
        fallacies=fallacies,
        coach_score=review.get("coach_score") if review else None,
        coach_comments=review.get("coach_comments") if review else None,
        educator_score=review.get("educator_score") if review else None,
        educator_comments=review.get("educator_comments") if review else None,
        session_id=session_id,
        learner_name=learner.get("full_name") if learner else None,
        learner_email=learner.get("email") if learner else None,
        coach_name=coach.get("full_name") if coach else None,
        educator_name=educator.get("full_name") if educator else None,
        presentation=presentation,
        audio_link=f"/api/v1/media/audio/{presentation['_id']}" if presentation and presentation.get("audio_filename") else None,
    )

    filename = f"debate_report_{session_id}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes), media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


_XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.get("/{session_id}/excel")
async def download_report_excel(session_id: str, current_user: dict = Depends(get_current_user)):
    """Single-session Excel export — same data and same authorization rules
    as the PDF export (both go through _gather_full_report_data), just a
    different, spreadsheet-friendly rendering of it."""
    data = await _gather_full_report_data(session_id, current_user)
    session, report_doc, perf, review = data["session"], data["report_doc"], data["perf"], data["review"]
    fallacies, presentation = data["fallacies"], data["presentation"]
    learner = data["learner"]

    xlsx_bytes = build_debate_report_xlsx(
        topic=session["topic"],
        debate_format=session["debate_format"],
        date=session.get("updated_at", ""),
        overall_score=perf["score"] if perf else None,
        report=report_doc.get("report"),
        fallacies=fallacies,
        coach_score=review.get("coach_score") if review else None,
        coach_comments=review.get("coach_comments") if review else None,
        educator_score=review.get("educator_score") if review else None,
        educator_comments=review.get("educator_comments") if review else None,
        session_id=session_id,
        learner_name=learner.get("full_name") if learner else None,
        learner_email=learner.get("email") if learner else None,
        presentation=presentation,
    )

    filename = f"debate_report_{session_id}.xlsx"
    return StreamingResponse(
        io.BytesIO(xlsx_bytes), media_type=_XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/excel")
async def download_reports_summary_excel(learner_id: str | None = None, current_user: dict = Depends(get_current_user)):
    """Bulk export — one row per completed, reported debate session for the
    target learner, reusing list_my_reports()'s exact authorization rule
    and data (no separate/duplicated query logic)."""
    result = await list_my_reports(learner_id=learner_id, current_user=current_user)
    xlsx_bytes = build_reports_summary_xlsx(result["items"])
    return StreamingResponse(
        io.BytesIO(xlsx_bytes), media_type=_XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": 'attachment; filename="debate_reports_summary.xlsx"'},
    )
