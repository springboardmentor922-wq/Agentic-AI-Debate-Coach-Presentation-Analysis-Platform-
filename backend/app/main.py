from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from app.database.database import engine, Base
from app.models.user import User


# Import Authentication Router
from app.routers.auth import router as auth_router
from app.routers import dashboard_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.profile import router as profile_router
from app.routers.coach_profile import router as coach_profile_router

from app.models.debate import DebateTopic
from app.models.debate_session import DebateSession
from app.models.argument_review import ArgumentReview
from app.models.fallacy_report import FallacyReport
from app.models.presentation_review import PresentationReview


from app.models.coach_profile import CoachProfile
from app.models.educator_profile import EducatorProfile
from app.routers.coach_dashboard import router as coach_dashboard_router
from app.routers.debate import router as debate_router
from app.routers.learner_assigned_debate import (
    router as learner_assigned_router
)


from app.routers.debate_session import router as debate_session_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.educator_profile import router as educator_profile_router
from app.routers.evaluation import router as evaluation_router
from app.routers.dashboard import router as dashboard_router
from app.models.assigned_debate import AssignedDebate
from app.routers.assigned_debate import router as assigned_debate_router
from app.routers.ai_queue import router as ai_queue_router
from app.routers.coach_debate_sessions import (
    router as coach_debate_sessions_router
)
from app.routers.note_router import router as note_router
from app.routers import presentation_router
from app.models.coaching_plan import CoachingPlan
from app.models.note import Note
from app.models.coach_profile import CoachProfile
from app.models.coach_review import CoachReview
from app.routers.coach_review import router as coach_review_router
from app.models.educator_profile import EducatorProfile
from app.routers.educator_learners import (
    router as educator_learners_router
)


from app.models.evaluation import Evaluation
from app.routers.argument_router import router as argument_router
from app.routers.debate_chat import router as debate_chat_router
from app.routers.fallacy_router import router as fallacy_router
from app.routers.counter_router import router as counter_router
from app.routers.rebuttal_router import router as rebuttal_router
from app.routers.speech_router import router as speech_router
from app.routers.chat_router import router as chat_router
from app.routers.challenge_router import router as challenge_router
from app.routers.learner_feedback import router as learner_feedback_router
from app.routers import coaching_plan_router
from app.routers.educator_dashboard import (
    router as educator_dashboard_router
)
from app.routers.educator_learner_detail import (
    router as educator_learner_detail_router
)
from app.routers.educator_classes import (
    router as educator_classes_router
)
from app.models.classroom import Classroom
from app.routers.assignments import router as assignments_router
from app.models.assignment import Assignment
from app.models.assignment import Assignment

from app.models.assignment_submission import AssignmentSubmission

from app.routers.assignment_submissions import router as assignment_submissions_router
from app.models.announcement import Announcement
from app.routers.announcements import router as announcements_router
from app.routers import admin
from app.routers import admin_users
from app.routers import admin_roles

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentic AI Debate Coach API")

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_FOLDER),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register Router
app.include_router(auth_router)
app.include_router(admin.router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(coach_profile_router)
app.include_router(coach_review_router)
app.include_router(
    assigned_debate_router
)
app.include_router(
    learner_assigned_router
)
app.include_router(
    coach_debate_sessions_router
)
app.include_router(
    presentation_router.router
)
app.include_router(note_router)

app.include_router(educator_profile_router)
app.include_router(evaluation_router)
app.include_router(dashboard_router)

app.include_router(coach_dashboard_router)
app.include_router(learner_feedback_router)
app.include_router(ai_queue_router)
app.include_router(
    coaching_plan_router.router
)
app.include_router(
    educator_dashboard_router
)
app.include_router(
    educator_learners_router
)
app.include_router(
    educator_learner_detail_router
)
app.include_router(
    educator_classes_router
)
app.include_router(assignments_router)
app.include_router(
    assignment_submissions_router
)
app.include_router(
    announcements_router
)

app.include_router(debate_router)
app.include_router(debate_session_router)
app.include_router(argument_router)
app.include_router(debate_chat_router)
app.include_router(fallacy_router)
app.include_router(counter_router)
app.include_router(rebuttal_router)
app.include_router(speech_router)
app.include_router(chat_router)
app.include_router(challenge_router)
app.include_router(admin_users.router)
app.include_router(admin_roles.router)
@app.get("/")
def root():
    return {
        "message": "Agentic AI Debate Coach Backend Running"
    }