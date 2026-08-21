"""
=========================================================
User Skill Service

Business Logic for:

- Create User Skill Record
- Get User Skill
- Update User Skill

=========================================================
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_skill import UserSkill

from app.schemas.user_skill import (
    CreateUserSkillRequest,
    UpdateUserSkillRequest
)


class UserSkillService:

    # =====================================================
    # Create User Skill
    # =====================================================

    @staticmethod
    def create_skill(
        db: Session,
        current_user: User,
        skill_data: CreateUserSkillRequest
    ):

        existing_skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == current_user.id)
            .first()
        )

        if existing_skill:
            raise ValueError(
                "Skill record already exists for this user."
            )

        new_skill = UserSkill(

            user_id=current_user.id,

            communication_score=skill_data.communication_score,

            critical_thinking_score=skill_data.critical_thinking_score,

            presentation_score=skill_data.presentation_score,

            argument_score=skill_data.argument_score,

            confidence_score=skill_data.confidence_score,

            total_debates=skill_data.total_debates,

            total_presentations=skill_data.total_presentations

        )

        db.add(new_skill)

        db.commit()

        db.refresh(new_skill)

        return new_skill

    # =====================================================
    # Get User Skill
    # =====================================================

    @staticmethod
    def get_my_skill(
        db: Session,
        current_user: User
    ):

        skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == current_user.id)
            .first()
        )

        if skill is None:
            raise ValueError(
                "Skill record not found."
            )

        return skill

    # =====================================================
    # Update User Skill
    # =====================================================

    @staticmethod
    def update_skill(
        db: Session,
        current_user: User,
        skill_data: UpdateUserSkillRequest
    ):

        skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == current_user.id)
            .first()
        )

        if skill is None:
            raise ValueError(
                "Skill record not found."
            )

        update_data = skill_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(skill, field, value)

        db.commit()

        db.refresh(skill)

        return skill