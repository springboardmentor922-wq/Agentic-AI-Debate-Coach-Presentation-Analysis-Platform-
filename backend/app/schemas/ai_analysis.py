import time
from fastapi import APIRouter, HTTPException
from app.schemas.ai_analysis import AIAnalysisRequest, AIAnalysisResponse
from app.services.auditor import AuditorEngine

router = APIRouter(prefix="/api/v1/ai-analysis", tags=["AI Analysis"])
auditor = AuditorEngine()

@router.post("/process", response_model=AIAnalysisResponse)
async def process_analysis(payload: AIAnalysisRequest):
    start_time = time.time()
    try:
        # Run the core analysis engine
        result = await auditor.analyze_argument(payload.text)
        execution_time = (time.time() - start_time) * 1000

        return AIAnalysisResponse(
            session_id=payload.session_id,
            user_text=payload.text,
            argument_analysis=result if payload.run_argument_analysis else None,
            fallacy_detection=result if payload.run_fallacy_detection else None,
            execution_time_ms=execution_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))