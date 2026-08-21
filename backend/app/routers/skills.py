from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import skills_collection
from app.core.deps import get_current_user, require_roles
from app.schemas.skill import SkillCreate, SkillUpdate, SkillOut
from app.schemas.user import UserRole

router = APIRouter(prefix="/api/v1/skills", tags=["Skill Tracking"])


def _serialize(doc: dict) -> SkillOut:
    return SkillOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        name=doc["name"],
        level=doc["level"],
        category=doc.get("category"),
        notes=doc.get("notes"),
        updated_at=doc["updated_at"],
    )


def _object_id(skill_id: str) -> ObjectId:
    try:
        return ObjectId(skill_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid skill id")


@router.get("/", response_model=list[SkillOut])
async def list_my_skills(current_user: dict = Depends(get_current_user)):
    """Module 2: User Profile & Skill Management — communication skill tracking."""
    cursor = skills_collection.find({"user_id": current_user["id"]}).sort("name", 1)
    return [_serialize(doc) async for doc in cursor]


@router.post("/", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
async def create_skill(payload: SkillCreate, current_user: dict = Depends(require_roles(UserRole.learner))):
    existing = await skills_collection.find_one(
        {"user_id": current_user["id"], "name": payload.name}
    )
    if existing:
        raise HTTPException(status_code=400, detail="A skill with this name already exists")

    doc = {
        "user_id": current_user["id"],
        "name": payload.name,
        "level": payload.level,
        "category": payload.category,
        "notes": payload.notes,
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = await skills_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.put("/{skill_id}", response_model=SkillOut)
async def update_skill(skill_id: str, payload: SkillUpdate, current_user: dict = Depends(require_roles(UserRole.learner))):
    oid = _object_id(skill_id)
    doc = await skills_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Skill not found")

    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.utcnow().isoformat()
        await skills_collection.update_one({"_id": oid}, {"$set": updates})
    doc = await skills_collection.find_one({"_id": oid})
    return _serialize(doc)


@router.delete("/{skill_id}", status_code=status.HTTP_200_OK)
async def delete_skill(skill_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    oid = _object_id(skill_id)
    doc = await skills_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Skill not found")

    await skills_collection.delete_one({"_id": oid})
    return {"message": "Skill removed"}
