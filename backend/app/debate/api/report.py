"""
Report API

Provides APIs for retrieving debate analysis reports
stored in MongoDB.
"""

from fastapi import APIRouter, HTTPException, status

from app.debate.schemas.report_schema import (
    DebateReportResponse,
    DebateReportListResponse,
)
from app.debate.services.report_service import report_service

router = APIRouter(
    prefix="/api/v1/debate/reports",
    tags=["Debate Reports"],
)

@router.get(
    "",
    response_model=DebateReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get All Debate Reports",
)
def get_all_reports():
    """
    Retrieve all debate analysis reports.
    """

    reports = report_service.get_all_reports()

    return DebateReportListResponse(
        success=True,
        message="Debate reports retrieved successfully.",
        data=reports,
    )

@router.get(
    "/{report_id}",
    response_model=DebateReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Debate Report By ID",
)
def get_report_by_id(report_id: str):
    """
    Retrieve a debate report using its MongoDB ObjectId.
    """

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
def get_reports_by_user(user_id: int):
    """
    Retrieve all reports created by a user.
    """

    reports = report_service.get_reports_by_user(user_id)

    return DebateReportListResponse(
        success=True,
        message="User reports retrieved successfully.",
        data=reports,
    )