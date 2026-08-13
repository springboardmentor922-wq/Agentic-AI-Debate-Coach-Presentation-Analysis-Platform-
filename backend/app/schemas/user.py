from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.models.role import RoleName
from app.models.user_profile import ExperienceLevel
from app.schemas.presentation_domain import PresentationDomainOut
from app.models.user_profile import FeedbackStyle, LearningStyle, OpponentDifficulty, PracticeFocus, FEEDBACK_CATEGORIES

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: RoleName
    is_active: bool
    is_verified: bool
    onboarding_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("role", mode="before")
    @classmethod
    def extract_role_name(cls, value):
        if hasattr(value, "name"):
            return value.name
        return value


class ProfileUpdateRequest(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None
    institution: str | None = None
    learning_goals: str | None = None
    preferred_topics: str | None = None
    experience_level: ExperienceLevel | None = None
    presentation_domain_ids: list[int] | None = None
    learning_style: LearningStyle | None = None
    feedback_style: FeedbackStyle | None = None
    opponent_difficulty: OpponentDifficulty | None = None
    practice_focus: PracticeFocus | None = None
    preferred_feedback_categories: list[str] | None = None

    @field_validator("preferred_feedback_categories")
    @classmethod
    def validate_categories(cls, value):
        if value is None:
            return value
        unique = list(dict.fromkeys(value))  # de-dupe, preserve order
        invalid = [v for v in unique if v not in FEEDBACK_CATEGORIES]
        if invalid:
            raise ValueError(f"Invalid feedback categories: {invalid}")
        return unique

    
class ProfileOut(BaseModel):
    id: int
    user_id: int
    bio: str | None = None
    avatar_url: str | None = None
    institution: str | None = None
    learning_goals: str | None = None
    preferred_topics: str | None = None
    experience_level: ExperienceLevel
    presentation_domains: list[PresentationDomainOut] = []
    
    model_config = ConfigDict(from_attributes=True)
    learning_style: LearningStyle
    feedback_style: FeedbackStyle
    opponent_difficulty: OpponentDifficulty
    practice_focus: PracticeFocus
    preferred_feedback_categories: list[str] = []

class OnboardingRequest(BaseModel):
    role: RoleName
    recaptcha_token: str
    bio: str | None = None
    institution: str | None = None
    learning_goals: str | None = None
    preferred_topics: str | None = None
    experience_level: ExperienceLevel | None = None