from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class FallacyReport(BaseModel):
    """Data template returned strictly by Agent 1 (The Referee)"""
    fallacy_detected: bool = Field(description="True ONLY if a fallacy is committed.")
    fallacy_type: str = Field(description="Must be 'Ad Hominem', 'Straw Man', 'False Dilemma', 'Slippery Slope', 'Appeal to Authority', 'Circular Reasoning', 'Hasty Generalization', 'Red Herring', or 'None'.")
    offending_text: Optional[str] = Field(default=None, description="The broken phrase.")
    explanation: Optional[str] = Field(default=None, description="Why the reasoning failed.")
    correction_suggestion: Optional[str] = Field(default=None, description="How to correct this error.")

class FallacyReportSchema(FallacyReport):
    """Alias for backward compatibility"""
    pass

class PresentationMetrics(BaseModel):
    """Data template for speech pacing and filler metrics"""
    words_per_minute: int = Field(description="Calculated WPM.")
    pace_status: str = Field(description="Pacing status, e.g. Too Fast, Too Slow, Optimal.")
    filler_words_count: int = Field(description="Total filler word count.")
    filler_words_details: Dict[str, int] = Field(default_factory=dict, description="Occurrences of each filler word.")

class PresentationMetricsSchema(PresentationMetrics):
    """Alias for backward compatibility"""
    pass

class DebateTurnResponseSchema(BaseModel):
    """The unified clean response returned back to the front-end user interface"""
    user_transcript: str
    ai_rebuttal: str
    words_per_minute: int
    pace_status: str
    fallacy_metrics: Dict[str, Any]
