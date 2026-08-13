from pydantic import BaseModel


class PresentationMetrics(BaseModel):
    transcript: str
    duration_seconds: float
    word_count: int
    wpm: float
    filler_count: int
    filler_density: float
    confidence_score: float  # 0-100 heuristic