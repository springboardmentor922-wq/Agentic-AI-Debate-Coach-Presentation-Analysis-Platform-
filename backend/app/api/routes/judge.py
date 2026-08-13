import traceback

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_active_user
from app.db.postgres import get_db

from app.models.user import User
from app.models.debate_session import DebateSession
from app.models.debate_report import DebateReport

from app.schemas.judge import (
    DebateReportResponse,
    GenerateJudgeReportRequest,
)

from app.services.ai_judge import (
    generate_debate_report,
)


router = APIRouter(
    prefix="/api/v1/judge",
    tags=["AI Judge"],
)


# ============================================================
# GENERATE JUDGE REPORT
# ============================================================

@router.post(
    "/{session_id}",
    response_model=DebateReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_report(
    session_id: int,
    payload: GenerateJudgeReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    session = (
        db.query(DebateSession)
        .filter(
            DebateSession.id == session_id
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Debate session not found",
        )


    if session.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="Permission denied",
        )


    existing = (
        db.query(DebateReport)
        .filter(
            DebateReport.session_id == session_id
        )
        .first()
    )


    # --------------------------------------------------------
    # Return existing report unless regeneration requested
    # --------------------------------------------------------

    if existing and not payload.regenerate:

        return existing


    # --------------------------------------------------------
    # Delete existing report before regeneration
    # --------------------------------------------------------

    if existing:

        db.delete(existing)

        db.commit()


    # --------------------------------------------------------
    # Generate new AI Judge report
    # --------------------------------------------------------

    try:

        report = await generate_debate_report(
            db=db,
            session=session,
            current_user=current_user,
        )

        return report

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ============================================================
# GET REPORT HISTORY
#
# IMPORTANT:
# These static routes must be defined before
# /{session_id} to avoid "history" being interpreted
# as a session_id.
# ============================================================


@router.get(
    "/history",
    response_model=list[DebateReportResponse],
)
async def report_history_short(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    reports = (
        db.query(DebateReport)
        .filter(
            DebateReport.user_id == current_user.id
        )
        .order_by(
            DebateReport.created_at.desc()
        )
        .all()
    )

    return reports


@router.get(
    "/history/all",
    response_model=list[DebateReportResponse],
)
async def report_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    reports = (
        db.query(DebateReport)
        .filter(
            DebateReport.user_id == current_user.id
        )
        .order_by(
            DebateReport.created_at.desc()
        )
        .all()
    )

    return reports


# ============================================================
# BEST PERFORMANCE
# ============================================================

@router.get(
    "/best/performance"
)
async def best_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    report = (
        db.query(DebateReport)
        .filter(
            DebateReport.user_id == current_user.id
        )
        .order_by(
            DebateReport.overall_score.desc()
        )
        .first()
    )


    if not report:

        raise HTTPException(
            status_code=404,
            detail="No reports found",
        )


    return report


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

@router.get(
    "/dashboard/statistics"
)
async def dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    reports = (
        db.query(DebateReport)
        .filter(
            DebateReport.user_id == current_user.id
        )
        .all()
    )


    # --------------------------------------------------------
    # No reports
    # --------------------------------------------------------

    if len(reports) == 0:

        return {

            "totalDebates": 0,

            "averageScore": 0,

            "highestScore": 0,

            "averageCriticalThinking": 0,

            "averageCommunication": 0,

            "averagePresentation": 0,

            "averageLogic": 0,

            "wins": 0,

        }


    total = len(reports)


    # --------------------------------------------------------
    # Average overall score
    # --------------------------------------------------------

    average_score = (
        sum(
            r.overall_score
            for r in reports
        )
        / total
    )


    # --------------------------------------------------------
    # Highest score
    # --------------------------------------------------------

    highest_score = max(
        r.overall_score
        for r in reports
    )


    # --------------------------------------------------------
    # Critical thinking
    # --------------------------------------------------------

    average_critical = (
        sum(
            r.critical_thinking_score
            for r in reports
        )
        / total
    )


    # --------------------------------------------------------
    # Communication
    # --------------------------------------------------------

    average_comm = (
        sum(
            r.communication_skills
            for r in reports
        )
        / total
    )


    # --------------------------------------------------------
    # Presentation
    # --------------------------------------------------------

    average_presentation = (
        sum(
            r.presentation_score
            for r in reports
        )
        / total
    )


    # --------------------------------------------------------
    # Logical consistency
    # --------------------------------------------------------

    average_logic = (
        sum(
            r.logical_consistency
            for r in reports
        )
        / total
    )


    # --------------------------------------------------------
    # Wins
    # --------------------------------------------------------

    wins = len(
        [
            r
            for r in reports
            if r.winner
            and r.winner.lower() == "learner"
        ]
    )


    return {

        "totalDebates": total,

        "averageScore": round(
            average_score,
            2,
        ),

        "highestScore": round(
            highest_score,
            2,
        ),

        "averageCriticalThinking": round(
            average_critical,
            2,
        ),

        "averageCommunication": round(
            average_comm,
            2,
        ),

        "averagePresentation": round(
            average_presentation,
            2,
        ),

        "averageLogic": round(
            average_logic,
            2,
        ),

        "wins": wins,

    }


# ============================================================
# GET SINGLE JUDGE REPORT
# ============================================================
#
# IMPORTANT:
# This dynamic route is intentionally placed AFTER
# all static routes such as:
#
# /history
# /history/all
# /best/performance
# /dashboard/statistics
#
# ============================================================

@router.get(
    "/{session_id}",
    response_model=DebateReportResponse,
)
async def get_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    report = (
        db.query(DebateReport)
        .filter(
            DebateReport.session_id == session_id,
            DebateReport.user_id == current_user.id,
        )
        .first()
    )


    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )


    return report


# ============================================================
# DELETE JUDGE REPORT
# ============================================================

@router.delete(
    "/{session_id}"
)
async def delete_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):

    report = (
        db.query(DebateReport)
        .filter(
            DebateReport.session_id == session_id,
            DebateReport.user_id == current_user.id,
        )
        .first()
    )


    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )


    db.delete(report)

    db.commit()


    return {
        "message": "Report deleted successfully"
    }