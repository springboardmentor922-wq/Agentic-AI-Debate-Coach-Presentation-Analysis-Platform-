from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker
from app.db.mongodb import fallacy_analysis_collection, feedback_collection, invites_collection
from app.db.postgres import get_db
from app.models.debate_session import DebateSession
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user import UserOut

router = APIRouter(prefix="/api/v1/admin", tags=["Administration"])

admin_only = RoleChecker([RoleName.ADMINISTRATOR])


class StatusUpdateRequest(BaseModel):
    status: str  # "active" | "disabled"


@router.get("/users", response_model=list[UserOut])
def list_all_users(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    return (
        db.query(User)
        .filter(User.is_deleted == False)  # noqa: E712
        .order_by(User.created_at.desc())
        .all()
    )


@router.patch("/users/{user_id}/role", response_model=UserOut)
def change_user_role(
    user_id: int,
    new_role: RoleName,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(Role).filter(Role.name == new_role.value).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role_id = role.id
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    if payload.status not in ("active", "disabled"):
        raise HTTPException(status_code=400, detail="status must be 'active' or 'disabled'")

    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.status == "active"
    db.commit()
    db.refresh(user)
    return user


# Kept for backward compatibility with any existing callers of the old endpoint
@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    return update_user_status(user_id, StatusUpdateRequest(status="disabled"), db, current_user)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hard delete: this user's own data is fully erased. Sessions they only *participated*
    # in as someone else's coach/opponent are preserved for that other user — we just clear
    # this user's slot on those rows rather than deleting someone else's history.
    db.query(DebateSession).filter(DebateSession.coach_id == user_id).update({"coach_id": None})
    db.query(DebateSession).filter(DebateSession.opponent_user_id == user_id).update({"opponent_user_id": None})

    db.query(DebateSession).filter(DebateSession.user_id == user_id).delete()

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if profile:
        db.delete(profile)

    db.delete(user)
    db.commit()

    # Clean up related MongoDB documents tied to this user
    await feedback_collection.delete_many({"$or": [{"user_id": user_id}, {"given_by_id": user_id}]})
    await fallacy_analysis_collection.delete_many({"user_id": user_id})
    await invites_collection.delete_many({"$or": [{"from_user_id": user_id}, {"to_user_id": user_id}]})

    return None