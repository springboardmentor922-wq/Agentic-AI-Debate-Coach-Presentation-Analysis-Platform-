import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_active_user
from app.db.mongodb import argument_analysis_collection
from app.models.user import User
from app.schemas.argument_analysis import ArgumentAnalysisRequest, ArgumentAnalysisResponse
from app.services.argument_analysis import analyze_argument

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/analysis", tags=["AI Analysis"])


@router.post(
    "/argument",
    response_model=ArgumentAnalysisResponse,
    summary="Analyze the logical structure of a debate argument",
    description=(
        "Extracts the claim, supporting evidence, implicit assumptions, reasoning, and "
        "conclusion from a single piece of debate argument text, using the Argument "
        "Analysis AI service."
    ),
)
async def analyze_argument_endpoint(
    payload: ArgumentAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Argument text cannot be empty or whitespace only.")
    try:
        result = analyze_argument(payload.text)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    try:
        await argument_analysis_collection.insert_one(
            {
                "user_id": current_user.id,
                "session_id": payload.session_id,
                "original_text": payload.text,
                "claim": result.claim,
                "evidence": result.evidence,
                "assumptions": result.assumptions,
                "reasoning": result.reasoning,
                "conclusion": result.conclusion,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception as e:
        # Storage failure should never take down the response — the user still gets
        # their analysis result even if we couldn't persist it this time.
        logger.error(f"Failed to store argument analysis for user {current_user.id}: {e}")

    return ArgumentAnalysisResponse(result=result, analyzed_text=payload.text)