import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import client as mongo_client, ping_database

logger = logging.getLogger("uvicorn")
from app.routers import (
    auth,
    users,
    debate_sessions,
    analysis,
    admin,
    skills,
    dashboard,
    debate_live,
    learning_plan,
    notifications,
    aliases,
    coach_review,
    educator_analytics,
    achievements,
    reports,
    learning_hub,
    coach_chat,
    notes,
    messages,
    media,
    coaching_plans,
    jobs,
)

app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis Platform",
    description=(
        "Milestone 1: Auth, roles, profile & skill management, debate session scheduling "
        "and status management. Milestone 2: Argument Analysis Engine, Logical Fallacy "
        "Detection Engine, AI Debate Simulation, and analysis history/reporting. "
        "Milestone 3: full AI Debate Simulation (curated topics, live debate, audio "
        "upload pipeline, AI opponent personalities), Counterargument Generation, dynamic "
        "Coaching Engine, Personalized Learning Plans, and the Notification system."
    ),
    version="0.4.0",
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
app.include_router(admin.router)
app.include_router(debate_sessions.router)
app.include_router(analysis.router)
app.include_router(skills.router)
app.include_router(dashboard.router)

# Milestone 3. debate_live.py registers literal paths under /api/v1/debate
# (e.g. /topics, /start, /live) — it must be included before aliases.router,
# whose /api/v1/debate/{session_id} is a catch-all fallback matched last.
app.include_router(debate_live.router)
app.include_router(learning_plan.router)
app.include_router(notifications.router)

# Milestone 4 — Coach Review System, Educator Analytics, Achievement &
# Certificate Engines. Registered before aliases.router for the same reason
# debate_live.router is: aliases.router's catch-all /debate/{session_id}
# must always be matched last.
app.include_router(coach_review.router)
app.include_router(educator_analytics.router)
app.include_router(achievements.router)
app.include_router(reports.router)
app.include_router(learning_hub.router)

# Global AI Debate Coach chatbot — platform-wide, all 4 roles.
app.include_router(coach_chat.router)
app.include_router(notes.router)
app.include_router(messages.router)
app.include_router(media.router)
app.include_router(coaching_plans.router)
app.include_router(jobs.router)

app.include_router(aliases.router)


@app.on_event("startup")
async def verify_mongo_connection():
    """Ping MongoDB on startup so a bad MONGO_URI fails loudly instead of
    surfacing as confusing 500s the first time a route touches the DB."""
    try:
        await mongo_client.admin.command("ping")
        logger.info("MongoDB connected successfully")
    except Exception:
        logger.exception("MongoDB connection failed on startup — check MONGO_URI in .env")


@app.on_event("startup")
async def create_indexes():
    """Create indexes for the query patterns actually used across the
    dashboard/coach/educator/admin routers. Every one of these fields is
    filtered or sorted on in a hot-path endpoint (see dashboard.py,
    coach_review.py, educator_analytics.py) with no index today, meaning
    every one of those queries was a full collection scan. Index creation
    is idempotent (create_index is a no-op if the index already exists),
    so this is safe to run on every startup."""
    from app.core.database import (
        debate_sessions_collection,
        debate_feedback_reports_collection,
        fallacy_reports_collection,
        performance_scores_collection,
        users_collection,
    )

    try:
        await debate_sessions_collection.create_index([("owner_id", 1), ("status", 1)])
        await debate_sessions_collection.create_index([("owner_id", 1), ("updated_at", -1)])
        await debate_feedback_reports_collection.create_index([("user_id", 1), ("updated_at", -1)])
        await debate_feedback_reports_collection.create_index("session_id")
        await fallacy_reports_collection.create_index("user_id")
        await performance_scores_collection.create_index([("user_id", 1), ("created_at", 1)])
        await users_collection.create_index("role")
        await users_collection.create_index("email", unique=True)
        logger.info("MongoDB indexes verified/created")
    except Exception:
        # Index creation failing (e.g. transient Atlas hiccup at boot) should
        # never prevent the app from starting — queries still work without
        # the index, just slower, and this will retry next restart.
        logger.exception("Index creation failed at startup — app will continue without them")


@app.on_event("startup")
async def preload_local_whisper_model():
    """Warms the local faster-whisper fallback model in the background at
    boot instead of on the first upload that needs it. Without this, the
    very first audio upload after a restart pays the one-time model
    download/load cost synchronously inside the job — which is what made
    the Presentation Analysis page feel stuck well past 10 seconds whenever
    the hosted OpenAI Whisper call failed (quota/auth/network) and it had
    to fall back."""
    import asyncio
    from app.services import whisper_service

    asyncio.create_task(whisper_service.preload_local_model())


@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Debate Coach API"}


@app.get("/health")
async def health():
    """Real health check — actually pings MongoDB rather than always
    reporting healthy, so an orchestrator/load-balancer can detect a dead
    DB connection instead of routing traffic to an app that can't serve
    any real request."""
    db_ok = await ping_database()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
    }
