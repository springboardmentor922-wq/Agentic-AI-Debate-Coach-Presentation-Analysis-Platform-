from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..services.debate_service import analyze_debate
from ..database import get_db
from ..dependencies import get_current_user
from .. import crud, schemas

router = APIRouter(
    prefix="/debates",
    tags=["Debates"]
)
class DebateChatRequest(BaseModel):
    argument: str

@router.post("/chat")
def debate_chat(
    request: DebateChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    result = analyze_debate(
        request.argument,
        db
    )

    return result
@router.post("/")
def create_debate(
    debate: schemas.DebateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return crud.create_debate(
        db,
        debate,
        current_user["id"]
    )