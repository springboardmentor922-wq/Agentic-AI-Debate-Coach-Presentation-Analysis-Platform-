from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    page: str = ""
    topic: str = ""


class ChatResponse(BaseModel):
    response: str
    