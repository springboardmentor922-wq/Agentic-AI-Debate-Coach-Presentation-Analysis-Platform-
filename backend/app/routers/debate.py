from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.debate import (
    DebateTopicCreate,
    DebateTopicResponse
)

from app.services.debate_service import (
    create_topic,
    get_all_topics,
    get_topic,
    update_topic,
    delete_topic
)

router = APIRouter(
    prefix="/debate",
    tags=["Debate Topics"]
)


@router.post("/topics", response_model=DebateTopicResponse)
def create_debate_topic(
    topic: DebateTopicCreate,
    db: Session = Depends(get_db)
):
    return create_topic(topic, db)


@router.get("/topics", response_model=list[DebateTopicResponse])
def get_topics(
    db: Session = Depends(get_db)
):
    return get_all_topics(db)


@router.get("/topics/{topic_id}", response_model=DebateTopicResponse)
def get_single_topic(
    topic_id: int,
    db: Session = Depends(get_db)
):

    topic = get_topic(topic_id, db)

    if topic is None:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    return topic


@router.put("/topics/{topic_id}", response_model=DebateTopicResponse)
def update_debate_topic(
    topic_id: int,
    topic: DebateTopicCreate,
    db: Session = Depends(get_db)
):

    updated = update_topic(
        topic_id,
        topic,
        db
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    return updated


@router.delete("/topics/{topic_id}")
def delete_debate_topic(
    topic_id: int,
    db: Session = Depends(get_db)
):

    deleted = delete_topic(
        topic_id,
        db
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    return {
        "message": "Topic deleted successfully"
    }