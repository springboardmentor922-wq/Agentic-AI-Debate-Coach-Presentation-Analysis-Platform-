from pydantic import BaseModel

class SpeechRequest(BaseModel):
    speech: str


class SpeechResponse(BaseModel):
    improved_speech: str
    opening: str
    closing: str
    vocabulary: list[str]
    tips: list[str]