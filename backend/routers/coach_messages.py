from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.coach_message import CoachMessage
from models.user import User

router = APIRouter(
    prefix="/messages",
    tags=["Coach Messages"]
)

@router.get("/")
def get_messages(db: Session = Depends(get_db)):

    messages = (
        db.query(
            CoachMessage.message_id,
            User.full_name.label("learner_name"),
            CoachMessage.message,
            CoachMessage.status,
            CoachMessage.reply,
            CoachMessage.reply_status
        )
        .join(
            User,
            CoachMessage.learner_id == User.user_id
        )
        .all()
    )

    return [
        {
            "message_id": m.message_id,
            "learner_name": m.learner_name,
            "message": m.message,
            "status": m.status,
            "reply": m.reply,
            "reply_status": m.reply_status
        }
        for m in messages
    ]
class MessageCreate(BaseModel):
    learner_id: int
    coach_id: int
    message: str
class ReplyCreate(BaseModel):
    reply: str

@router.post("/")
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db)
):

    new_message = CoachMessage(
        learner_id=data.learner_id,
        coach_id=data.coach_id,
        message=data.message,
        status="Pending"
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "message_id": new_message.message_id,
        "message": new_message.message,
        "status": new_message.status
    } 
@router.put("/reply/{message_id}")
def reply_to_message(
    message_id: int,
    data: ReplyCreate,
    db: Session = Depends(get_db)
):

    message = (
        db.query(CoachMessage)
        .filter(
            CoachMessage.message_id == message_id
        )
        .first()
    )

    if not message:
        return {
            "error": "Message not found"
        }

    message.reply = data.reply
    message.reply_status = "Answered"
    message.status = "Answered"

    db.commit()

    return {
        "message_id": message.message_id,
        "reply": message.reply,
        "status": message.status
    }