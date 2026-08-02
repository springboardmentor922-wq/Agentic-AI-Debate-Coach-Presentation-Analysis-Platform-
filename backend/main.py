from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base

from app.routers.user import router as user_router
from app.routers.debate import router as debate_router
from app.routers import analytics
from app.routers import recommendation
from app.routers import statistics
from app.routers import dashboard
from app.routers import ai
from app.routers import (
    auth,
    profile,
    role,
    topic,
    session,
    skill,
)
from app.models.debate_record import DebateRecord
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agentic AI Debate Coach API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user_router)
app.include_router(profile.router)
app.include_router(role.router)
app.include_router(topic.router)
app.include_router(session.router)
app.include_router(skill.router)
app.include_router(debate_router)
app.include_router(analytics.router)
app.include_router(recommendation.router)
app.include_router(statistics.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
@app.get("/")
def home():
    return {
        "status": "running",
        "project": "Agentic AI Debate Coach",
        "milestone": "2",
        "database": "PostgreSQL",
        "ai": "Initializing"
    }