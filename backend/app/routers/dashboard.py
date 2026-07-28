from fastapi import APIRouter
from sqlalchemy import func, extract

from app.database.database import SessionLocal
from app.database.models import DebateSession
from app.schemas.dashboard import DashboardStats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats():

    db = SessionLocal()

    try:

        total_debates = db.query(DebateSession).count()

        completed_sessions = (
            db.query(DebateSession)
            .filter(DebateSession.status == "Completed")
            .count()
        )

        average_score = db.query(
            func.avg(DebateSession.score)
        ).scalar()

        average_score = round(average_score or 0)

        if average_score >= 90:
            current_level = "Expert"
        elif average_score >= 75:
            current_level = "Intermediate"
        else:
            current_level = "Beginner"

        return DashboardStats(
            total_debates=total_debates,
            average_score=average_score,
            completed_sessions=completed_sessions,
            current_level=current_level
        )

    finally:
        db.close()


@router.get("/performance")
def get_dashboard_performance():

    db = SessionLocal()

    try:

        results = (
            db.query(
                extract("month", DebateSession.created_at).label("month"),
                func.avg(DebateSession.score).label("average_score")
            )
            .group_by(extract("month", DebateSession.created_at))
            .order_by(extract("month", DebateSession.created_at))
            .all()
        )

        month_names = {
            1: "Jan",
            2: "Feb",
            3: "Mar",
            4: "Apr",
            5: "May",
            6: "Jun",
            7: "Jul",
            8: "Aug",
            9: "Sep",
            10: "Oct",
            11: "Nov",
            12: "Dec"
        }

        # Initialize all months with score 0
        performance = {
            month: 0 for month in month_names.values()
        }

        # Fill months that have data
        for month, score in results:
            performance[month_names[int(month)]] = round(score)

        chart = []

        for month in month_names.values():
            chart.append({
                "month": month,
                "score": performance[month]
            })

        return chart

    finally:
        db.close()


@router.get("/recent-activity")
def recent_activity():

    db = SessionLocal()

    try:

        sessions = (
            db.query(DebateSession)
            .order_by(DebateSession.created_at.desc())
            .limit(5)
            .all()
        )

        activity = []

        for session in sessions:

            activity.append(
                {
                    "activity": f"Completed: {session.title}",
                    "time": session.created_at.strftime("%d %b %Y")
                }
            )

        return activity

    finally:
        db.close()