from typing import List, Optional

from pydantic import BaseModel, Field


class PresentationMetrics(BaseModel):
    """Milestone 4: Presentation Analysis Engine.

    Combines a deterministic filler-word count (regex, reliable) with an
    LLM-graded assessment of confidence, clarity, and engagement from the
    transcript. Temperature 0 for the LLM portion, same consistency
    rationale as the Auditor and Scorer.
    """

    filler_word_count: int = Field(description="Total count of filler words/phrases detected.")
    filler_words_found: List[str] = Field(
        default_factory=list, description="The specific filler words/phrases detected, in order."
    )
    confidence_score: int = Field(ge=0, le=100, description="How confident and assured the delivery sounds.")
    clarity_score: int = Field(ge=0, le=100, description="How clear and easy to follow the spoken delivery is.")
    engagement_score: int = Field(ge=0, le=100, description="How engaging and dynamic the delivery is.")
    feedback: Optional[str] = Field(
        default=None, description="One or two sentences of specific, actionable presentation feedback."
    )