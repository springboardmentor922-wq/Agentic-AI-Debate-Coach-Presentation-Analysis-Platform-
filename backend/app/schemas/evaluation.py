from pydantic import BaseModel


class EvaluationRequest(BaseModel):
    topic: str
    argument: str


class ScoreDetail(BaseModel):
    score: str
    percentage: str
    remark: str


class OverallDetail(BaseModel):
    score: str
    percentage: str
    grade: str


class EvaluationResponse(BaseModel):
    grammar: ScoreDetail
    logic: ScoreDetail
    confidence: ScoreDetail
    relevance: ScoreDetail

    overall: OverallDetail

    strengths: list[str]
    weaknesses: list[str]
    coach_tips: list[str]

    feedback: str