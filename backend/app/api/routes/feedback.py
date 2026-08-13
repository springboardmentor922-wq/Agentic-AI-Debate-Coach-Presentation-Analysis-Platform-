from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.mongodb import feedback_collection
from app.db.postgres import get_db
from app.models.role import RoleName
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])

CAN_GIVE_FEEDBACK = (RoleName.DEBATE_COACH.value, RoleName.EDUCATOR.value, RoleName.ADMINISTRATOR.value)


@router.post("", response_model=FeedbackOut, status_code=201)
async def create_feedback(
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if current_user.role.name not in CAN_GIVE_FEEDBACK:
        raise HTTPException(status_code=403, detail="Only coaches, educators, or administrators can give feedback.")

    target = db.query(User).filter(User.id == payload.target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    doc = {
        "author_id": current_user.id,
        "author_name": current_user.full_name,
        "target_user_id": payload.target_user_id,
        "session_id": payload.session_id,
        "text": payload.text,
        "created_at": datetime.now(timezone.utc),
    }
    result = await feedback_collection.insert_one(doc)
    return FeedbackOut(id=str(result.inserted_id), **{k: v for k, v in doc.items()})


@router.get("/user/{user_id}", response_model=list[FeedbackOut])
async def list_feedback_for_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
):
    is_self = current_user.id == user_id
    is_org = current_user.role.name in (RoleName.ADMINISTRATOR.value, RoleName.EDUCATOR.value)
    is_coach_role = current_user.role.name == RoleName.DEBATE_COACH.value

    # A learner/coach can always see feedback addressed to them; admins/educators can see
    # anyone's; any debate_coach can see feedback threads to help coordinate with peers.
    # (Tighten this to "only the assigned coach" later if that becomes a requirement.)
    if not (is_self or is_org or is_coach_role):
        raise HTTPException(status_code=403, detail="You don't have permission to view this feedback.")

    cursor = feedback_collection.find({"target_user_id": user_id}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        items.append(FeedbackOut(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"}))
    return items