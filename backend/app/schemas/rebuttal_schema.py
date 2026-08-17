from pydantic import BaseModel

class RebuttalRequest(BaseModel):
    opponent_argument: str

class RebuttalResponse(BaseModel):
    rebuttal: str