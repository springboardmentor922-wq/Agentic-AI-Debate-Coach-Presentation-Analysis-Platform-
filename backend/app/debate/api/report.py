"""
Report API

Provides APIs for retrieving debate analysis reports stored in MongoDB
and PostgreSQL, with RBAC authorization scoping for Learners, Coaches, Educators, and Admins.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.educator_class import EducatorClass, ClassEnrollment
from app.models.coach_assignment import CoachAssignment
from app.models.presentation_analysis import PresentationAnalysis
from app.debate.schemas.report_schema import (
    DebateReport,
    DebateReportResponse,
    DebateReportListResponse,
)
from app.debate.services.report_service import report_service

router = APIRouter(
    prefix="/api/v1/debate/reports",
    tags=["Debate Reports"],
)


def _convert_presentation_analysis_to_report(pa: PresentationAnalysis) -> DebateReport:
    input_kind = "media_upload"
    if pa.mime_type and "video" in pa.mime_type:
        input_kind = "video"
    elif pa.mime_type and "audio" in pa.mime_type:
        input_kind = "audio"

    return DebateReport(
        report_id=f"pres_{pa.id}",
        session_id=pa.session_id or pa.id,
        user_id=pa.user_id,
        topic_id=pa.session.topic_id if pa.session else None,
        input_type=input_kind,
        media_filename=pa.filename or "recording.wav",
        transcript={"transcript": pa.transcription_text or "No transcription available."},
        argument_analysis={
            "overall_score": float(pa.overall_score or 0.0),
            "argument_scoring": {"overall_score": float(pa.overall_score or 0.0)},
            "speech_pace_wpm": float(pa.speech_pace_wpm or 0.0),
            "filler_words_count": pa.filler_words_count or 0,
            "confidence_score": float(pa.confidence_score or 0.0),
            "clarity_score": float(pa.clarity_score or 0.0),
        },
        logical_fallacy_analysis={}
    )


@router.get(
    "",
    response_model=DebateReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Scoped Debate Reports",
)
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Retrieve debate analysis reports scoped by user role:
    - Learner: own reports
    - Educator: reports of learners enrolled in Educator's classes
    - Coach: reports of learners assigned to Coach
    - Administrator: all reports
    """
    role = current_user.role.name if current_user and current_user.role else None

    learner_ids: Optional[List[int]] = None

    if role == "Administrator":
        learner_ids = None
    elif role == "Educator":
        classes = db.query(EducatorClass).filter(EducatorClass.educator_id == current_user.id).all()
        class_ids = [c.id for c in classes]
        if not class_ids:
            return DebateReportListResponse(
                success=True,
                message="No reports found for enrolled learners.",
                data=[]
            )
        enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id.in_(class_ids)).all()
        learner_ids = list({e.learner_id for e in enrollments})
        if not learner_ids:
            return DebateReportListResponse(
                success=True,
                message="No reports found for enrolled learners.",
                data=[]
            )
    elif role == "Debate Coach":
        assignments = db.query(CoachAssignment).filter(
            CoachAssignment.coach_id == current_user.id,
            CoachAssignment.status == "Active"
        ).all()
        learner_ids = [a.learner_id for a in assignments]
        if not learner_ids:
            return DebateReportListResponse(
                success=True,
                message="No reports found for assigned learners.",
                data=[]
            )
    elif role == "Learner":
        learner_ids = [current_user.id]

    # Fetch MongoDB reports
    if learner_ids is None:
        mongo_reports = report_service.get_all_reports()
    else:
        mongo_reports = report_service.get_reports_by_user_ids(learner_ids)

    existing_session_ids = {r.session_id for r in mongo_reports if r.session_id}

    # Fetch PostgreSQL presentation analyses
    pa_query = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.is_deleted == False,
        PresentationAnalysis.processing_status == "COMPLETED"
    )
    if learner_ids is not None:
        pa_query = pa_query.filter(PresentationAnalysis.user_id.in_(learner_ids))

    presentation_analyses = pa_query.order_by(PresentationAnalysis.created_at.desc()).all()

    converted_pa_reports = []
    for pa in presentation_analyses:
        if pa.session_id not in existing_session_ids:
            converted_pa_reports.append(_convert_presentation_analysis_to_report(pa))

    all_reports = mongo_reports + converted_pa_reports

    return DebateReportListResponse(
        success=True,
        message="Debate reports retrieved successfully.",
        data=all_reports
    )


@router.get(
    "/{report_id}",
    response_model=DebateReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Debate Report By ID",
)
def get_report_by_id(report_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a debate report using its MongoDB ObjectId or pres_ prefix.
    """
    if report_id.startswith("pres_"):
        try:
            pa_id = int(report_id.replace("pres_", ""))
            pa = db.query(PresentationAnalysis).filter(PresentationAnalysis.id == pa_id).first()
            if pa:
                return DebateReportResponse(
                    success=True,
                    message="Debate report retrieved successfully.",
                    data=_convert_presentation_analysis_to_report(pa),
                )
        except ValueError:
            pass

    report = report_service.get_report_by_id(report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate report not found.",
        )

    return DebateReportResponse(
        success=True,
        message="Debate report retrieved successfully.",
        data=report,
    )


@router.get(
    "/session/{session_id}",
    response_model=DebateReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Reports By Session",
)
def get_reports_by_session(session_id: int):
    """
    Retrieve all reports for a debate session.
    """
    reports = report_service.get_reports_by_session(session_id)
    return DebateReportListResponse(
        success=True,
        message="Session reports retrieved successfully.",
        data=reports,
    )


@router.get(
    "/user/{user_id}",
    response_model=DebateReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Reports By User",
)
def get_reports_by_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all reports created by a user.
    """
    mongo_reports = report_service.get_reports_by_user(user_id)
    existing_session_ids = {r.session_id for r in mongo_reports if r.session_id}

    pa_list = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.user_id == user_id,
        PresentationAnalysis.is_deleted == False,
        PresentationAnalysis.processing_status == "COMPLETED"
    ).all()

    converted = [_convert_presentation_analysis_to_report(pa) for pa in pa_list if pa.session_id not in existing_session_ids]
    all_reports = mongo_reports + converted

    return DebateReportListResponse(
        success=True,
        message="User reports retrieved successfully.",
        data=all_reports,
    )