from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.schemas.announcement import (
    AnnouncementCreate,
    AnnouncementResponse
)

from app.services.announcement_service import (
    create_announcement,
    get_educator_announcements,
    get_learner_announcements,
    delete_announcement
)


router = APIRouter(

    prefix="/announcements",

    tags=["Announcements"]

)


# ============================================================
# EDUCATOR - CREATE
# ============================================================

@router.post(
    "/",
    response_model=AnnouncementResponse
)
def create(

    data: AnnouncementCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    if not data.title.strip():

        raise HTTPException(
            status_code=400,
            detail="Title is required"
        )


    if not data.message.strip():

        raise HTTPException(
            status_code=400,
            detail="Message is required"
        )


    announcement, error = create_announcement(

        educator_id=current_user.id,

        title=data.title,

        message=data.message,

        classroom_id=data.classroom_id,

        priority=data.priority,

        db=db

    )


    if error:

        raise HTTPException(
            status_code=400,
            detail=error
        )


    return announcement


# ============================================================
# EDUCATOR - GET OWN ANNOUNCEMENTS
# ============================================================

@router.get(
    "/educator"
)
def educator_announcements(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    return get_educator_announcements(

        current_user.id,

        db

    )


# ============================================================
# LEARNER - GET ANNOUNCEMENTS
# ============================================================

@router.get(
    "/learner"
)
def learner_announcements(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if current_user.role != "Learner":

        raise HTTPException(
            status_code=403,
            detail="Learner access required"
        )


    return get_learner_announcements(

        current_user,

        db

    )


# ============================================================
# EDUCATOR - DELETE
# ============================================================

@router.delete(
    "/{announcement_id}"
)
def delete(

    announcement_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    deleted = delete_announcement(

        current_user.id,

        announcement_id,

        db

    )


    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Announcement not found"
        )


    return {
        "message":
            "Announcement deleted successfully"
    }