"""
Milestone 4 — Learning Hub schemas (Practice Exercises, Quizzes, Learning
Materials, AI Mentor). Every list here is generated from, or filtered by,
a learner's real evidence (weaknesses, fallacies, presentation scores) —
nothing is a static array shown to every learner regardless of history.
"""
from typing import Optional
from pydantic import BaseModel, Field


# --- Practice Exercises ---------------------------------------------------

class PracticeExercise(BaseModel):
    title: str
    focus_area: str = Field(description="The specific real weakness this drill targets")
    difficulty: str = Field(description="Easy, Medium, or Hard")
    instructions: str


class PracticeExerciseSet(BaseModel):
    exercises: list[PracticeExercise]


class PracticeExerciseOut(BaseModel):
    id: str
    title: str
    focus_area: str
    difficulty: str
    instructions: str
    completed: bool = False
    created_at: str


# --- Quizzes ---------------------------------------------------------------

QUIZ_TOPICS = [
    "Logical Fallacies", "Debate Formats", "Critical Thinking", "Argument Structures",
    "Public Speaking", "Persuasive Speaking", "Reasoning", "Evidence",
]


class QuizTopicOut(BaseModel):
    topic: str
    recommended: bool
    reason: Optional[str] = None
    last_score: Optional[float] = None
    attempts: int = 0


class QuizQuestionGenerated(BaseModel):
    question: str
    options: list[str] = Field(min_length=2, max_length=6)
    correct_index: int


class QuizGenerated(BaseModel):
    questions: list[QuizQuestionGenerated]


class QuizQuestionOut(BaseModel):
    """Sent to the learner — correct_index is stripped server-side."""
    question: str
    options: list[str]


class QuizAttemptOut(BaseModel):
    id: str
    topic: str
    questions: list[QuizQuestionOut]
    score: Optional[float] = None
    completed: bool = False
    created_at: str


class QuizSubmission(BaseModel):
    answers: list[int]


# --- Learning Materials ------------------------------------------------

class LearningMaterialOut(BaseModel):
    id: str
    title: str
    type: str  # Article, Video, Debate Example, TED Talk, Book, PDF
    level: str
    tags: list[str]
    reason: Optional[str] = None


# --- AI Mentor ---------------------------------------------------------

class MentorAskRequest(BaseModel):
    question: str


class MentorMessageOut(BaseModel):
    id: str
    role: str  # "user" | "mentor"
    text: str
    created_at: str
