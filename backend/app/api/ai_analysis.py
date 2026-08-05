"""
AI Analysis API

Purpose:
    Exposes REST endpoints for AI-powered debate analysis.

Responsibilities:
    - Validate incoming requests.
    - Invoke the AI Analysis Service.
    - Return standardized API responses.

Note:
    This module should not contain AI logic.
"""

import asyncio
from fastapi import APIRouter, HTTPException, status

from app.schemas.ai_analysis import (
    ArgumentAnalysisRequest,
    AIAnalysisAPIResponse,
    AIAnalysisData,
)
from app.services.ai_analysis_service import ai_analysis_service
from app.ai.schemas.argument_analysis_schema import ArgumentAnalysisResponse
from app.ai.schemas.fallacy_detection_schema import FallacyDetectionResponse

router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"],
)


@router.post(
    "/analyze",
    response_model=AIAnalysisAPIResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_argument(
    request: ArgumentAnalysisRequest,
):
    """
    Perform complete AI analysis of a debate argument.

    This endpoint performs:
        - Argument Analysis
        - Logical Fallacy Detection
    """

    try:

        workflow = await asyncio.to_thread(
            ai_analysis_service.analyze_with_workflow,
            session_id=request.session_id, argument=request.argument,
            debate_format=request.debate_format, difficulty=request.difficulty,
            user_position=request.user_position, current_round=request.current_round,
        )
        argument_analysis = ArgumentAnalysisResponse.model_validate(workflow["argument_analysis"])
        fallacy_analysis = FallacyDetectionResponse.model_validate(workflow["logical_fallacy_analysis"])

        return AIAnalysisAPIResponse(
            success=True,
            message="AI analysis completed successfully.",
            data=AIAnalysisData(
                argument_analysis=argument_analysis,
                logical_fallacy_analysis=fallacy_analysis,
            ),
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis is temporarily unavailable.",
        ) from exc
