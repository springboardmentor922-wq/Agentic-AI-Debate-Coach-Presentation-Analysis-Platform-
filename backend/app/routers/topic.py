from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.topic import DebateTopic
from app.schemas.topic import TopicCreate
from app.auth.dependencies import get_current_admin

router = APIRouter(
    prefix="/topics",
    tags=["Debate Topics"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_topic(
    topic: TopicCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    existing = db.query(DebateTopic).filter(
        DebateTopic.title == topic.title
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Topic already exists."
        )

    new_topic = DebateTopic(**topic.model_dump())

    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)

    return new_topic


@router.get("/")
def get_topics(db: Session = Depends(get_db)):
    return db.query(DebateTopic).all()
@router.get("/{topic_id}")
def get_topic(
    topic_id: int,
    db: Session = Depends(get_db)
):

    topic = db.query(DebateTopic).filter(
        DebateTopic.id == topic_id
    ).first()

    if topic is None:
        raise HTTPException(
            status_code=404,
            detail="Topic not found."
        )

    return topic