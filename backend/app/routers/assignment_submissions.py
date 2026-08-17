from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.schemas.assignment_submission import (
    AssignmentSubmissionCreate,
    AssignmentReviewCreate
)

from app.services.assignment_submission_service import (
    create_submission,
    get_learner_assignments,
    get_educator_submissions,
    review_submission
)


router = APIRouter(

    prefix="/assignment-submissions",

    tags=["Assignment Submissions"]

)


# ============================================================
# LEARNER: GET ASSIGNMENTS
# ============================================================

@router.get("/learner")
def learner_assignments(

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


    return get_learner_assignments(

        current_user,

        db

    )


# ============================================================
# LEARNER: SUBMIT ASSIGNMENT
# ============================================================

@router.post("/submit")
def submit_assignment(

    data: AssignmentSubmissionCreate,

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


    submission, error = create_submission(

        current_user,

        data.assignment_id,

        data.response,

        db

    )


    if error:

        raise HTTPException(

            status_code=400,

            detail=error

        )


    return submission


# ============================================================
# EDUCATOR: GET SUBMISSIONS
# ============================================================

@router.get("/educator")
def educator_submissions(

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


    return get_educator_submissions(

        current_user.id,

        db

    )


# ============================================================
# EDUCATOR: REVIEW
# ============================================================

@router.put("/educator/{submission_id}/review")
def review(

    submission_id: int,

    data: AssignmentReviewCreate,

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


    submission, error = review_submission(

        current_user.id,

        submission_id,

        data.score,

        data.educator_feedback,

        db

    )


    if error:

        raise HTTPException(

            status_code=400,

            detail=error

        )


    return submission