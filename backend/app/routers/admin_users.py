from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/admin/users",
    tags=["Admin User Management"]
)


# =========================================================
# GET ALL USERS
# =========================================================

@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Only administrators can access this
    if current_user.role.lower() != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )

    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]


# =========================================================
# GET SINGLE USER
# =========================================================

@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role.lower() != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }