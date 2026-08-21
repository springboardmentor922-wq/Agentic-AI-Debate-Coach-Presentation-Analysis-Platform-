from pydantic import BaseModel, Field


class PresentationResponse(BaseModel):

    structure: str

    delivery: str

    confidence: str

    audience_engagement: str

    body_language: str

    eye_contact: str

    visual_aids: str

    overall_score: float