from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.schemas.assigned_debate import (
    AssignedDebateCreate,
    AssignedDebateResponse
)

from app.services.assigned_debate_service import (
    assign_debate,
    get_all_assigned
)


router = APIRouter(

    prefix="/assigned-debates",

    tags=["Assigned Debates"]

)


# ==========================================
# ASSIGN NEW DEBATE
# ==========================================

@router.post(
    "/",
    response_model=AssignedDebateResponse
)
def assign(

    debate: AssignedDebateCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # Only Debate Coaches can assign
    # debates to learners.

    if current_user.role != "Debate Coach":

        raise HTTPException(
            status_code=403,
            detail="Only Debate Coaches can assign debates"
        )


    if not debate.topic.strip():

        raise HTTPException(
            status_code=400,
            detail="Topic is required"
        )


    result = assign_debate(

        current_user,

        debate,

        db

    )


    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )


    return result


# ==========================================
# GET ASSIGNED DEBATES
# ==========================================

@router.get(
    "/",
    response_model=list[AssignedDebateResponse]
)
def get_all(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_all_assigned(

        current_user,

        db

    )