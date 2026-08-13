"""
Shared pytest fixtures.

Critical ordering constraint: every router does
`from app.core.database import X_collection` at import time, binding that
name directly into its own module namespace. That means patching
`app.core.database.users_collection` *after* routers have already imported
it would not affect those already-bound references. Instead, we patch
`motor.motor_asyncio.AsyncIOMotorClient` itself with mongomock-motor's
in-memory equivalent BEFORE `app.core.database` (and therefore `app.main`
and every router) is imported for the first time. Because Python caches
imports, every module that later does `from app.core.database import ...`
gets collection objects backed by the same in-memory mock database.

This lets the whole test suite run with zero external services — no real
MongoDB, no OpenAI/Anthropic keys (the LLM provider chain already falls
back to deterministic output when no keys are configured, so those code
paths are exercised for real rather than mocked).
"""
import os
import sys

import pytest
from httpx import AsyncClient, ASGITransport
from mongomock_motor import AsyncMongoMockClient

# Required env vars the app's Settings model needs just to construct —
# deliberately no OPENAI_API_KEY/ANTHROPIC_API_KEY, so AI-backed code paths
# exercise their real deterministic fallback rather than hitting the network.
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGO_DB_NAME", "debate_coach_test")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-not-for-production")

# IMPORTANT: pydantic-settings' Settings(model_config=SettingsConfigDict(env_file=".env"))
# reads backend/.env directly from disk — it is NOT limited to os.environ. If a
# developer's real .env has live SMTP/Twilio/Google credentials configured (as it
# should for real deployment), those values leak into this "hermetic" test run
# unless every provider-credential field is explicitly forced empty here. Env vars
# take precedence over the .env file in pydantic-settings, so setting these (not
# setdefault — force, in case a previous test process left them set) is enough to
# guarantee tests never attempt a real SMTP/Twilio/OAuth network call regardless of
# what's in the real .env. A real SMTP connection attempt inside a "unit" test can
# hang for the full socket timeout (or indefinitely behind a restrictive egress
# proxy), which is exactly the failure this caused before this fix.
for _var in (
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
):
    os.environ[_var] = ""

if "app.core.database" in sys.modules:
    raise RuntimeError(
        "app.core.database was imported before conftest.py could patch Motor — "
        "collections would be bound to a real client. Check test import order."
    )

import motor.motor_asyncio  # noqa: E402

motor.motor_asyncio.AsyncIOMotorClient = AsyncMongoMockClient

# Safe to import the app now — every collection it binds will be backed by
# the in-memory mock client patched above.
from app.main import app  # noqa: E402
from app.core import database as db  # noqa: E402
from app.core.rate_limit import limiter as _rate_limiter  # noqa: E402


@pytest.fixture(autouse=True)
async def _clean_database():
    """Each test starts from an empty database — mongomock-motor is
    in-process and fast enough that a full wipe per test is cheap, and it
    avoids order-dependent test flakiness."""
    for name in await db.db.list_collection_names():
        await db.db[name].delete_many({})
    yield


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    """Rate limiting (app/core/rate_limit.py) uses an in-memory store keyed
    by client IP. Every test client request comes from the same fake IP
    ("testclient", via httpx's ASGITransport), and slowapi's storage is a
    module-level singleton that otherwise persists for the whole pytest
    process — so without a per-test reset, tests would accumulate the same
    IP's request count across the entire suite and start failing with 429s
    partway through a full run, regardless of which endpoints they hit.
    This keeps each test's rate-limit budget independent, matching a fresh
    real-world client per test."""
    _rate_limiter.reset()
    yield


@pytest.fixture
def app_instance():
    return app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
