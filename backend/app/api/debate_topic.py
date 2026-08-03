"""
=========================================================
Debate Topic API

Endpoints

GET     /debate-topics
GET     /debate-topics/{topic_id}

POST    /debate-topics

PUT     /debate-topics/{topic_id}

DELETE  /debate-topics/{topic_id}

=========================================================
"""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth import (
    get_current_user,
    require_role,
    require_any_role
)

from app.models.user import User

from app.schemas.debate_topic import (
    CreateDebateTopicRequest,
    UpdateDebateTopicRequest,
    DebateTopicResponse
)

from app.services.debate_topic_service import DebateTopicService


router = APIRouter(
    prefix="/debate-topics",
    tags=["Debate Topics"]
)


# ==========================================================
# View All Debate Topics
# ==========================================================

@router.get(
    "",
    response_model=List[DebateTopicResponse]
)
def get_all_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return DebateTopicService.get_all_topics(db)


# ==========================================================
# View Debate Topic By ID
# ==========================================================

@router.get(
    "/{topic_id}",
    response_model=DebateTopicResponse
)
def get_topic_by_id(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateTopicService.get_topic_by_id(
            db,
            topic_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Create Debate Topic
# ==========================================================

@router.post(
    "",
    response_model=DebateTopicResponse,
    status_code=status.HTTP_201_CREATED
)
def create_topic(
    topic_data: CreateDebateTopicRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
        [
            "Learner",
            "Debate Coach",
            "Educator",
            "Administrator"
        ]
        )
    )
):

    try:

        return DebateTopicService.create_topic(
            db,
            topic_data,
            current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# Update Debate Topic
# ==========================================================

@router.put(
    "/{topic_id}",
    response_model=DebateTopicResponse
)
def update_topic(
    topic_id: int,
    topic_data: UpdateDebateTopicRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [   
                "Learner",
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateTopicService.update_topic(
            db,
            topic_id,
            topic_data,
            current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Delete Debate Topic
# ==========================================================

@router.delete(
    "/{topic_id}"
)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role([
        "Learner",
        "Debate Coach",
        "Educator",
        "Administrator"
    ])
    )
):

    try:

        return DebateTopicService.delete_topic(
            db,
            topic_id,
            current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )