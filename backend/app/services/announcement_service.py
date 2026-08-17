from sqlalchemy.orm import Session

from app.models.announcement import Announcement

from app.models.classroom import Classroom


# ============================================================
# CREATE ANNOUNCEMENT
# ============================================================

def create_announcement(
    educator_id: int,
    title: str,
    message: str,
    classroom_id: int | None,
    priority: str,
    db: Session
):

    # --------------------------------------------------------
    # Validate classroom if one was selected
    # --------------------------------------------------------

    if classroom_id is not None:

        classroom = (
            db.query(Classroom)
            .filter(
                Classroom.id == classroom_id,
                Classroom.educator_id == educator_id
            )
            .first()
        )

        if classroom is None:

            return None, "Class not found"


    # --------------------------------------------------------
    # Validate priority
    # --------------------------------------------------------

    allowed_priorities = [
        "Normal",
        "Important",
        "Urgent"
    ]

    if priority not in allowed_priorities:

        priority = "Normal"


    # --------------------------------------------------------
    # Create announcement
    # --------------------------------------------------------

    announcement = Announcement(

        educator_id=educator_id,

        classroom_id=classroom_id,

        title=title.strip(),

        message=message.strip(),

        priority=priority

    )

    db.add(announcement)

    db.commit()

    db.refresh(announcement)

    return announcement, None


# ============================================================
# GET EDUCATOR ANNOUNCEMENTS
# ============================================================

def get_educator_announcements(
    educator_id: int,
    db: Session
):

    return (
        db.query(Announcement)
        .filter(
            Announcement.educator_id == educator_id
        )
        .order_by(
            Announcement.created_at.desc()
        )
        .all()
    )


# ============================================================
# DELETE ANNOUNCEMENT
# ============================================================

def delete_announcement(
    educator_id: int,
    announcement_id: int,
    db: Session
):

    announcement = (
        db.query(Announcement)
        .filter(
            Announcement.id == announcement_id,
            Announcement.educator_id == educator_id
        )
        .first()
    )

    if announcement is None:

        return False


    db.delete(announcement)

    db.commit()

    return True


# ============================================================
# GET LEARNER ANNOUNCEMENTS
# ============================================================

def get_learner_announcements(
    learner,
    db: Session
):

    query = (
        db.query(Announcement)
        .filter(
            (
                Announcement.classroom_id == None
            )
            |
            (
                Announcement.classroom_id ==
                learner.classroom_id
            )
        )
        .order_by(
            Announcement.created_at.desc()
        )
    )

    return query.all()