from pydantic import BaseModel


class SkillCreate(BaseModel):
    confidence_score: int
    logical_reasoning: int
    communication: int
    rebuttal_skill: int
    overall_score: int


class SkillResponse(SkillCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True