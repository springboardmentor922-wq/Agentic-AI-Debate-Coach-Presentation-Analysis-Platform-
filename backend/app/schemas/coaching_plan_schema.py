from pydantic import BaseModel
from typing import Optional


class CoachingPlanCreate(BaseModel):

    learner_id: int

    title: str

    goal: str

    focus_area: Optional[str] = None

    activities: Optional[str] = None

    due_date: Optional[str] = None


class CoachingPlanResponse(BaseModel):

    id: int

    coach_id: int

    learner_id: int

    learner_name: Optional[str] = None

    title: str

    goal: str

    focus_area: Optional[str] = None

    activities: Optional[str] = None

    due_date: Optional[str] = None

    status: str

    created_at: object

    class Config:

        from_attributes = True