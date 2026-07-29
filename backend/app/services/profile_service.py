"""
=========================================================
User Profile Service

Business Logic for:

- Create Profile
- Get My Profile
- Update My Profile

=========================================================
"""

from sqlalchemy.orm import Session

from app.models.user_profile import UserProfile
from app.models.user import User

from app.schemas.profile import (
    CreateProfileRequest,
    UpdateProfileRequest
)


class ProfileService:

    # =====================================================
    # Create Profile
    # =====================================================

    @staticmethod
    def create_profile(
        db: Session,
        current_user: User,
        profile_data: CreateProfileRequest
    ):

        existing_profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == current_user.id)
            .first()
        )

        if existing_profile:
            raise ValueError("Profile already exists.")

        # -----------------------------------------------
        # Update User Table
        # -----------------------------------------------

        if profile_data.full_name:
            current_user.full_name = profile_data.full_name

        if profile_data.email:
            current_user.email = profile_data.email

        # -----------------------------------------------
        # Create User Profile
        # -----------------------------------------------

        new_profile = UserProfile(

            user_id=current_user.id,

            phone_number=profile_data.phone_number,

            institution=profile_data.institution,

            location=profile_data.location,

            date_of_birth=profile_data.date_of_birth,

            gender=profile_data.gender,

            bio=profile_data.bio,

            experience_level=profile_data.experience_level,

            learning_goals=profile_data.learning_goals,

            preferred_debate_topics=profile_data.preferred_debate_topics,

            presentation_domains=profile_data.presentation_domains,

            coaching_preferences=profile_data.coaching_preferences

        )

        db.add(new_profile)

        db.commit()

        db.refresh(new_profile)

        return new_profile

    # =====================================================
    # Get Profile
    # =====================================================

    @staticmethod
    def get_profile(
        db: Session,
        current_user: User
    ):

        profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == current_user.id)
            .first()
        )

        # -----------------------------------------------
        # Automatically create profile if missing
        # -----------------------------------------------

        if profile is None:

            profile = UserProfile(

                user_id=current_user.id,

                phone_number=None,
                institution=None,
                location=None,
                date_of_birth=None,
                gender=None,
                bio=None,
                experience_level="Beginner",
                learning_goals=None,
                preferred_debate_topics=None,
                presentation_domains=None,
                coaching_preferences=None

            )

            db.add(profile)

            db.commit()

            db.refresh(profile)

    # -----------------------------------------------
    # Merge User table values
    # -----------------------------------------------

        profile.full_name = current_user.full_name
        profile.email = current_user.email

        return profile

    # =====================================================
    # Update Profile
    # =====================================================

    @staticmethod
    def update_profile(
        db: Session,
        current_user: User,
        profile_data: UpdateProfileRequest
    ):

        profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == current_user.id)
            .first()
        )

        if not profile:
            raise ValueError("Profile not found.")

        # -----------------------------------------------
        # Update User Table
        # -----------------------------------------------

        if profile_data.full_name is not None:
            current_user.full_name = profile_data.full_name

        if profile_data.email is not None:
            current_user.email = profile_data.email

        # -----------------------------------------------
        # Update Profile Table
        # -----------------------------------------------

        profile.phone_number = profile_data.phone_number
        profile.institution = profile_data.institution
        profile.location = profile_data.location
        profile.date_of_birth = profile_data.date_of_birth
        profile.gender = profile_data.gender
        profile.bio = profile_data.bio
        profile.experience_level = profile_data.experience_level
        profile.learning_goals = profile_data.learning_goals
        profile.preferred_debate_topics = profile_data.preferred_debate_topics
        profile.presentation_domains = profile_data.presentation_domains
        profile.coaching_preferences = profile_data.coaching_preferences

        db.commit()

        db.refresh(profile)

        profile.full_name = current_user.full_name
        profile.email = current_user.email

        return profile