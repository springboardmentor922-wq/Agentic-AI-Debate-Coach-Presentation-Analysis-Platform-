from pydantic import BaseModel


class CoachReviewCreate(BaseModel):

    grammar: int

    logic: int

    confidence: int

    communication: int

    overall: int

    strengths: str

    improvements: str

    feedback: str


class CoachReviewResponse(CoachReviewCreate):

    id: int

    session_id: int

    coach_id: int

    class Config:
        from_attributes = True