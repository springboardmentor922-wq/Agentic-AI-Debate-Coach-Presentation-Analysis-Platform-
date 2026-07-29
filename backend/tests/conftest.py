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
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("ANTHROPIC_API_KEY", "")

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


@pytest.fixture(autouse=True)
async def _clean_database():
    """Each test starts from an empty database — mongomock-motor is
    in-process and fast enough that a full wipe per test is cheap, and it
    avoids order-dependent test flakiness."""
    for name in await db.db.list_collection_names():
        await db.db[name].delete_many({})
    yield


@pytest.fixture
def app_instance():
    return app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
