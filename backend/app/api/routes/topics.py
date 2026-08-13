from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_current_active_user
from app.db.postgres import get_db
from app.models.debate_session import DebateSession
from app.models.debate_topic import DebateTopic
from app.models.role import RoleName
from app.models.user import User
from app.schemas.topic import TopicCreate, TopicOut

router = APIRouter(prefix="/api/v1/topics", tags=["Debate Topics"])

can_manage_topics = RoleChecker([RoleName.EDUCATOR, RoleName.DEBATE_COACH, RoleName.ADMINISTRATOR])


@router.get("", response_model=list[TopicOut])
def list_topics(
    search: str | None = None,
    category: str | None = None,
    difficulty: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(DebateTopic)

    if search:
        like = f"%{search}%"
        query = query.filter((DebateTopic.title.ilike(like)) | (DebateTopic.category.ilike(like)))

    if category and category.lower() != "all":
        query = query.filter(DebateTopic.category == category)

    if difficulty and difficulty.lower() != "any":
        query = query.filter(DebateTopic.difficulty == difficulty.lower())

    # Visibility rules:
    # - global topics are visible to everyone
    # - coach-scoped topics are visible to the coach who made them, plus any learner
    #   who has debated in a session coached by that same coach (our stand-in for a
    #   real "assigned learners" relationship, since no Class/roster model exists yet)
    if current_user.role.name in (RoleName.ADMINISTRATOR.value, RoleName.EDUCATOR.value):
        pass  # see everything, no extra filter
    elif current_user.role.name == RoleName.DEBATE_COACH.value:
        query = query.filter(
            or_(DebateTopic.scope == "global", DebateTopic.assigned_coach_id == current_user.id)
        )
    else:
        coached_by_ids = [
            row[0]
            for row in db.query(DebateSession.coach_id)
            .filter(DebateSession.user_id == current_user.id, DebateSession.coach_id.isnot(None))
            .distinct()
            .all()
        ]
        query = query.filter(
            or_(DebateTopic.scope == "global", DebateTopic.assigned_coach_id.in_(coached_by_ids))
        )

    return query.order_by(DebateTopic.created_at.desc()).all()


@router.post("", response_model=TopicOut, status_code=201)
def create_topic(
    payload: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(can_manage_topics),
):
    data = payload.model_dump()

    # Scope is derived from the creator's role, not freely chosen by the client —
    # otherwise a coach could mint a "global" topic and bypass scoping entirely.
    if current_user.role.name == RoleName.DEBATE_COACH.value:
        data["scope"] = "coach_learners"
        data["assigned_coach_id"] = current_user.id
    else:
        data["scope"] = "global"
        data["assigned_coach_id"] = None

    topic = DebateTopic(**data, created_by_id=current_user.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/{topic_id}", status_code=204)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(can_manage_topics),
):
    topic = db.query(DebateTopic).filter(DebateTopic.id == topic_id).first()
    if topic:
        db.delete(topic)
        db.commit()
    return None