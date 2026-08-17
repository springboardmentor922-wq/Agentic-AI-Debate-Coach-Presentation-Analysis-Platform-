from app.models.educator_profile import EducatorProfile


def create_educator_profile(db, user_id, profile):

    educator = EducatorProfile(
        user_id=user_id,
        phone=profile.phone,
        bio=profile.bio,
        institution=profile.institution,
        department=profile.department,
        designation=profile.designation,
        experience=profile.experience,
        subjects=profile.subjects,
        office_hours=profile.office_hours,
    )

    db.add(educator)
    db.commit()
    db.refresh(educator)

    return educator