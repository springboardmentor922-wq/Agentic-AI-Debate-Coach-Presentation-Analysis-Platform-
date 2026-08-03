from pydantic import BaseModel


class PresentationResponse(BaseModel):
    id: int
    filename: str
    status: str


class PresentationAnalysisResponse(BaseModel):
    clarity: int
    confidence: int
    speaking_speed: str
    filler_words: list[str]
    strengths: list[str]
    weaknesses: list[str]
    feedback: str
    overall_score: int