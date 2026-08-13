import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.responses import JSONResponse  # type: ignore
from pymongo.errors import PyMongoError  # type: ignore
from slowapi import _rate_limit_exceeded_handler  # type: ignore
from slowapi.errors import RateLimitExceeded  # type: ignore
from slowapi.middleware import SlowAPIMiddleware  # type: ignore

from app.core.config import settings
from app.core.database import client as mongo_client
from app.core.rate_limit import limiter

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
from app.services import topics_service, whisper_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Every startup task the app needs, in one place. This replaces four
    separate handlers that used to be split across
    @app.on_event("startup") and two router-level @router.on_event("startup")
    decorators — on_event is deprecated in FastAPI in favor of this
    lifespan context manager, and centralizing also means anything that
    drives the app through a *real* ASGI lifespan (uvicorn, or a test
    client using LifespanManager) only needs to trigger one hook, not
    remember which of several routers happened to register one.

    Order matters a little: Mongo connectivity is verified first since
    everything else touches the database; topic seeding and the
    email_verified backfill are cheap and idempotent; the Whisper model
    preload is intentionally fire-and-forget (asyncio.create_task, not
    awaited) so a slow model download never blocks the app from accepting
    requests.
    """
    try:
        await mongo_client.admin.command("ping")
        logger.info("MongoDB connected successfully")
    except Exception:
        logger.exception("MongoDB connection failed on startup — check MONGO_URI in .env")

    await topics_service.ensure_seeded()
    await admin.backfill_non_learner_email_verified()
    asyncio.create_task(whisper_service.preload_local_model())

    yield
    # No shutdown-time cleanup is currently needed (Motor's client doesn't
    # require an explicit close for the app's lifetime), but this is the
    # place to add it if that changes.


app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis Platform",
    description=(
        "Milestone 1: Auth, roles, profile & skill management, debate session scheduling "
        "and status management. Milestone 2: Argument Analysis Engine, Logical Fallacy "
        "Detection Engine, AI Debate Simulation, and analysis history/reporting. "
        "Milestone 3: full AI Debate Simulation (curated topics, live debate, audio/video "
        "upload pipelines, AI opponent personalities), Counterargument Generation, dynamic "
        "Coaching Engine, Personalized Learning Plans, and the Notification system."
    ),
    version="0.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting (see app/core/rate_limit.py). Registered globally so
# @limiter.limit(...) decorators work on any router; routes that don't use
# the decorator are unaffected — this doesn't apply a blanket default limit,
# only the endpoints explicitly decorated (auth + LLM-backed endpoints).
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(PyMongoError)
async def _mongo_error_handler(request: Request, exc: PyMongoError) -> JSONResponse:
    """Every router (chatbot sessions/history included) talks to MongoDB
    Atlas directly with no per-call try/except. Previously an Atlas outage
    or DNS failure (ServerSelectionTimeoutError, ReplicaSetNoPrimary, etc.)
    surfaced as a raw, unhandled 500 with an internal stack trace. This
    turns any such failure, anywhere in the API, into a clean 503 that
    correctly identifies it as an external MongoDB connectivity problem
    rather than an application bug - it cannot be "fixed" from inside this
    codebase since the database is an external managed service."""
    logger.error("MongoDB error handling %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "Database temporarily unavailable. This is an external MongoDB "
                "Atlas connectivity issue (network/DNS/cluster), not an "
                "application error - please verify MONGO_URI and Atlas network "
                "access, then retry."
            )
        },
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


@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Debate Coach API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
