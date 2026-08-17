from pydantic import BaseModel
from typing import List


class ArgumentRequest(BaseModel):
    argument: str


class ArgumentResponse(BaseModel):
    claim: str
    supporting_points: List[str]
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]