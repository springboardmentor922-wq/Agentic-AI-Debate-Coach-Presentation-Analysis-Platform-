from fastapi import APIRouter
from sqlalchemy.orm import Session

from database import get_db


from fastapi import Depends
from models.debate_history import DebateHistory
from services.history_service import HistoryService
from schemas.ai_schema import DebateRequest, DebateResponse
from engine import DebateEngine

router = APIRouter(
    prefix="/debate",
    tags=["Debate"]
)

engine = DebateEngine()
history_service = HistoryService()

@router.post("/process-turn", response_model=DebateResponse)
def process_turn(
    request: DebateRequest,
    db: Session = Depends(get_db)
):

    prompt = engine.get_prompt(request.debate_format)

    level_instruction = engine.get_level_instruction(
        request.experience_level
    )

    analysis = engine.analyze_argument(
        request.user_argument
    )

    ai_reply = engine.generate_ai_response(
    experience_level=request.experience_level,
    debate_format=request.debate_format,
    topic=request.topic,
    user_argument=request.user_argument
)
    fallacy_report = engine.detect_fallacy(
    request.user_argument
)
    argument_score = engine.score_argument(
    request.topic,
    request.user_argument
)
    coaching_feedback = engine.generate_coaching_feedback(
    request.topic,
    request.user_argument
)
    history_service.save_debate(
    db=db,
    user_id=1,
    topic=request.topic,
    debate_format=request.debate_format,
    experience_level=request.experience_level,
    user_argument=request.user_argument,
    ai_response=ai_reply,
    fallacy_report=fallacy_report,
    argument_score=argument_score,
    coaching_feedback=coaching_feedback
)

    return DebateResponse(
        debate_format=request.debate_format,
        experience_level=request.experience_level,
        topic=request.topic,
        word_count=analysis["word_count"],
        character_count=analysis["character_count"],
        is_long_argument=analysis["is_long_argument"],
        ai_response=ai_reply,
        fallacy_report=fallacy_report,
        argument_score=argument_score,
        coaching_feedback=coaching_feedback
    )
@router.get("/history")
def get_debate_history(
        db: Session = Depends(get_db)
    ):
        history = history_service.get_history(db)

        return history
from fastapi import HTTPException
@router.get("/history/{debate_id}")
def get_debate(
    debate_id: int,
    db: Session = Depends(get_db)
):
    debate = history_service.get_debate_by_id(db, debate_id)

    if debate is None:
        raise HTTPException(
            status_code=404,
            detail="Debate not found"
        )

    return debate
@router.delete("/history/{debate_id}")
def delete_debate(
    debate_id: int,
    db: Session = Depends(get_db)
):
    debate = db.query(DebateHistory).filter(
        DebateHistory.id == debate_id
    ).first()

    if debate is None:
        raise HTTPException(
            status_code=404,
            detail="Debate not found"
        )

    db.delete(debate)
    db.commit()

    return {
        "message": "Debate deleted successfully"
    }