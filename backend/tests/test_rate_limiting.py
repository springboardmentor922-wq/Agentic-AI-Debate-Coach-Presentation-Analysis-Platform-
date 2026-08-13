"""Rate limiting (item 12). Verifies limits are actually enforced, not just
configured — the previous gap was that no rate limiting existed at all."""
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_login_is_rate_limited_after_repeated_attempts(client):
    """AUTH_RATE_LIMIT = 10/minute. Send more than that from the same
    client and expect a 429 to eventually appear — a real brute-force
    protection, not just a config value that's never exercised."""
    await create_user_direct("learner", "ratelimit-login@example.com")

    statuses = []
    for _ in range(15):
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "ratelimit-login@example.com", "password": "WrongPassword!", "expected_role": "learner"},
        )
        statuses.append(res.status_code)

    assert 429 in statuses, f"expected a 429 among repeated login attempts, got: {statuses}"
    # And the failed attempts before the limit kicked in were genuinely
    # rejected as bad credentials (401), not silently succeeding.
    assert 401 in statuses


async def test_register_is_rate_limited(client):
    statuses = []
    for i in range(15):
        res = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Spam Bot",
                "email": f"ratelimit-spam-{i}@example.com",
                "password": "SomePassword123!",
                "confirm_password": "SomePassword123!",
                "role": "learner",
            },
        )
        statuses.append(res.status_code)
    assert 429 in statuses


async def test_chat_message_endpoint_is_rate_limited(client):
    """LLM_RATE_LIMIT = 30/minute. Confirms the expensive, LLM-backed chat
    endpoint is actually throttled, not just the auth endpoints."""
    learner = await create_user_direct("learner", "ratelimit-chat@example.com")
    headers = await _headers(learner)

    statuses = []
    for _ in range(35):
        res = await client.post(
            "/api/v1/coach-chat/message", json={"page_key": "dashboard", "text": "hi"}, headers=headers
        )
        statuses.append(res.status_code)

    assert 429 in statuses, f"expected a 429 among repeated chat messages, got: {statuses}"


async def test_rate_limit_response_does_not_leak_internals(client):
    for _ in range(15):
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "nonexistent@example.com", "password": "x", "expected_role": "learner"},
        )
        if res.status_code == 429:
            body = res.text.lower()
            assert "traceback" not in body
            assert "secret" not in body
            assert "mongodb" not in body
            return
    raise AssertionError("never hit a 429 to check the response body against")
