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

from fastapi import APIRouter, HTTPException, status

from app.schemas.ai_analysis import (
    ArgumentAnalysisRequest,
    AIAnalysisAPIResponse,
    AIAnalysisData,
)
from app.services.ai_analysis_service import ai_analysis_service

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

        argument_analysis = (
            ai_analysis_service.analyze_argument(
                request.argument
            )
        )

        fallacy_analysis = (
            ai_analysis_service.detect_fallacies(
                request.argument
            )
        )

        return AIAnalysisAPIResponse(
            success=True,
            message="AI analysis completed successfully.",
            data=AIAnalysisData(
                argument_analysis=argument_analysis,
                logical_fallacy_analysis=fallacy_analysis,
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(exc)}",
        )