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
from sqlalchemy import func

from app.models.user import User
from app.models.user_skill import UserSkill
from app.models.presentation_analysis import PresentationAnalysis
from app.models.session_participant import SessionParticipant

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

        if skill is not None:
            return skill

        # If no user_skills row exists, check for completed activity
        presentations = (
            db.query(PresentationAnalysis)
            .filter(PresentationAnalysis.user_id == current_user.id)
            .all()
        )

        total_debates = (
            db.query(func.count(SessionParticipant.id))
            .filter(SessionParticipant.user_id == current_user.id)
            .scalar() or 0
        )

        total_presentations = len(presentations)

        print(f"[DEBUG SKILL SERVICE] User {current_user.id} ({current_user.email}): total_presentations={total_presentations}, total_debates={total_debates}")

        # If learner has no completed activity, return 404 / empty state
        if total_presentations == 0 and total_debates == 0:
            raise ValueError("Skill record not found.")

        # Calculate scores from real completed presentation activity
        if total_presentations > 0:
            avg_presentation = round(sum(float(p.overall_score or 0) for p in presentations) / total_presentations, 2)
            avg_comm = round(sum(float(p.clarity_score or 0) for p in presentations) / total_presentations, 2)
            avg_conf = round(sum(float(p.confidence_score or 0) for p in presentations) / total_presentations, 2)
        else:
            avg_presentation = 0.0
            avg_comm = 0.0
            avg_conf = 0.0

        avg_arg = avg_presentation if avg_presentation > 0 else 0.0
        avg_crit = avg_presentation if avg_presentation > 0 else 0.0

        print(f"[DEBUG SKILL SERVICE] Creating UserSkill for User {current_user.id}: presentation={avg_presentation}, comm={avg_comm}, conf={avg_conf}")

        # Persist calculated UserSkill row
        new_skill = UserSkill(
            user_id=current_user.id,
            communication_score=avg_comm,
            critical_thinking_score=avg_crit,
            presentation_score=avg_presentation,
            argument_score=avg_arg,
            confidence_score=avg_conf,
            total_debates=total_debates,
            total_presentations=total_presentations
        )

        db.add(new_skill)
        db.commit()
        db.refresh(new_skill)

        return new_skill

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