from pydantic import BaseModel, Field
from app.schemas.analysis import FallacyDetectionResult
from app.schemas.scoring import ArgumentScore
from app.schemas.presentation import PresentationMetrics
from app.schemas.argument_analysis import ArgumentAnalysisResult

class PersonaSettings(BaseModel):
    aggressiveness: str = Field(default="medium", description="low | medium | high")
    sophistication: str = Field(default="medium", description="low | medium | high")
    fallacy_rate: float = Field(default=0.2, ge=0.0, le=1.0, description="Chance the AI deliberately uses a fallacy")


class DebateMessageRequest(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    persona: PersonaSettings = PersonaSettings()


class DebateMessageResponse(BaseModel):
    ai_message: str
    turn_number: int
    user_fallacy_check: FallacyDetectionResult
    user_score: ArgumentScore
    argument_analysis: ArgumentAnalysisResult | None = None
    counterarguments: dict | None = None       
    challenge_questions: list[str] = [] 

class AudioDebateMessageResponse(DebateMessageResponse):
    presentation_metrics: PresentationMetrics

class QuickstartRequest(BaseModel):
    topic_id: int | None = None  


class QuickstartResponse(BaseModel):
    session_id: int
    topic_id: int