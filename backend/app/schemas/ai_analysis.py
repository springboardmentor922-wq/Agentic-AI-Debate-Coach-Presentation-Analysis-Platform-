"""
AI Analysis API Schemas

Purpose:
    Defines the request and response models for the AI Analysis API.

Responsibilities:
    - Validate incoming API requests.
    - Standardize API responses.
    - Aggregate results from multiple AI engines.

Note:
    These schemas belong to the API layer and should not contain
    any AI processing logic.
"""

from pydantic import BaseModel, Field

from app.ai.schemas.argument_analysis_schema import (
    ArgumentAnalysisResponse,
)
from app.ai.schemas.fallacy_detection_schema import (
    FallacyDetectionResponse,
)


class ArgumentAnalysisRequest(BaseModel):
    """
    Request model for AI analysis.
    """

    session_id: int = Field(
        ...,
        gt=0,
        description="Debate session identifier."
    )

    argument: str = Field(
        ...,
        min_length=10,
        description="User's debate argument."
    )


class AIAnalysisData(BaseModel):
    """
    Combined AI analysis results.
    """

    argument_analysis: ArgumentAnalysisResponse

    logical_fallacy_analysis: FallacyDetectionResponse


class AIAnalysisAPIResponse(BaseModel):
    """
    Standard API response returned to the frontend.
    """

    success: bool

    message: str

    data: AIAnalysisData