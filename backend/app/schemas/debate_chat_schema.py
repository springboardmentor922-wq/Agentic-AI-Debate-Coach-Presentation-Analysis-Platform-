from pydantic import BaseModel


class DebateChatRequest(BaseModel):
    topic: str
    user_position: str
    user_argument: str


class DebateChatResponse(BaseModel):
    ai_position: str
    ai_response: str