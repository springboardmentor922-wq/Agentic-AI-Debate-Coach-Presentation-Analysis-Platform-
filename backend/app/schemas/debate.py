from pydantic import BaseModel
from app.models.debate_record import DebateRecord
from app.models.session import DebateSession
class DebateRequest(BaseModel):
    argument: str


class DebateResponse(BaseModel):
    analysis: dict
    fallacies: str
    feedback: dict


class DebateTurnResponseSchema(BaseModel):
    analysis: dict
    fallacies: str
    feedback: dict