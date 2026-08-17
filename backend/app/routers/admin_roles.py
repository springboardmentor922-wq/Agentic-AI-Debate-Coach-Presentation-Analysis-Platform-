from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/admin/roles",
    tags=["Admin Role & Permissions"]
)


ALLOWED_ROLES = [
    "Learner",
    "Coach",
    "Educator",
    "Administrator"
]


# =========================================================
# ADMIN CHECK
# =========================================================

def check_admin(current_user):

    if current_user.role.lower() not in [
        "administrator",
        "admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )


# =========================================================
# GET ALL ROLES
# =========================================================

@router.get("/")
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    check_admin(current_user)

    users = db.query(User).all()

    roles = []

    for role_name in ALLOWED_ROLES:

        role_users = [
            user
            for user in users
            if user.role
            and user.role.lower() == role_name.lower()
        ]

        roles.append({
            "name": role_name,
            "user_count": len(role_users),
            "users": [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role
                }
                for user in role_users
            ]
        })

    return roles


# =========================================================
# GET USERS OF A ROLE
# =========================================================

@router.get("/{role_name}/users")
def get_role_users(
    role_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    check_admin(current_user)

    users = (
        db.query(User)
        .filter(
            User.role.ilike(role_name)
        )
        .all()
    )

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


# =========================================================
# CHANGE USER ROLE
# =========================================================

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    check_admin(current_user)

    # Check role
    if new_role not in ALLOWED_ROLES:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    # Find user
    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Prevent administrator from accidentally
    # removing their own administrator role
    if user.id == current_user.id:

        raise HTTPException(
            status_code=400,
            detail="You cannot change your own administrator role."
        )

    old_role = user.role

    user.role = new_role

    db.commit()

    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "old_role": old_role,
            "new_role": user.role
        }
    }