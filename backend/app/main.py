import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    admin,
    analysis,
    auth,
    debate,
    feedback,
    matchmaking,
    presentation_domains,
    reports,
    sessions,
    topics,
    users,
)
from app.core.config import settings
from app.db.init_db import seed_roles
from app.db.postgres import Base, SessionLocal, engine
from app.api.routes import argument_analysis
from app.api.routes import schedule
from app.api.routes import presentation_history
from app.api.routes import debate_recordings
import app.models  # noqa: F401  (ensures models are registered on Base.metadata)
from app.db.seed_presentation_domains import seed_presentation_domains
from app.api.routes import judge
from app.api.routes import assistant

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Milestone 1: create tables directly. Replace with Alembic migrations in production.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_presentation_domains(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Core foundation API — authentication, roles, profiles, topics and debate sessions. "
    "AI coaching features (argument analysis, fallacy detection, speech analysis, chatbot) ship in later milestones.",
    version="0.1.0-milestone1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(topics.router)
app.include_router(sessions.router)
app.include_router(admin.router)
app.include_router(analysis.router)
app.include_router(argument_analysis.router)
app.include_router(reports.router)
app.include_router(feedback.router)
app.include_router(debate.router)
app.include_router(matchmaking.router)
app.include_router(schedule.router)
app.include_router(presentation_history.router)
app.include_router(debate_recordings.router)
app.include_router(presentation_domains.router)
app.include_router(judge.router)
app.include_router(assistant.router)
os.makedirs("uploads/recordings", exist_ok=True)
app.mount("/static/recordings", StaticFiles(directory="uploads/recordings"), name="recordings")

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "milestone": "1 — Project Initialization, Design Process & Core Setup",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
