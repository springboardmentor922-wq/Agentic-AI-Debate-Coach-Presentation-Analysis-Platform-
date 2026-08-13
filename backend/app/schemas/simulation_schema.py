from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SimulationStartRequest(BaseModel):
    topic_id: Optional[int] = None
    topic_title: Optional[str] = "Global Carbon Tax Policy"
    format: str = "Oxford Debate"
    difficulty: str = "Intermediate"
    side: str = "Affirmative"

class SimulationTurnRequest(BaseModel):
    session_id: str
    user_speech: str
    round_number: int = 1
    difficulty: str = "Intermediate"

class SimulationResponse(BaseModel):
    session_id: str
    ai_opponent_argument: str
    judge_feedback: Optional[Dict[str, Any]] = None
    live_scores: Optional[Dict[str, float]] = None
    is_completed: bool = False
