from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.schemas.assignment import (
    AssignmentCreate
)

from app.services.assignment_service import (
    create_assignment,
    get_educator_assignments,
    delete_assignment
)


router = APIRouter(

    prefix="/educator/assignments",

    tags=["Educator Assignments"]

)


# ============================================================
# GET ALL EDUCATOR ASSIGNMENTS
# ============================================================

@router.get("/")
def get_assignments(

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

    return get_educator_assignments(

        current_user.id,

        db

    )


# ============================================================
# CREATE ASSIGNMENT
# ============================================================

@router.post("/")
def create(

    data: AssignmentCreate,

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


    try:

        return create_assignment(

            current_user,

            data,

            db

        )

    except ValueError as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)

        )


# ============================================================
# DELETE ASSIGNMENT
# ============================================================

@router.delete("/{assignment_id}")
def delete(

    assignment_id: int,

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


    deleted = delete_assignment(

        current_user.id,

        assignment_id,

        db

    )


    if deleted is None:

        raise HTTPException(

            status_code=404,

            detail="Assignment not found"

        )


    return {

        "message":
            "Assignment deleted successfully"

    }