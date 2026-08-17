from pydantic import BaseModel
from typing import List


class PresentationRequest(BaseModel):

    presentation: str


class PresentationResponse(BaseModel):

    clarity: int

    confidence: int

    communication: int

    structure: int

    overall: int

    strengths: List[str]

    weaknesses: List[str]

    suggestions: List[str]