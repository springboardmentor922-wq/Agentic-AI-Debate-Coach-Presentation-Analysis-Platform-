from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import FallacyRequest
from ..agents.auditor_agent import analyze_argument
from ..schemas import CounterArgumentRequest
from ..agents.opponent_agent import generate_counterargument
from ..schemas import FeedbackRequest
from ..schemas import PresentationRequest
from ..agents.feedback_agent import generate_feedback
from ..services.debate_service import analyze_debate
from ..services.history_service import (
    get_all_history,
    get_history_by_id
)
from ..services.presentation_service import analyze_presentation
router = APIRouter(
    prefix="/analysis",
    tags=["Argument Analysis"]
)


@router.post("/fallacy")
def detect_fallacy(request: FallacyRequest):

    result = analyze_argument(request.text)

    return result

@router.post("/counterargument")
def counter_argument(request: CounterArgumentRequest):

    return generate_counterargument(request.text)

@router.post("/feedback")
def feedback(request: FeedbackRequest):

    return generate_feedback(request.text)


@router.post("/presentation")
def presentation_analysis(request: PresentationRequest):
    return analyze_presentation(request.transcript, request.duration_seconds)

@router.post("/analyze")
def full_analysis(
    request: FallacyRequest,
    db: Session = Depends(get_db)
):

    return analyze_debate(request.text, db)

@router.get("/history")
def history(db: Session = Depends(get_db)):

    return get_all_history(db)

@router.get("/history/{history_id}")
def history_detail(
    history_id: int,
    db: Session = Depends(get_db)
):

    return get_history_by_id(history_id, db)
