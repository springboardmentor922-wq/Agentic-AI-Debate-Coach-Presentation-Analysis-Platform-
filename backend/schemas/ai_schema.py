from pydantic import BaseModel
from typing import Literal
class ArgumentScore(BaseModel):

    logic_score: int

    clarity_score: int

    evidence_score: int

    persuasiveness_score: int

    relevance_score: int

    confidence_score: int

    overall_score: int

class CoachingFeedback(BaseModel):

    strengths: list[str]

    areas_to_improve: list[str]

    next_challenge: str

class DebateRequest(BaseModel):

    experience_level: Literal[
        "Beginner",
        "Intermediate",
        "Advanced"
    ]

    debate_format: Literal[
        "One-on-One Debate",
        "Oxford Debate",
        "Parliamentary Debate",
        "Policy Debate",
        "Public Forum",
        "AI Debate Simulation"
    ]

    topic: str

    user_argument: str


class DebateResponse(BaseModel):

    debate_format: str

    experience_level: str

    topic: str

    word_count: int

    character_count: int

    is_long_argument: bool

    ai_response: str

    fallacy_report: str

    argument_score: ArgumentScore

    coaching_feedback: CoachingFeedback



class FallacyReport(BaseModel):

    fallacy_detected: bool

    fallacy_type: str

    explanation: str

    suggestion: str