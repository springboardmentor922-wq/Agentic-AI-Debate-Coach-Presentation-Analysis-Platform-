from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_current_active_user
from app.db.postgres import get_db
from app.db.mongodb import feedback_collection
from app.models.debate_session import DebateSession, SessionStatus
from app.models.debate_topic import DebateTopic
from app.models.role import RoleName
from app.models.user import User
from app.schemas.reports import (
    AllLearnersReport,
    CoachesReport,
    CoachRow,
    EducatorRow,
    EducatorsReport,
    LearnerRow,
    UserActivityDetail,
    UserSummary,
)
from app.services.analytics import compute_skill_analytics
from app.schemas.recommendation import RecommendationResult
from app.services.recommendation_engine import generate_recommendations
from app.db.mongodb import coaching_reports_collection
from app.schemas.reports import CounterargumentSummary
from app.services.analytics import compute_counterargument_summary
from app.models.debate_session import DebateSession

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

can_view_org_reports = RoleChecker([RoleName.ADMINISTRATOR])


@router.get("/all-learners", response_model=AllLearnersReport)
def get_all_learners_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(can_view_org_reports),
):
    learners = (
        db.query(User)
        .join(User.role)
        .filter(User.role.has(name=RoleName.LEARNER.value), User.is_deleted == False)  # noqa: E712
        .all()
    )
    learner_ids = [u.id for u in learners]

    total_learners = len(learners)

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    sessions_this_week = 0
    avg_completion_rate = None
    most_debated_topic = None

    if learner_ids:
        sessions_this_week = (
            db.query(func.count(DebateSession.id))
            .filter(DebateSession.user_id.in_(learner_ids), DebateSession.created_at >= week_ago)
            .scalar()
            or 0
        )

        total_sessions = (
            db.query(func.count(DebateSession.id)).filter(DebateSession.user_id.in_(learner_ids)).scalar() or 0
        )
        completed_sessions = (
            db.query(func.count(DebateSession.id))
            .filter(DebateSession.user_id.in_(learner_ids), DebateSession.status == SessionStatus.COMPLETED)
            .scalar()
            or 0
        )
        if total_sessions > 0:
            avg_completion_rate = round((completed_sessions / total_sessions) * 100, 1)

        top_topic_row = (
            db.query(DebateTopic.title, func.count(DebateSession.id).label("cnt"))
            .join(DebateSession, DebateSession.topic_id == DebateTopic.id)
            .filter(DebateSession.user_id.in_(learner_ids))
            .group_by(DebateTopic.title)
            .order_by(func.count(DebateSession.id).desc())
            .first()
        )
        if top_topic_row:
            most_debated_topic = top_topic_row[0]

    learner_rows = []
    for learner in learners:
        sessions = db.query(func.count(DebateSession.id)).filter(DebateSession.user_id == learner.id).scalar() or 0
        completed = (
            db.query(func.count(DebateSession.id))
            .filter(DebateSession.user_id == learner.id, DebateSession.status == SessionStatus.COMPLETED)
            .scalar()
            or 0
        )
        last_active = (
            db.query(func.max(DebateSession.created_at)).filter(DebateSession.user_id == learner.id).scalar()
        )
        learner_rows.append(
            LearnerRow(
                id=learner.id,
                full_name=learner.full_name,
                sessions=sessions,
                completed=completed,
                last_active=last_active,
            )
        )

    return AllLearnersReport(
        total_learners=total_learners,
        sessions_this_week=sessions_this_week,
        avg_completion_rate=avg_completion_rate,
        most_debated_topic=most_debated_topic,
        learners=learner_rows,
    )


@router.get("/coaches", response_model=CoachesReport)
async def get_coaches_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(can_view_org_reports),
):
    coaches = (
        db.query(User)
        .join(User.role)
        .filter(User.role.has(name=RoleName.DEBATE_COACH.value), User.is_deleted == False)  # noqa: E712
        .all()
    )
    coach_ids = [c.id for c in coaches]

    active_coaches = sum(1 for c in coaches if c.is_active)

    sessions_coached = 0
    feedback_given = 0
    if coach_ids:
        sessions_coached = (
            db.query(func.count(DebateSession.id)).filter(DebateSession.coach_id.in_(coach_ids)).scalar() or 0
        )
        feedback_given = await feedback_collection.count_documents({"author_id": {"$in": coach_ids}})

    coach_rows = []
    for coach in coaches:
        coach_sessions = (
            db.query(func.count(DebateSession.id)).filter(DebateSession.coach_id == coach.id).scalar() or 0
        )
        coach_feedback = await feedback_collection.count_documents({"author_id": coach.id})
        learners_assigned = (
            db.query(func.count(func.distinct(DebateSession.user_id)))
            .filter(DebateSession.coach_id == coach.id)
            .scalar()
            or 0
        )
        last_active = (
            db.query(func.max(DebateSession.created_at)).filter(DebateSession.coach_id == coach.id).scalar()
        )
        coach_rows.append(
            CoachRow(
                id=coach.id,
                full_name=coach.full_name,
                sessions_coached=coach_sessions,
                feedback_given=coach_feedback,
                learners_assigned=learners_assigned,
                last_active=last_active,
            )
        )

    return CoachesReport(
        active_coaches=active_coaches,
        sessions_coached=sessions_coached,
        feedback_given=feedback_given,
        coaches=coach_rows,
    )


