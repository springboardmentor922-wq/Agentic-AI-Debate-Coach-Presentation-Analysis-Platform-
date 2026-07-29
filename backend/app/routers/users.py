from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import users_collection
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserProfileUpdate, UserOut, UserRole
from app.routers.auth import _serialize_user

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.put("/me", response_model=UserOut)
async def update_my_profile(payload: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if updates:
        await users_collection.update_one({"_id": ObjectId(current_user["id"])}, {"$set": updates})
    user = await users_collection.find_one({"_id": ObjectId(current_user["id"])})
    return _serialize_user(user)


@router.get("/stats/platform")
async def platform_stats(current_user: dict = Depends(get_current_user)):
    """
    Total users / learners / debate coaches / educators — visible on every role dashboard
    per the PDF requirement.
    """
    total_users = await users_collection.count_documents({})
    total_learners = await users_collection.count_documents({"role": UserRole.learner.value})
    total_coaches = await users_collection.count_documents({"role": UserRole.debate_coach.value})
    total_educators = await users_collection.count_documents({"role": UserRole.educator.value})
    total_admins = await users_collection.count_documents({"role": UserRole.administrator.value})
    return {
        "total_users": total_users,
        "total_learners": total_learners,
        "total_debate_coaches": total_coaches,
        "total_educators": total_educators,
        "total_administrators": total_admins,
    }


@router.get("/", response_model=list[UserOut])
async def list_users(current_user: dict = Depends(require_roles(UserRole.administrator))):
    cursor = users_collection.find({})
    users = [_serialize_user(u) async for u in cursor]
    return users


@router.get("/learners", response_model=list[UserOut])
async def list_learners(
    current_user: dict = Depends(require_roles(UserRole.debate_coach, UserRole.educator, UserRole.administrator))
):
    cursor = users_collection.find({"role": UserRole.learner.value})
    return [_serialize_user(u) async for u in cursor]


@router.patch("/{user_id}/deactivate")
async def deactivate_user(user_id: str, current_user: dict = Depends(require_roles(UserRole.administrator))):
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deactivated"}


@router.patch("/{user_id}/activate")
async def activate_user(user_id: str, current_user: dict = Depends(require_roles(UserRole.administrator))):
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User activated"}
