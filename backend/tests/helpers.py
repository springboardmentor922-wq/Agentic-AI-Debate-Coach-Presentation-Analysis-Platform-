"""Shared test helpers. Deliberately NOT in conftest.py — pytest auto-loads
conftest.py once per session as a plugin, and a test file also doing
`from tests.conftest import X` would trigger a second, separate import of
the same file under a different module name, running its Motor-patching
guard twice. Keeping helpers here avoids that entirely."""
from app.core import database as db


async def register_and_verify_learner(client, email="learner@example.com", full_name="Test Learner"):
    res = await client.post(
        "/api/v1/auth/register",
        json={"full_name": full_name, "email": email, "password": "password123", "confirm_password": "password123", "role": "learner"},
    )
    otp = res.json()["dev_otp_code"]
    verify = await client.post("/api/v1/auth/verify-email-otp", json={"email": email, "otp": otp})
    return verify.json()


async def create_user_direct(role: str, email: str, full_name: str = "Test User", **extra) -> dict:
    """Coach/Educator/Administrator accounts can't self-register in the real
    app (see routers/auth.py) — they're created by an admin. For tests we
    insert directly into the mock DB, exactly as app.core.security expects
    a user document to look, and hand back a ready-to-use access token."""
    from app.core.security import hash_password, create_access_token

    doc = {
        "full_name": full_name,
        "email": email,
        "password_hash": hash_password("password123"),
        "role": role,
        "email_verified": True,
        "is_active": True,
        "auth_provider": "local",
        "institution": None,
        "department": None,
        **extra,
    }
    result = await db.users_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["access_token"] = create_access_token({"sub": doc["id"], "role": role})
    return doc
