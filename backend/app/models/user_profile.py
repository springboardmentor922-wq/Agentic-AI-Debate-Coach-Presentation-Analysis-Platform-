import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.postgres import Base
from app.models.presentation_domain import user_presentation_domains

class ExperienceLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class LearningStyle(str, enum.Enum):
    VISUAL = "visual"
    PRACTICAL = "practical"
    READING_WRITING = "reading_writing"
    INTERACTIVE = "interactive"


class FeedbackStyle(str, enum.Enum):
    ENCOURAGING = "encouraging"
    BALANCED = "balanced"
    STRICT = "strict"


class OpponentDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class PracticeFocus(str, enum.Enum):
    PUBLIC_SPEAKING = "public_speaking"
    DEBATE_SKILLS = "debate_skills"
    CRITICAL_THINKING = "critical_thinking"
    PRESENTATION_SKILLS = "presentation_skills"
    PERSUASIVE_COMMUNICATION = "persuasive_communication"
    INTERVIEW_PREPARATION = "interview_preparation"


FEEDBACK_CATEGORIES = [
    "argument_structure",
    "logical_fallacies",
    "evidence_quality",
    "rebuttal_skills",
    "communication_skills",
    "speaking_confidence",
    "persuasiveness",
    "clarity",
    "logical_consistency",
]


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    institution = Column(String(150), nullable=True)

    learning_goals = Column(Text, nullable=True)  # free text or JSON-encoded list
    preferred_topics = Column(Text, nullable=True)  # comma separated tags for M1; normalized later
    experience_level = Column(Enum(ExperienceLevel), default=ExperienceLevel.BEGINNER)

    learning_style = Column(
        Enum(LearningStyle, values_callable=lambda obj: [e.value for e in obj]),
        default=LearningStyle.PRACTICAL,
    )
    feedback_style = Column(
        Enum(FeedbackStyle, values_callable=lambda obj: [e.value for e in obj]),
        default=FeedbackStyle.BALANCED,
    )
    opponent_difficulty = Column(
        Enum(OpponentDifficulty, values_callable=lambda obj: [e.value for e in obj]),
        default=OpponentDifficulty.MEDIUM,
    )
    practice_focus = Column(
        Enum(PracticeFocus, values_callable=lambda obj: [e.value for e in obj]),
        default=PracticeFocus.DEBATE_SKILLS,
    )
    preferred_feedback_categories = Column(JSON, default=list)

    user = relationship("User", back_populates="profile")
    presentation_domains = relationship(
        "PresentationDomainOption", secondary=user_presentation_domains, back_populates="profiles"
    )