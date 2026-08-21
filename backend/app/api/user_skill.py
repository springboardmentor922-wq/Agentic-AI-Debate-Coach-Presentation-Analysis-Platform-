"""
=========================================================
User Skill API

Endpoints

POST    /skills
GET     /skills/me
PUT     /skills/me

=========================================================
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth import (
    get_current_user,
    require_any_role
)

from app.models.user import User

from app.schemas.user_skill import (
    CreateUserSkillRequest,
    UpdateUserSkillRequest,
    UserSkillResponse
)

from app.services.user_skill_service import (
    UserSkillService
)


router = APIRouter(
    prefix="/skills",
    tags=["User Skills"]
)


# ==========================================================
# Create User Skill Record
# ==========================================================

@router.post(
    "",
    response_model=UserSkillResponse,
    status_code=status.HTTP_201_CREATED
)
def create_skill(
    skill_data: CreateUserSkillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Learner",
                "Debate Coach",
                "Educator"
            ]
        )
    )
):

    try:

        return UserSkillService.create_skill(
            db=db,
            current_user=current_user,
            skill_data=skill_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# Get My Skill Record
# ==========================================================

@router.get(
    "/me",
    response_model=UserSkillResponse
)
def get_my_skill(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return UserSkillService.get_my_skill(
            db=db,
            current_user=current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Update My Skill Record
# ==========================================================

@router.put(
    "/me",
    response_model=UserSkillResponse
)
def update_my_skill(
    skill_data: UpdateUserSkillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return UserSkillService.update_skill(
            db=db,
            current_user=current_user,
            skill_data=skill_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )