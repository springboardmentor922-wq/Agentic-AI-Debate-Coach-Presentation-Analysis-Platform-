from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str

from pydantic import BaseModel

class ProfileCreate(BaseModel):
    college: str
    department: str
    year: str
    language: str
    experience: str


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DebateCreate(BaseModel):
    topic: str
    difficulty: str


class DebateResponse(DebateCreate):
    id: int
    user_id: int
    status: str

    class Config:
        from_attributes = True

# ----------------------------
# Milestone 2 - Argument Analysis
# ----------------------------

class FallacyRequest(BaseModel):
    text: str


class FallacyReport(BaseModel):
    fallacy_detected: bool
    fallacy_type: str
    offending_text: str
    explanation: str
    correction_suggestion: str

class CounterArgumentRequest(BaseModel):
    text: str


class CounterArgumentResponse(BaseModel):
    counterargument: str
    supporting_points: list[str]

class FeedbackRequest(BaseModel):
    text: str


class FeedbackResponse(BaseModel):
    clarity_score: int
    logic_score: int
    persuasiveness_score: int
    grammar_score: int
    feedback: list[str]