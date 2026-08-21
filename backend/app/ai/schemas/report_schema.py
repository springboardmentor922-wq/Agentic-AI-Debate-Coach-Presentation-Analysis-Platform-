from pydantic import BaseModel
from typing import List


class ReportResponse(BaseModel):

    performance_summary: str

    strengths: List[str]

    weaknesses: List[str]

    recommendations: List[str]

    next_learning_goals: List[str]