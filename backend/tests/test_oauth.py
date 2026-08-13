"""
Google OAuth2 tests (Milestone 1 gap: OAuth2 login was implemented but had
zero test coverage). Two independent code paths in app/routers/auth.py are
covered:

  1. POST /google-login       — Google Identity Services ID-token flow.
  2. GET  /oauth/google/login
     GET  /oauth/google/callback — classic OAuth2 authorization-code redirect flow.

Google's endpoints (oauth2.googleapis.com, www.googleapis.com) are mocked
with respx rather than called for real — this sandbox's network can't reach
them anyway, and hitting a real third party from a test suite would make it
flaky/non-hermetic regardless. What's under test is our own handling of
Google's responses: token verification, audience checking, email-verified
enforcement, account creation vs. linking, and the "not configured" safety
path — not Google's implementation.
"""
import respx
from httpx import Response

from app.core.config import settings
from app.core import database as db


def _configure_google(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/oauth/google/callback")


# ---------------------------------------------------------------------------
# Safe-when-unconfigured (GOOGLE_CLIENT_ID left blank, as in a fresh checkout)
# ---------------------------------------------------------------------------

async def test_google_login_returns_501_when_not_configured(client, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "")
    res = await client.post("/api/v1/auth/google-login", json={"credential": "whatever"})
    assert res.status_code == 501
    assert "not configured" in res.json()["detail"].lower()


async def test_oauth_authorize_url_returns_501_when_not_configured(client, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "")
    res = await client.get("/api/v1/auth/oauth/google/login")
    assert res.status_code == 501


async def test_oauth_callback_returns_501_when_not_configured(client, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "")
    res = await client.get("/api/v1/auth/oauth/google/callback", params={"code": "abc"})
    assert res.status_code == 501


# ---------------------------------------------------------------------------
# POST /google-login (Identity Services ID-token flow)
# ---------------------------------------------------------------------------

@respx.mock
async def test_google_login_creates_new_learner_account(client, monkeypatch):
    _configure_google(monkeypatch)
    respx.get("https://oauth2.googleapis.com/tokeninfo").mock(
        return_value=Response(
            200,
            json={
                "aud": "test-client-id.apps.googleusercontent.com",
                "email": "newgoogleuser@example.com",
                "email_verified": "true",
                "name": "New Google User",
                "sub": "google-sub-123",
                "picture": "https://example.com/pic.jpg",
            },
        )
    )

    res = await client.post("/api/v1/auth/google-login", json={"credential": "fake-id-token"})
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["email"] == "newgoogleuser@example.com"
    assert body["user"]["role"] == "learner"
    assert body["access_token"]

    stored = await db.users_collection.find_one({"email": "newgoogleuser@example.com"})
    assert stored["auth_provider"] == "google"
    assert stored["google_id"] == "google-sub-123"
    assert stored["email_verified"] is True


@respx.mock
async def test_google_login_links_existing_local_account(client, monkeypatch):
    """A user who originally registered with a password, then later clicks
    'Continue with Google' with the same email, should be logged into their
    existing account (linked), not get a second duplicate account."""
    _configure_google(monkeypatch)
    from tests.helpers import register_and_verify_learner

    verify_body = await register_and_verify_learner(client, email="linkme@example.com")
    original_id = verify_body["user"]["id"]

    respx.get("https://oauth2.googleapis.com/tokeninfo").mock(
        return_value=Response(
            200,
            json={
                "aud": "test-client-id.apps.googleusercontent.com",
                "email": "linkme@example.com",
                "email_verified": "true",
                "name": "Link Me",
                "sub": "google-sub-456",
            },
        )
    )
    res = await client.post("/api/v1/auth/google-login", json={"credential": "fake-id-token"})
    assert res.status_code == 200
    assert res.json()["user"]["id"] == original_id

    stored = await db.users_collection.find_one({"email": "linkme@example.com"})
    assert stored["google_id"] == "google-sub-456"
    assert stored["auth_provider"] == "google"


@respx.mock
async def test_google_login_rejects_wrong_audience(client, monkeypatch):
    """A credential minted for a different Google OAuth client must be
    rejected — otherwise any app using Google Identity Services could mint
    tokens usable to log into this platform."""
    _configure_google(monkeypatch)
    respx.get("https://oauth2.googleapis.com/tokeninfo").mock(
        return_value=Response(
            200,
            json={
                "aud": "someone-elses-client-id.apps.googleusercontent.com",
                "email": "attacker@example.com",
                "email_verified": "true",
                "sub": "google-sub-999",
            },
        )
    )
    res = await client.post("/api/v1/auth/google-login", json={"credential": "fake-id-token"})
    assert res.status_code == 401


@respx.mock
async def test_google_login_rejects_unverified_email(client, monkeypatch):
    _configure_google(monkeypatch)
    respx.get("https://oauth2.googleapis.com/tokeninfo").mock(
        return_value=Response(
            200,
            json={
                "aud": "test-client-id.apps.googleusercontent.com",
                "email": "unverified@example.com",
                "email_verified": "false",
                "sub": "google-sub-777",
            },
        )
    )
    res = await client.post("/api/v1/auth/google-login", json={"credential": "fake-id-token"})
    assert res.status_code == 400


@respx.mock
async def test_google_login_rejects_invalid_credential(client, monkeypatch):
    _configure_google(monkeypatch)
    respx.get("https://oauth2.googleapis.com/tokeninfo").mock(return_value=Response(400, json={"error": "invalid_token"}))
    res = await client.post("/api/v1/auth/google-login", json={"credential": "garbage"})
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# GET /oauth/google/login + /oauth/google/callback (authorization-code flow)
# ---------------------------------------------------------------------------

async def test_oauth_authorize_url_when_configured(client, monkeypatch):
    _configure_google(monkeypatch)
    res = await client.get("/api/v1/auth/oauth/google/login")
    assert res.status_code == 200
    url = res.json()["authorization_url"]
    assert url.startswith("https://accounts.google.com/o/oauth2/v2/auth?")
    assert "test-client-id.apps.googleusercontent.com" in url


@respx.mock
async def test_oauth_callback_creates_learner_account(client, monkeypatch):
    _configure_google(monkeypatch)
    respx.post("https://oauth2.googleapis.com/token").mock(
        return_value=Response(200, json={"access_token": "fake-google-access-token"})
    )
    respx.get("https://www.googleapis.com/oauth2/v2/userinfo").mock(
        return_value=Response(
            200,
            json={"email": "callbackuser@example.com", "name": "Callback User", "picture": "https://example.com/p.jpg"},
        )
    )

    res = await client.get("/api/v1/auth/oauth/google/callback", params={"code": "auth-code-123"})
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["email"] == "callbackuser@example.com"
    assert body["user"]["role"] == "learner"
    assert body["access_token"]


@respx.mock
async def test_oauth_callback_handles_bad_code(client, monkeypatch):
    _configure_google(monkeypatch)
    respx.post("https://oauth2.googleapis.com/token").mock(return_value=Response(400, json={"error": "invalid_grant"}))
    res = await client.get("/api/v1/auth/oauth/google/callback", params={"code": "bad-code"})
    assert res.status_code == 400
