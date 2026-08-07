"""
Milestone 3 schemas: AI Debate Simulation Engine, AI Opponent personalities,
Presentation Analysis Engine, Coaching Engine, Personalized Learning Plan,
and the Notification system.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AIPersonality(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"


class DebateTopicOut(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    debate_format: str
    popularity: int = Field(ge=0, le=100)


class DebateStartRequest(BaseModel):
    topic: Optional[str] = Field(default=None, description="Omit to auto-pick a curated topic for the format")
    debate_format: str = "one_on_one"
    ai_personality: AIPersonality = AIPersonality.intermediate
    position: Optional[str] = None


class DebateLiveTurnRequest(BaseModel):
    session_id: str
    text: str = Field(min_length=1)
    ai_personality: Optional[AIPersonality] = None


class DebateFinishRequest(BaseModel):
    session_id: str


# --------------------------------------------------------------------------
# Presentation Analysis (audio/video upload pipeline)
# --------------------------------------------------------------------------

class SpeechMetrics(BaseModel):
    words_per_minute: float
    filler_word_count: int
    filler_words: dict[str, int] = Field(default_factory=dict)
    duration_seconds: float
    word_count: int


class PresentationScore(BaseModel):
    """LLM-scored delivery dimensions, 0-100 each, derived from the transcript + speech metrics."""

    confidence_score: float = Field(ge=0, le=100)
    clarity_score: float = Field(ge=0, le=100)
    engagement_score: float = Field(ge=0, le=100)
    pacing_score: float = Field(ge=0, le=100)
    fluency_score: float = Field(ge=0, le=100, default=0)
    pronunciation_score: float = Field(ge=0, le=100, default=0)
    grammar_score: float = Field(ge=0, le=100, default=0)
    persuasion_score: float = Field(ge=0, le=100, default=0)
    overall_score: float = Field(ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    feedback: str


class PresentationAnalysisOut(BaseModel):
    id: str
    session_id: Optional[str] = None
    topic: Optional[str] = None
    debate_format: Optional[str] = None
    audio_filename: Optional[str] = None
    media_type: str  # audio | video
    transcript: str
    speech_metrics: SpeechMetrics
    presentation_score: PresentationScore
    argument_analysis: dict
    fallacy_report: dict
    counterarguments: dict
    created_at: str
    transcription_engine: str = "local"  # ""local""
    transcription_fallback_reason: Optional[str] = None


# --------------------------------------------------------------------------
# Counterargument Generation (Module 6, expanded for Milestone 3)
# --------------------------------------------------------------------------

class CounterargumentBundle(BaseModel):
    counterarguments: list[str] = Field(default_factory=list, description="Direct rebuttals to the user's argument")
    alternative_perspectives: list[str] = Field(default_factory=list)
    opponent_questions: list[str] = Field(default_factory=list, description="Questions an opponent may ask next")
    missing_evidence: list[str] = Field(default_factory=list)
    weak_claims: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    logical_improvements: list[str] = Field(default_factory=list)
    evidence_recommendations: list[str] = Field(default_factory=list)
    practical_suggestions: list[str] = Field(default_factory=list)


# --------------------------------------------------------------------------
# Coaching Engine (Module 10, dynamic)
# --------------------------------------------------------------------------

class CoachingFeedback(BaseModel):
    observations: list[str] = Field(
        default_factory=list,
        description="Specific, evidence-based observations about this debater's actual patterns, e.g. "
        "'You interrupt your argument before completing evidence.'",
    )
    strengths: list[str] = Field(default_factory=list)
    priority_focus: str = Field(description="The single highest-impact thing to work on next")
    tone: str = Field(default="constructive")


class CoachFeedbackOut(BaseModel):
    id: str
    session_id: Optional[str] = None
    user_id: str
    feedback: CoachingFeedback
    created_at: str


# --------------------------------------------------------------------------
# Personalized Learning Plan (Module 10/11)
# --------------------------------------------------------------------------

class LearningPlanWeek(BaseModel):
    week: int = Field(ge=1, le=4)
    focus: str
    tasks: list[str] = Field(default_factory=list)


class LearningPlan(BaseModel):
    weeks: list[LearningPlanWeek]
    summary: str


class LearningPlanOut(BaseModel):
    id: str
    user_id: str
    based_on_session_id: Optional[str] = None
    plan: LearningPlan
    progress: dict[str, bool] = Field(default_factory=dict, description="task-key -> completed")
    created_at: str
    updated_at: Optional[str] = None


class LearningPlanProgressUpdate(BaseModel):
    task_key: str
    completed: bool


# --------------------------------------------------------------------------
# Coaching Plans (Milestone 4) — distinct from the Learning Plan above.
# Automatically generated from AI analysis AND, when available, the coach's
# or educator's review notes/recommended exercises — a real trackable plan
# with deadlines and completion status, not just free-text feedback.
# --------------------------------------------------------------------------

class CoachingPlanExercise(BaseModel):
    title: str
    description: str = ""


class CoachingPlanWeek(BaseModel):
    week: int = Field(ge=1, le=4)
    focus: str
    objective: str = Field(description="One measurable, verifiable objective for this week")
    exercises: list[CoachingPlanExercise] = Field(default_factory=list)


class CoachingPlan(BaseModel):
    weeks: list[CoachingPlanWeek]
    objectives: list[str] = Field(
        default_factory=list, description="2-4 measurable learning objectives for the plan overall"
    )
    summary: str


class CoachingPlanExerciseState(BaseModel):
    """Persisted per-exercise tracking data — the LLM only designs the
    exercise content; deadlines/completion are computed/stored server-side
    so they stay consistent regardless of which provider generated the plan."""

    title: str
    description: str = ""
    deadline: str
    completed: bool = False


class CoachingPlanWeekState(BaseModel):
    week: int
    focus: str
    objective: str
    exercises: list[CoachingPlanExerciseState] = Field(default_factory=list)


class CoachingPlanOut(BaseModel):
    id: str
    user_id: str
    based_on_session_id: Optional[str] = None
    source: str = Field(
        default="ai_analysis",
        description="ai_analysis | coach_review | educator_review | combined — what evidence produced this plan",
    )
    weeks: list[CoachingPlanWeekState]
    objectives: list[str] = Field(default_factory=list)
    summary: str
    status: str = Field(default="active", description="active | completed")
    completion_percent: float = 0.0
    created_at: str
    updated_at: Optional[str] = None


class CoachingPlanProgressUpdate(BaseModel):
    exercise_key: str = Field(description="'{week}:{exercise_index}' — identifies one exercise")
    completed: bool


# --------------------------------------------------------------------------
# Notifications (Module 12)
# --------------------------------------------------------------------------

class NotificationType(str, Enum):
    coach_review = "coach_review"
    educator_feedback = "educator_feedback"
    new_assignment = "new_assignment"
    upcoming_debate = "upcoming_debate"
    learning_milestone = "learning_milestone"
    platform_announcement = "platform_announcement"
    # Milestone 4 additions
    coach_feedback = "coach_feedback"
    achievement_unlocked = "achievement_unlocked"
    certificate_issued = "certificate_issued"


class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    read: bool = False
    created_at: str
    related_session_id: Optional[str] = None
