import logging

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import AutoReconnect, ConnectionFailure, NetworkTimeout

from app.core.config import settings

logger = logging.getLogger(__name__)

# Resilient client configuration so transient Atlas hiccups (DNS blips,
# replica-set elections, brief network partitions) never crash a request.
# Motor/PyMongo retries most transient errors internally when these are set;
# retry_query() below is a thin extra guard for read paths that call it.
client = AsyncIOMotorClient(
    settings.MONGO_URI,
    serverSelectionTimeoutMS=8000,
    connectTimeoutMS=8000,
    socketTimeoutMS=20000,
    retryWrites=True,
    retryReads=True,
    maxPoolSize=50,
    minPoolSize=0,
    heartbeatFrequencyMS=10000,
)
db = client[settings.MONGO_DB_NAME]

RETRYABLE_MONGO_ERRORS = (AutoReconnect, ConnectionFailure, NetworkTimeout)


async def ping_database() -> bool:
    """Used by the health endpoint and startup check — never raises."""
    try:
        await client.admin.command("ping")
        return True
    except RETRYABLE_MONGO_ERRORS:
        logger.warning("MongoDB ping failed (transient) — will retry on next call", exc_info=True)
        return False
    except Exception:
        logger.exception("MongoDB ping failed")
        return False


async def retry_query(coro_fn, *args, retries: int = 2, **kwargs):
    """Wrap a single Motor call with a couple of short retries on the
    transient errors above (e.g. AutoReconnect during a replica-set
    election), so a passing network blip doesn't surface as a 500."""
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        try:
            return await coro_fn(*args, **kwargs)
        except RETRYABLE_MONGO_ERRORS as exc:
            last_exc = exc
            logger.warning("Transient MongoDB error (attempt %s/%s): %s", attempt + 1, retries + 1, exc)
    raise last_exc

# Collections
users_collection = db["users"]
debate_sessions_collection = db["debate_sessions"]
session_transcripts_collection = db["session_transcripts"]
fallacy_reports_collection = db["fallacy_reports"]
argument_analysis_collection = db["argument_analysis"]
performance_scores_collection = db["debate_performance"]
skills_collection = db["skills"]
otp_codes_collection = db["otp_codes"]
password_reset_tokens_collection = db["password_reset_tokens"]
debate_feedback_reports_collection = db["debate_feedback_reports"]

# --- Milestone 3: AI Debate Simulation, Presentation Analysis, Coaching ---
debate_topics_collection = db["debate_topics"]
debate_messages_collection = db["debate_messages"]
presentation_analysis_collection = db["presentation_analysis"]
learning_plans_collection = db["learning_plans"]
coaching_plans_collection = db["coaching_plans"]
processing_jobs_collection = db["processing_jobs"]
coach_feedback_collection = db["coach_feedback"]
notifications_collection = db["notifications"]
performance_history_collection = db["performance_history"]
# `leaderboards` is intentionally not a stored collection: the leaderboard is
# always computed live from performance_scores_collection (see
# app/routers/dashboard.py) so it can never go stale or show fake entries.

# --- Milestone 4: Coach Review System, Educator Analytics, Achievement &
# Certificate Engines ---
coach_reviews_collection = db["coach_reviews"]  # one doc per completed debate: review queue + coach's input
coach_assignments_collection = db["coach_assignments"]  # coach_id <-> learner_id roster
educator_assignments_collection = db["educator_topic_assignments"]  # topics an educator assigns to a learner
achievements_collection = db["achievements"]  # unlocked achievements, rule-evaluated, never hardcoded per-user
certificates_collection = db["certificates"]  # issued certificates, rule-evaluated, never hardcoded per-user

# --- Milestone 4: Learning Hub (Practice Exercises, Quizzes, AI Mentor) ---
practice_exercises_collection = db["practice_exercises"]  # generated per-user from real weaknesses
quiz_attempts_collection = db["quiz_attempts"]  # generated quiz instances + scores
mentor_messages_collection = db["mentor_messages"]  # AI Mentor conversation history, per user

# --- Global AI Debate Coach Chatbot (Conversation Orchestrator + 8 agents) ---
# Available platform-wide (all 4 roles), unlike mentor_messages_collection which
# is learner-only and scoped to the Learning Hub. One doc per chat thread, so
# users can maintain multiple named conversations ("New Chat" / history list).
coach_chat_sessions_collection = db["coach_chat_sessions"]
coach_chat_messages_collection = db["coach_chat_messages"]

# --- Module #1 additions: standalone Counterargument Generator + My Notes ---
counterargument_reports_collection = db["counterargument_reports"]
learner_notes_collection = db["learner_notes"]

# --- Module #3: Admin Dashboard ---
audit_logs_collection = db["audit_logs"]  # every sensitive admin action, real, never fabricated
platform_settings_collection = db["platform_settings"]  # single-doc config: site name, support email, maintenance mode

# --- Module #4: Coach/Educator Messages (real, lightweight 1:1 direct messaging) ---
messages_collection = db["messages"]

# --- Module #5: Educator Dashboard ---
announcements_collection = db["announcements"]  # real class-wide announcements an educator has sent
rubrics_collection = db["rubrics"]