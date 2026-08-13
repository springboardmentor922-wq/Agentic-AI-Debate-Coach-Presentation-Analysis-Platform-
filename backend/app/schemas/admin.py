from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.user import UserRole


# --- Role & Permissions ---
class UserRoleUpdate(BaseModel):
    role: UserRole


class UserPlanUpdate(BaseModel):
    plan: str = Field(pattern="^(free|pro|enterprise)$")


# --- System Analytics ---
class PlatformAnalyticsOut(BaseModel):
    total_users: int
    users_by_role: dict
    total_debate_sessions: int
    sessions_last_7_days: list[dict]  # [{date, count}]
    user_signups_last_7_days: list[dict]  # [{date, count}]
    total_fallacies_detected: int
    total_reports_generated: int


# --- Debate Sessions oversight ---
class AdminDebateSessionOut(BaseModel):
    id: str
    user_id: str
    topic: Optional[str] = None
    debate_format: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None


# --- Content Management (debate topics) ---
class DebateTopicIn(BaseModel):
    title: str
    category: str
    difficulty: str = Field(pattern="^(beginner|intermediate|advanced)$")
    debate_format: str = "one_on_one"
    popularity: int = Field(default=50, ge=0, le=100)

    @field_validator("difficulty", mode="before")
    @classmethod
    def _normalize_difficulty(cls, v):
        """Normalize case/whitespace before the pattern constraint runs.

        Existing MongoDB documents (and some legacy admin-panel writes) may
        contain "Beginner", "Intermediate", "Advanced", or all-caps
        variants. The API contract (allowed values, response shape) is
        unchanged — this only makes the boundary tolerant of case so
        well-known equivalent values don't 500 on read, while still
        rejecting genuinely invalid difficulty values.
        """
        if isinstance(v, str):
            return v.strip().lower()
        return v


class DebateTopicOut(DebateTopicIn):
    id: str
    created_at: str


# --- Notification Center (admin broadcast) ---
class BroadcastNotificationIn(BaseModel):
    title: str
    message: str
    target_role: Optional[UserRole] = None  # None = all users


# --- Audit Logs ---
class AuditLogOut(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    action: str
    target: Optional[str] = None
    details: Optional[dict] = None
    created_at: str


# --- System Settings ---
class PlatformSettingsIn(BaseModel):
    site_name: str
    support_email: str
    maintenance_mode: bool = False
    allow_public_registration: bool = True


class PlatformSettingsOut(PlatformSettingsIn):
    updated_at: str


# --- AI Models & Services ---
class AIServiceStatusOut(BaseModel):
    provider: str
    configured: bool
    role: str  # e.g. "primary", "fallback"


# --- Integrations ---
class IntegrationStatusOut(BaseModel):
    name: str
    category: str
    configured: bool
    description: str
