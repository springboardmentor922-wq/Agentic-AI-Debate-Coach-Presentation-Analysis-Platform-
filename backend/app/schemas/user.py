from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    learner = "learner"
    debate_coach = "debate_coach"
    educator = "educator"
    administrator = "administrator"


class AdminCreateUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    confirm_password: str = Field(min_length=6)
    role: UserRole = UserRole.learner


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    expected_role: Optional[UserRole] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_debate_topics: Optional[List[str]] = None
    presentation_domains: Optional[List[str]] = None
    learning_goals: Optional[List[str]] = None
    coaching_preferences: Optional[str] = None
    avatar_url: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    experience_level: Optional[str] = None
    preferred_debate_topics: Optional[List[str]] = []
    presentation_domains: Optional[List[str]] = []
    learning_goals: Optional[List[str]] = []
    coaching_preferences: Optional[str] = None
    avatar_url: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    email_verified: bool = False
    phone_verified: bool = False
    is_active: bool = True
    plan: str = "free"  # "free" | "pro" | "enterprise" — assigned by an admin, no payment processor is integrated
    auth_provider: str = "local"
    created_at: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
