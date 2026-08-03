"""
=========================================================
Debate Topic Service

Business Logic for:

- Create Debate Topic
- Get All Debate Topics
- Get Debate Topic By ID
- Update Debate Topic
- Delete Debate Topic

=========================================================
"""

from sqlalchemy.orm import Session

from app.models.debate_topic import DebateTopic
from app.models.user import User

from app.schemas.debate_topic import (
    CreateDebateTopicRequest,
    UpdateDebateTopicRequest
)


class DebateTopicService:

    # =====================================================
    # Create Debate Topic
    # =====================================================

    @staticmethod
    def create_topic(
        db: Session,
        topic_data: CreateDebateTopicRequest,
        current_user: User
    ):

        existing_topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.title == topic_data.title)
            .first()
        )

        if existing_topic:
            raise ValueError("Debate topic already exists.")

        new_topic = DebateTopic(

            title=topic_data.title,

        

            category=topic_data.category,

            difficulty_level=topic_data.difficulty_level,

            debate_format=topic_data.debate_format,

            topic_type=topic_data.topic_type,

            visibility=topic_data.visibility,

            estimated_duration=topic_data.estimated_duration,

            learning_goal=topic_data.learning_goal,

            is_system_generated=False,

            created_by=current_user.id,

            is_active=True

        )

        db.add(new_topic)

        db.commit()

        db.refresh(new_topic)

        return new_topic

    # =====================================================
    # Get All Debate Topics
    # =====================================================

    @staticmethod
    def get_all_topics(
        db: Session
    ):

        return (
            db.query(DebateTopic)
            .filter(DebateTopic.is_active == True)
            .all()
        )

    # =====================================================
    # Get Debate Topic By ID
    # =====================================================

    @staticmethod
    def get_topic_by_id(
        db: Session,
        topic_id: int
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        return topic

    # =====================================================
    # Update Debate Topic
    # =====================================================

    @staticmethod
    def update_topic(
        db: Session,
        topic_id: int,
        topic_data: UpdateDebateTopicRequest,
        current_user: User
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        # Official topics cannot be edited
        if topic.topic_type.upper() == "OFFICIAL":
            raise ValueError("Official topics cannot be edited.")

        # Only the creator can edit the topic
        if topic.created_by != current_user.id:
            raise ValueError("You can edit only your own topics.")

        update_data = topic_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():

            setattr(topic, field, value)

        db.commit()

        db.refresh(topic)

        return topic

    # =====================================================
    # Delete Debate Topic
    # =====================================================

    @staticmethod
    def delete_topic(
        db: Session,
        topic_id: int,
        current_user: User,
    ):

        topic = (
            db.query(DebateTopic)
            .filter(DebateTopic.id == topic_id)
            .first()
        )

        if topic is None:
            raise ValueError("Debate topic not found.")

        # Official topics cannot be deleted
        if topic.topic_type.upper() == "OFFICIAL":
            raise ValueError("Official topics cannot be deleted.")

        # Only creator can delete
        if topic.created_by != current_user.id:
            raise ValueError("You can delete only your own topics.")

        topic.is_active = False

        db.commit()

        return {
            "message": "Debate topic deleted successfully."
        }