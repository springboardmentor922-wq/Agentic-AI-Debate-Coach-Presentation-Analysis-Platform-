from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    next_difficulty: str