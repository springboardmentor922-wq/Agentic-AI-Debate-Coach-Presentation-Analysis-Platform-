from pydantic import BaseModel

class FallacyRequest(BaseModel):
    argument: str


class FallacyResponse(BaseModel):
    detected_fallacies: list[str]
    explanation: list[str]
    suggestions: list[str]