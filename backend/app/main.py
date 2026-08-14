"""
=========================================================
Main Application

Entry point for the Agentic AI Debate Coach Backend.

Responsibilities:
- Create FastAPI Application
- Register API Routers
- Future Middleware Configuration
=========================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.debate_topic import router as debate_topic_router
from app.api.debate_session import router as debate_session_router
from app.api.user_skill import router as user_skill_router
from app.api import api_router
from app.speech.api.speech import router as speech_router
from app.debate.api.debate import router as debate_router
from app.debate.api.report import router as report_router

# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(

    title="Agentic AI Debate Coach API",

    description="Backend API for the Agentic AI Debate Coach Platform",

    version="1.0.0"

)


from app.db.init_db import init_db

# =========================================================
# Startup Event
# =========================================================

@app.on_event("startup")
def on_startup():
    try:
        init_db()
    except Exception as e:
        print(f"Warning: init_db on startup encountered error: {e}")

# =========================================================
# CORS Middleware
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

# =========================================================
# Root Endpoint
# =========================================================

@app.get("/")
def root():

    return {

        "message": "Welcome to Agentic AI Debate Coach API"

    }


# =========================================================
# Health Check
# =========================================================

@app.get("/health")
def health_check():

    return {

        "status": "Healthy",

        "api": "Running"

    }


# =========================================================
# Register API Routers
# =========================================================

from app.api.coach import router as coach_router
from app.api.admin import router as admin_router
from app.api.educator import router as educator_router
from app.api.simulation import router as simulation_router
from app.api.notification import router as notification_router
from app.presentation.api.presentation_api import router as presentation_router

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(debate_topic_router)
app.include_router(debate_session_router)
app.include_router(user_skill_router)
app.include_router(
    api_router,
    prefix="/api/v1",
)
app.include_router(
    speech_router,
    prefix="/api/v1",
)
app.include_router(
    presentation_router,
    prefix="/api/v1",
)
app.include_router(
    debate_router,
    prefix="/api/v1",
)
app.include_router(
    coach_router,
    prefix="/api/v1",
)
app.include_router(
    admin_router,
    prefix="/api/v1",
)
app.include_router(
    educator_router,
    prefix="/api/v1",
)
app.include_router(
    simulation_router,
    prefix="/api/v1",
)
app.include_router(
    notification_router,
    prefix="/api/v1",
)

app.include_router(report_router)

