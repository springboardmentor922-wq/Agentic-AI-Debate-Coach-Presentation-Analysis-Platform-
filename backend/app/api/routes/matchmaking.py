from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.mongodb import invites_collection
from app.db.postgres import get_db
from app.models.debate_session import DebateSession, OpponentType
from app.models.role import RoleName
from app.models.user import User
from app.schemas.matchmaking import AvailableUser, HeartbeatResponse, InviteCreate, InviteOut, InviteRespond

router = APIRouter(prefix="/api/v1", tags=["Matchmaking"])

ONLINE_THRESHOLD_MINUTES = 2
INVITE_TIMEOUT_SECONDS = 60


@router.post("/users/heartbeat", response_model=HeartbeatResponse)
def heartbeat(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    current_user.last_active_at = datetime.now(timezone.utc)
    db.commit()
    return HeartbeatResponse()


@router.get("/users/available", response_model=list[AvailableUser])
def list_available_users(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    threshold = datetime.now(timezone.utc) - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
    users = (
        db.query(User)
        .join(User.role)
        .filter(
            User.id != current_user.id,
            User.is_active == True,  # noqa: E712
            User.is_deleted == False,  # noqa: E712
            User.last_active_at != None,  # noqa: E711
            User.last_active_at >= threshold,
            User.role.has(User.role.property.mapper.class_.name.in_([RoleName.LEARNER.value, RoleName.DEBATE_COACH.value])),
        )
        .all()
    )
    return [AvailableUser(id=u.id, full_name=u.full_name, role=u.role.name) for u in users]


@router.post("/debate/invite", response_model=InviteOut, status_code=201)
async def send_invite(
    payload: InviteCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    session = db.query(DebateSession).filter(DebateSession.id == payload.session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    to_user = db.query(User).filter(User.id == payload.to_user_id).first()
    if not to_user:
        raise HTTPException(status_code=404, detail="Invited user not found")

    doc = {
        "from_user_id": current_user.id,
        "from_user_name": current_user.full_name,
        "to_user_id": payload.to_user_id,
        "session_id": payload.session_id,
        "invite_type": payload.invite_type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    result = await invites_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return InviteOut(**doc)


@router.get("/debate/invites/pending", response_model=list[InviteOut])
async def list_pending_invites(current_user: User = Depends(get_current_active_user)):
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=INVITE_TIMEOUT_SECONDS)

    # Auto-expire stale invites addressed to this user
    await invites_collection.update_many(
        {"to_user_id": current_user.id, "status": "pending", "created_at": {"$lt": cutoff}},
        {"$set": {"status": "expired"}},
    )

    cursor = invites_collection.find({"to_user_id": current_user.id, "status": "pending"}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        results.append(InviteOut(**doc))
    return results


@router.get("/debate/invites/{invite_id}", response_model=InviteOut)
async def get_invite(invite_id: str, current_user: User = Depends(get_current_active_user)):
    doc = await invites_collection.find_one({"_id": ObjectId(invite_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invite not found")
    if doc["from_user_id"] != current_user.id and doc["to_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your invite")
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return InviteOut(**doc)


@router.patch("/debate/invites/{invite_id}", response_model=InviteOut)
async def respond_to_invite(
    invite_id: str,
    payload: InviteRespond,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    doc = await invites_collection.find_one({"_id": ObjectId(invite_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invite not found")
    if doc["to_user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your invite to respond to")
    if doc["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Invite already {doc['status']}")

    new_status = "accepted" if payload.accept else "declined"
    await invites_collection.update_one({"_id": ObjectId(invite_id)}, {"$set": {"status": new_status}})

    if payload.accept:
        session = db.query(DebateSession).filter(DebateSession.id == doc["session_id"]).first()
        if session:
            opponent_type_map = {
                "human": OpponentType.HUMAN,
                "coach_debate": OpponentType.COACH_DEBATE,
                "coach_adjudicate": OpponentType.COACH_ADJUDICATE,
            }
            session.opponent_type = opponent_type_map.get(doc["invite_type"], OpponentType.HUMAN)
            session.opponent_user_id = current_user.id
            db.commit()

    doc["status"] = new_status
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return InviteOut(**doc)