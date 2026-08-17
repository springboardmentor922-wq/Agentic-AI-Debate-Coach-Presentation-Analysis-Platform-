from app.models.coach_profile import CoachProfile
from app.models.user import User


def create_coach_profile(db, user_id, profile):

    coach = CoachProfile(
        user_id=user_id,
        phone=profile.phone,
        bio=profile.bio,
        experience=profile.experience,
        qualification=profile.qualification,
        organization=profile.organization,
        specialization=profile.specialization,
        languages=profile.languages,
        availability=profile.availability,

        linkedin=profile.linkedin,
        mentor_tagline=profile.mentor_tagline,
    )

    db.add(coach)

    user = db.query(User).filter(User.id == user_id).first()

    user.profile_completed = True

    db.commit()

    db.refresh(coach)

    return coach