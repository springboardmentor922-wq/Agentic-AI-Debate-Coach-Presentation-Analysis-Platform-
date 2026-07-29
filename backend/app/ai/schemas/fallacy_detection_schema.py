"""
Logical Fallacy Detection Schema

Purpose:
    Defines the structured output schema for the Logical Fallacy
    Detection Engine.

Responsibilities:
    - Represent detected logical fallacies.
    - Validate AI responses.
    - Standardize output across the application.
"""

from typing import List, Literal

from pydantic import BaseModel, Field


class DetectedFallacy(BaseModel):
    """
    Represents a detected logical fallacy.
    """

    fallacy_type: Literal[
        "Ad Hominem",
        "Straw Man",
        "False Dilemma",
        "Slippery Slope",
        "Appeal to Authority",
        "Circular Reasoning",
        "Hasty Generalization",
        "Red Herring",
    ]

    excerpt: str = Field(
        ...,
        description="Part of the argument where the fallacy occurs."
    )

    confidence: float = Field(
        ...,
        ge=0,
        le=1,
        description="Model confidence score."
    )


class ExplanationGeneration(BaseModel):
    """
    Explanation of detected fallacies.
    """

    explanation: str = Field(
        ...,
        description="Why the detected reasoning is considered fallacious."
    )


class CorrectionSuggestion(BaseModel):
    """
    Suggestions to improve reasoning.
    """

    suggestions: List[str] = Field(
        default_factory=list,
        description="Recommended corrections."
    )


class ReasoningAnalysis(BaseModel):
    """
    Overall reasoning quality.
    """

    reasoning_summary: str

    reasoning_quality: Literal[
        "Excellent",
        "Good",
        "Fair",
        "Poor",
    ]


class CredibilityAssessment(BaseModel):
    """
    Overall credibility assessment.
    """

    credibility_level: Literal[
        "High",
        "Medium",
        "Low",
    ]

    credibility_score: float = Field(
        ...,
        ge=0,
        le=100,
    )

    justification: str


class FallacyDetectionResponse(BaseModel):
    """
    Complete logical fallacy detection result.
    """

    detected_fallacies: List[
        DetectedFallacy
    ] = Field(
        default_factory=list
    )

    explanation_generation: ExplanationGeneration

    correction_suggestions: CorrectionSuggestion

    reasoning_analysis: ReasoningAnalysis

    credibility_assessment: CredibilityAssessment

    executive_summary: str