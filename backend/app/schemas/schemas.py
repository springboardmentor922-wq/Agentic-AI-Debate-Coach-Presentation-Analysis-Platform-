from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "Learner" # Learner, Debate Coach, Educator, Administrator

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Profile Schemas
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_topics: Optional[List[str]] = None
    presentation_domains: Optional[List[str]] = None
    learning_goals: Optional[List[str]] = None
    coaching_preferences: Optional[Dict[str, Any]] = None
    skills_json: Optional[Dict[str, float]] = None

class ProfileResponse(BaseModel):
    user_id: int
    name: str
    experience_level: str
    preferred_topics: List[str]
    presentation_domains: List[str]
    learning_goals: List[str]
    coaching_preferences: Dict[str, Any]
    skills_json: Dict[str, float]

    class Config:
        from_attributes = True

# Debate Schemas
class DebateSessionCreate(BaseModel):
    topic: str
    format: str = "One-on-One Debate"  # One-on-One Debate, Parliamentary Debate, Oxford Debate, Policy Debate, Public Forum Debate, AI Debate Simulation
    user_position: str = "Pro"  # Pro, Con, Government, Opposition, Affirmative, Negative
    position_role: Optional[str] = "Pro"
    ai_personality: str = "Socrates"
    provider: Optional[str] = "Local Simulation Engine"
    student_id: Optional[int] = None
    target_all: Optional[bool] = False
    challenge_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = 30
    round_structure: Optional[str] = "Standard"

class DebateSessionScheduleRequest(BaseModel):
    topic: str
    format: str = "One-on-One Debate"
    user_position: str = "Pro"
    scheduled_at: datetime
    duration_minutes: int = 30
    ai_personality: Optional[str] = "Socrates"

class PositionAssignmentRequest(BaseModel):
    session_id: int
    user_position: str  # Pro, Con, Government, Opposition, Affirmative, Negative
    position_role: Optional[str] = None

class DebateTurnCreate(BaseModel):
    text: str

class DebateTurnResponse(BaseModel):
    id: int
    session_id: int
    speaker: str
    text: str
    timestamp: datetime
    analysis_json: Dict[str, Any]

    class Config:
        from_attributes = True

class DebateSessionResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    format: str
    user_position: str
    position_role: Optional[str] = "Pro"
    ai_personality: str
    provider: str
    status: str
    score: Optional[float] = None
    created_at: datetime
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = 30
    current_round: Optional[int] = 1
    round_structure: Optional[str] = "Standard"
    recording_enabled: Optional[bool] = True
    is_challenge: bool = False
    deadline: Optional[datetime] = None
    challenge_type: Optional[str] = None
    assigned_by_id: Optional[int] = None
    turns: List[DebateTurnResponse] = []

    class Config:
        from_attributes = True

# Speech Analysis Schemas
class SpeechAnalysisCreate(BaseModel):
    title: str = "Speech Rehearsal"
    transcript: str
    duration: float = 0.0
    filler_word_count: Optional[Dict[str, int]] = None
    confidence_score: Optional[float] = None

class SpeechAnalysisResponse(BaseModel):
    id: int
    user_id: int
    title: str
    duration: float
    transcript: str
    pace: int
    filler_word_count: Dict[str, int]
    clarity_score: float
    confidence_score: float
    fallacies_json: List[Dict[str, Any]]
    overall_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Debate Topic Schemas
class DebateTopicCreate(BaseModel):
    title: str
    category: Optional[str] = "General"
    description: Optional[str] = None
    target_format: Optional[str] = "One-on-One Debate"
    difficulty: Optional[str] = "Intermediate"
    tags: Optional[List[str]] = []
    is_predefined: bool = False
    assigned_to_id: Optional[int] = None

class DebateTopicResponse(BaseModel):
    id: int
    title: str
    category: Optional[str] = "General"
    description: Optional[str] = None
    target_format: Optional[str] = "One-on-One Debate"
    difficulty: Optional[str] = "Intermediate"
    tags: Optional[List[str]] = []
    is_predefined: bool
    created_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Argument Analysis Engine & Fallacy Engine Schemas
class ArgumentAnalysisRequest(BaseModel):
    text: str
    topic: Optional[str] = "General Debate"
    format: Optional[str] = "One-on-One Debate"

class EvaluationCriteriaScores(BaseModel):
    clarity: float = Field(description="Clarity score (0-100)")
    relevance: float = Field(description="Relevance score (0-100)")
    evidence_strength: float = Field(description="Evidence strength score (0-100)")
    logical_consistency: float = Field(description="Logical consistency score (0-100)")
    persuasiveness: float = Field(description="Overall persuasiveness score (0-100)")

class ClaimItem(BaseModel):
    claim: str
    type: str  # Core Claim, Sub Claim, Counter Claim
    confidence: float

class EvidenceItem(BaseModel):
    evidence_text: str
    type: str  # Statistical, Empirical, Authoritative, Anecdotal, Assertive
    weight: float

class ArgumentAnalysisResponse(BaseModel):
    extracted_claims: List[ClaimItem]
    evaluated_evidence: List[EvidenceItem]
    reasoning_quality: str
    argument_strength: float
    scores: EvaluationCriteriaScores

class FallacyItem(BaseModel):
    fallacy: str  # Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring
    offending_text: str
    explanation: str
    correction_suggestion: str
    severity: str

class FallacyDetectionResponse(BaseModel):
    fallacies_found: List[FallacyItem]
    has_fallacy: bool
    credibility_score: float
    reasoning_analysis: str
    summary: str

class CombinedSpeechEvaluationResponse(BaseModel):
    argument_analysis: ArgumentAnalysisResponse
    fallacy_detection: FallacyDetectionResponse
    overall_reasoning_score: float
    coach_recommendations: List[str]

# Message Schemas
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True

