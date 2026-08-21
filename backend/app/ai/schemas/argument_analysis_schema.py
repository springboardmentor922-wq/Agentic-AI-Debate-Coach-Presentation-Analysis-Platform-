"""
===============================================================================
Argument Analysis Schema
===============================================================================

Module:
    app.ai.schemas.argument_analysis_schema

Purpose:
    Defines the standardized data models (schemas) for the Argument Analysis
    Engine using Pydantic. These schemas act as the contract between the
    Large Language Model (LLM), backend services, APIs, and frontend
    components.

Project:
    Agentic AI Debate Coach & Presentation Analysis Platform

Milestone:
    Milestone 2 – Argument Analysis Engine

Responsibilities:
    - Define the structure of AI-generated argument analysis.
    - Validate all AI responses before sending them to the frontend.
    - Ensure every response follows a consistent and predictable format.
    - Prevent invalid or incomplete AI outputs from propagating through the
      application.
    - Provide strongly typed models for backend services and API endpoints.

Workflow:
    User Speech
          │
          ▼
    Argument Analysis Prompt
          │
          ▼
    Llama 3.1 (Ollama)
          │
          ▼
    AI Generated Response
          │
          ▼
    Argument Analysis Schema (Validation)
          │
          ▼
    Backend Service
          │
          ▼
    FastAPI Endpoint
          │
          ▼
    AI Analysis Panel (Frontend)

Milestone 2 Components Represented:
    1. Argument Extraction
    2. Claim Identification
    3. Evidence Evaluation
    4. Argument Strength Assessment
    5. Reasoning Quality Analysis

Evaluation Criteria:
    - Clarity
    - Relevance
    - Evidence Strength
    - Logical Consistency
    - Persuasiveness

Design Principles:
    - Single Responsibility Principle (SRP)
    - Strong Data Validation
    - Modular Architecture
    - Reusable Components
    - Clean Separation of Concerns
    - Industry Standard Pydantic Models

Note:
    This module DOES NOT perform AI analysis.
    It only defines the expected structure of the AI response.
    The actual analysis is performed by the Argument Analysis Agent,
    while this module validates and standardizes the generated output.
===============================================================================
"""

from typing import List, Literal

from pydantic import BaseModel, Field


class ArgumentExtraction(BaseModel):
    """
    Extracted primary argument from the user's speech.
    """

    original_argument: str = Field(
        ...,
        description="Original argument submitted by the user."
    )

    extracted_argument: str = Field(
        ...,
        description="Normalized version of the user's primary argument."
    )


class ClaimIdentification(BaseModel):
    """
    Claims identified within the argument.
    """

    primary_claim: str = Field(
        ...,
        description="Main claim presented in the argument."
    )

    supporting_claims: List[str] = Field(
        default_factory=list,
        description="Supporting claims identified in the argument."
    )


class EvidenceEvaluation(BaseModel):
    """
    Evaluation of evidence used in the argument.
    """

    evidence_items: List[str] = Field(
        default_factory=list,
        description="Evidence identified in the argument."
    )

    evidence_strength: Literal[
        "Very Weak",
        "Weak",
        "Moderate",
        "Strong",
        "Very Strong",
    ] = Field(
        ...,
        description="Overall quality of supporting evidence."
    )

    evidence_analysis: str = Field(
        ...,
        description="Analysis of how effectively the evidence supports the claims."
    )


class ArgumentStrengthAssessment(BaseModel):
    """
    Overall strength assessment.
    """

    strength_level: Literal[
        "Very Weak",
        "Weak",
        "Moderate",
        "Strong",
        "Very Strong",
    ] = Field(
        ...,
        description="Overall strength of the argument."
    )

    justification: str = Field(
        ...,
        description="Reason for assigning the argument strength."
    )


class ReasoningQualityAnalysis(BaseModel):
    """
    Logical reasoning quality assessment.
    """

    reasoning_summary: str = Field(
        ...,
        description="Evaluation of the reasoning process."
    )

    reasoning_quality: Literal[
        "Poor",
        "Fair",
        "Good",
        "Excellent",
    ] = Field(
        ...,
        description="Overall reasoning quality."
    )


class EvaluationCriteria(BaseModel):
    """
    Milestone 2 evaluation criteria.
    Scores range from 1 to 10.
    """

    clarity: int = Field(..., ge=1, le=10)

    relevance: int = Field(..., ge=1, le=10)

    evidence_strength: int = Field(..., ge=1, le=10)

    logical_consistency: int = Field(..., ge=1, le=10)

    persuasiveness: int = Field(..., ge=1, le=10)


class ArgumentScoring(BaseModel):
    """
    Overall argument scoring based on the evaluation criteria.
    """

    overall_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Overall argument quality score."
    )

    score_justification: str = Field(
        ...,
        description="Explanation for the assigned overall score."
    )


class ArgumentAnalysisResponse(BaseModel):
    """
    Complete Argument Analysis Engine response.
    """

    argument_extraction: ArgumentExtraction

    claim_identification: ClaimIdentification

    evidence_evaluation: EvidenceEvaluation

    argument_strength_assessment: ArgumentStrengthAssessment

    reasoning_quality_analysis: ReasoningQualityAnalysis

    evaluation_criteria: EvaluationCriteria

    argument_scoring: ArgumentScoring

    executive_summary: str = Field(
        ...,
        description="Overall summary of the argument analysis."
    )

    improvement_recommendations: List[str] = Field(
        default_factory=list,
        description="Suggestions for improving the argument."
    )