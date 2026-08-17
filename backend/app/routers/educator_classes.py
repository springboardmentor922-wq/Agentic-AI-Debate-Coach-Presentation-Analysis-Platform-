from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user

from app.services.educator_class_service import (
    get_educator_classes,
    create_educator_class,
    get_educator_class,
    update_educator_class,
    delete_educator_class,
    get_available_learners,
    assign_learners_to_class,
    remove_learner_from_class,
    get_class_analytics
)


router = APIRouter(
    prefix="/educator/classes",
    tags=["Educator Classes"]
)


# =========================================
# REQUEST SCHEMA
# =========================================

class ClassCreate(BaseModel):

    name: str

    description: str | None = None


# =========================================
# GET ALL CLASSES
# =========================================

@router.get("/")
def get_classes(

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

    return get_educator_classes(
        current_user.id,
        db
    )


# =========================================
# CREATE CLASS
# =========================================

@router.post("/")
def create_class(

    data: ClassCreate,

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

    if not data.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Class name is required"
        )

    return create_educator_class(

        current_user.id,

        data.name.strip(),

        data.description,

        db

    )


# =========================================
# GET SINGLE CLASS
# =========================================
# =========================================
# CLASS ANALYTICS
# =========================================

@router.get("/{class_id}/analytics")
def class_analytics(
    class_id: int,
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


    analytics = get_class_analytics(
        current_user.id,
        class_id,
        db
    )


    if analytics is None:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )


    return analytics


@router.get("/{class_id}")
def get_class(

    class_id: int,

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

    classroom = get_educator_class(

        current_user.id,

        class_id,

        db

    )

    if classroom is None:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    return classroom


# =========================================
# UPDATE CLASS
# =========================================

@router.put("/{class_id}")
def update_class(

    class_id: int,

    data: ClassCreate,

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

    if not data.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Class name is required"
        )

    classroom = update_educator_class(

        current_user.id,

        class_id,

        data.name.strip(),

        data.description,

        db

    )

    if classroom is None:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    return classroom


# =========================================
# DELETE CLASS
# =========================================

@router.delete("/{class_id}")
def delete_class(

    class_id: int,

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

    deleted = delete_educator_class(

        current_user.id,

        class_id,

        db

    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    return {
        "message": "Class deleted successfully"
    }


# =========================================
# GET AVAILABLE LEARNERS
# =========================================

@router.get("/{class_id}/available-learners")
def available_learners(

    class_id: int,

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

    learners = get_available_learners(

        current_user.id,

        class_id,

        db

    )

    if learners is None:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    return learners


# =========================================
# ASSIGN LEARNERS
# =========================================

@router.post("/{class_id}/assign-learners")
def assign_learners(

    class_id: int,

    learner_ids: list[int],

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

    if not learner_ids:

        raise HTTPException(
            status_code=400,
            detail="Select at least one learner"
        )

    result = assign_learners_to_class(

        current_user.id,

        class_id,

        learner_ids,

        db

    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    return result


# =========================================
# REMOVE LEARNER
# =========================================

@router.delete(
    "/{classroom_id}/learners/{learner_id}"
)
def remove_learner(
    classroom_id: int,
    learner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    result = remove_learner_from_class(
        current_user.id,
        classroom_id,
        learner_id,
        db
    )


    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Classroom not found"
        )


    if result is False:

        raise HTTPException(
            status_code=404,
            detail="Learner is not assigned to this class"
        )


    return result