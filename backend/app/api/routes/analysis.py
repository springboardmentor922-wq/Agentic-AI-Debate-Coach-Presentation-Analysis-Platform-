from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_active_user
from app.db.mongodb import fallacy_analysis_collection
from app.models.user import User
from app.schemas.analysis import FallacyAnalysisRequest, FallacyAnalysisResponse
from app.services.fallacy_detection import analyze_for_fallacy

router = APIRouter(prefix="/api/v1/analysis", tags=["AI Analysis"])


@router.post("/fallacy", response_model=FallacyAnalysisResponse)
async def detect_fallacy(
    payload: FallacyAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Argument text cannot be empty or whitespace only.")

    try:
        result = analyze_for_fallacy(payload.text)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    await fallacy_analysis_collection.insert_one(
        {
            "user_id": current_user.id,
            "session_id": payload.session_id,
            "input_text": payload.text,
            "result": result.model_dump(),
            "created_at": datetime.now(timezone.utc),
        }
    )

    return FallacyAnalysisResponse(result=result, analyzed_text=payload.text)