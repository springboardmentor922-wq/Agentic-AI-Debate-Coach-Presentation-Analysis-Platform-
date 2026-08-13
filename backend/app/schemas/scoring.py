from pydantic import BaseModel, Field


class ArgumentScore(BaseModel):
    clarity: int = Field(ge=0, le=10, description="How clearly the argument was expressed")
    evidence_strength: int = Field(ge=0, le=10, description="How well-supported the claims are")
    rebuttal_quality: int = Field(ge=0, le=10, description="How directly and effectively it addressed the opponent's prior point")
    logical_consistency: int = Field(ge=0, le=10, description="Absence of internal contradictions or fallacies")
    overall_note: str = Field(description="One short sentence of constructive feedback")