@router.get("/user/{user_id}", response_model=UserActivityDetail)
async def get_user_activity(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    is_self = current_user.id == user_id
    is_org_admin = current_user.role.name in (RoleName.ADMINISTRATOR.value)

    if not is_self and not is_org_admin:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own activity.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user_id)
        .order_by(DebateSession.created_at.desc())
        .all()
    )

    session_ids = [s.id for s in sessions]
    skill_analytics = await compute_skill_analytics(user_id, session_ids)

    return UserActivityDetail(
        user=UserSummary(id=target_user.id, full_name=target_user.full_name, role=target_user.role.name),
        sessions=sessions,
        skill_analytics=skill_analytics,
    )

@router.get("/educators", response_model=EducatorsReport)
def get_educators_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(can_view_org_reports),
):
    educators = (
        db.query(User)
        .join(User.role)
        .filter(User.role.has(name=RoleName.EDUCATOR.value), User.is_deleted == False)  # noqa: E712
        .all()
    )
    educator_ids = [e.id for e in educators]

    active_educators = sum(1 for e in educators if e.is_active)

    topics_published = 0
    sessions_generated = 0
    if educator_ids:
        topics_published = (
            db.query(func.count(DebateTopic.id)).filter(DebateTopic.created_by_id.in_(educator_ids)).scalar() or 0
        )
        sessions_generated = (
            db.query(func.count(DebateSession.id))
            .join(DebateTopic, DebateSession.topic_id == DebateTopic.id)
            .filter(DebateTopic.created_by_id.in_(educator_ids))
            .scalar()
            or 0
        )

    educator_rows = []
    for educator in educators:
        topics_count = (
            db.query(func.count(DebateTopic.id)).filter(DebateTopic.created_by_id == educator.id).scalar() or 0
        )
        sessions_count = (
            db.query(func.count(DebateSession.id))
            .join(DebateTopic, DebateSession.topic_id == DebateTopic.id)
            .filter(DebateTopic.created_by_id == educator.id)
            .scalar()
            or 0
        )
        educator_rows.append(
            EducatorRow(
                id=educator.id,
                full_name=educator.full_name,
                topics_published=topics_count,
                sessions_generated=sessions_count,
                last_active=educator.last_active_at,
            )
        )

    return EducatorsReport(
        active_educators=active_educators,
        topics_published=topics_published,
        sessions_generated=sessions_generated,
        educators=educator_rows,
    )

@router.get("/recommendations", response_model=RecommendationResult)
async def get_my_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Returns this user's coaching plan. Reuses a recent cached report from MongoDB if one
    exists (avoids an unnecessary LLM call on every page visit); generates a fresh one otherwise."""
    recent_report = await coaching_reports_collection.find_one(
        {"user_id": current_user.id},
        sort=[("created_at", -1)],
    )

    if recent_report:
        age = datetime.now(timezone.utc) - recent_report["created_at"].replace(tzinfo=timezone.utc)
        if age.total_seconds() < 86400:  # reuse anything generated in the last 24h
            return RecommendationResult(**recent_report["report"])

    try:
        result = await generate_recommendations(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Coaching recommendation generation failed: {e}")

    await coaching_reports_collection.insert_one(
        {
            "user_id": current_user.id,
            "report": result.model_dump(),
            "created_at": datetime.now(timezone.utc),
        }
    )
    return result


@router.get("/counterargument-summary", response_model=CounterargumentSummary)
async def get_my_counterargument_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session_ids = [
        s.id for s in db.query(DebateSession.id).filter(DebateSession.user_id == current_user.id).all()
    ]
    return await compute_counterargument_summary(session_ids)