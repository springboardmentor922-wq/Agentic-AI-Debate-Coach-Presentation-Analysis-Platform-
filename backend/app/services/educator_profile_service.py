from sqlalchemy.orm import Session

from app.models.educator_profile import EducatorProfile
from app.schemas.educator_profile import EducatorProfileCreate


def create_educator_profile(user_id: int, profile: EducatorProfileCreate, db: Session):

    existing_profile = (
        db.query(EducatorProfile)
        .filter(EducatorProfile.user_id == user_id)
        .first()
    )

    if existing_profile:
        return None

    new_profile = EducatorProfile(
        user_id=user_id,
        phone=profile.phone,
        bio=profile.bio,
        institution=profile.institution,
        department=profile.department,
        designation=profile.designation,
        experience=profile.experience,
        subjects=profile.subjects,
        office_hours=profile.office_hours,
        research_interests=profile.research_interests,
        courses_handled=profile.courses_handled,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


def get_educator_profile(user_id: int, db: Session):

    return (
        db.query(EducatorProfile)
        .filter(EducatorProfile.user_id == user_id)
        .first()
    )


def update_educator_profile(user_id: int, profile: EducatorProfileCreate, db: Session):

    educator_profile = (
        db.query(EducatorProfile)
        .filter(EducatorProfile.user_id == user_id)
        .first()
    )

    if educator_profile is None:
        return None

    educator_profile.phone = profile.phone
    educator_profile.bio = profile.bio
    educator_profile.institution = profile.institution
    educator_profile.department = profile.department
    educator_profile.designation = profile.designation
    educator_profile.experience = profile.experience
    educator_profile.subjects = profile.subjects
    educator_profile.office_hours = profile.office_hours
    educator_profile.research_interests = profile.research_interests
    educator_profile.courses_handled = profile.courses_handled

    db.commit()
    db.refresh(educator_profile)

    return educator_profile