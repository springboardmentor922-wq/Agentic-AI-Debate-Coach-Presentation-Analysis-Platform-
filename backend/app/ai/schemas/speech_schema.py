from pydantic import BaseModel


class SpeechResponse(BaseModel):

    fluency: str

    pronunciation: str

    speaking_pace: str

    confidence: str

    clarity: str

    filler_words: str

    tone: str

    voice_modulation: str

    overall_score: float