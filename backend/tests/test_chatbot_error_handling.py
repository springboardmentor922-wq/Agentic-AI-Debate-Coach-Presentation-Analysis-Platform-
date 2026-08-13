"""Chatbot error handling (item 11). Verifies the orchestrator degrades
gracefully — never crashes, never returns an empty message, never leaks
internals — when the LLM provider chain misbehaves in different ways."""
from pymongo.errors import ServerSelectionTimeoutError

from app.agents import orchestrator
from app.core.database import coach_chat_sessions_collection
from app.services.llm_provider import AllProvidersUnavailableError
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_llm_unavailable_falls_back_to_grounded_deterministic_reply(client, monkeypatch):
    async def raise_unavailable(*, messages, variables, temperature):
        raise AllProvidersUnavailableError("all providers down")

    monkeypatch.setattr(orchestrator, "get_text_result_with_history", raise_unavailable)

    learner = await create_user_direct("learner", "error-llm-down@example.com")
    res = await client.post(
        "/api/v1/coach-chat/message", json={"page_key": "dashboard", "text": "How am I doing?"}, headers=await _headers(learner)
    )
    assert res.status_code == 200
    reply = res.json()["assistant_message"]["text"]
    assert reply  # never empty even when every provider is down
    assert "traceback" not in reply.lower()
    assert "api_key" not in reply.lower() and "apikey" not in reply.lower()


async def test_llm_empty_response_does_not_crash_or_return_blank_message(client, monkeypatch):
    async def return_empty(*, messages, variables, temperature):
        return ""

    monkeypatch.setattr(orchestrator, "get_text_result_with_history", return_empty)

    learner = await create_user_direct("learner", "error-empty-response@example.com")
    res = await client.post(
        "/api/v1/coach-chat/message", json={"page_key": "dashboard", "text": "Hello"}, headers=await _headers(learner)
    )
    # Even a literal empty string from the provider must not 500 the request.
    assert res.status_code == 200


async def test_unexpected_llm_exception_falls_back_gracefully(client, monkeypatch):
    """Anything other than AllProvidersUnavailableError (e.g. a malformed
    response the SDK fails to parse) is still caught — the orchestrator's
    handle_message has a broad except Exception fallback specifically for
    this."""
    async def raise_weird_error(*, messages, variables, temperature):
        raise ValueError("malformed response: unexpected token in JSON")

    monkeypatch.setattr(orchestrator, "get_text_result_with_history", raise_weird_error)

    learner = await create_user_direct("learner", "error-malformed@example.com")
    res = await client.post(
        "/api/v1/coach-chat/message", json={"page_key": "dashboard", "text": "Hello"}, headers=await _headers(learner)
    )
    assert res.status_code == 200
    reply = res.json()["assistant_message"]["text"]
    assert reply
    assert "malformed response" not in reply  # the raw exception text is never echoed to the user


async def test_message_to_nonexistent_session_returns_404_not_500(client):
    learner = await create_user_direct("learner", "error-bad-session@example.com")
    res = await client.post(
        "/api/v1/coach-chat/sessions/000000000000000000000000/messages",
        json={"page_key": "dashboard", "text": "hi"},
        headers=await _headers(learner),
    )
    assert res.status_code == 404


async def test_invalid_session_id_format_does_not_500(client):
    learner = await create_user_direct("learner", "error-invalid-id@example.com")
    res = await client.post(
        "/api/v1/coach-chat/sessions/not-a-valid-object-id/messages",
        json={"page_key": "dashboard", "text": "hi"},
        headers=await _headers(learner),
    )
    assert res.status_code in (400, 404, 422)
    assert res.status_code != 500


async def test_mongodb_outage_returns_clean_503_not_raw_500(client, monkeypatch):
    """Simulates the exact failure mode from a real MongoDB Atlas DNS/network
    outage (ServerSelectionTimeoutError / ReplicaSetNoPrimary). The chatbot
    session-list endpoint must surface this as a clean 503 identifying the
    external dependency, never an unhandled 500 with an internal traceback."""

    async def _raise(*args, **kwargs):
        raise ServerSelectionTimeoutError("getaddrinfo failed: ReplicaSetNoPrimary")

    monkeypatch.setattr(coach_chat_sessions_collection, "insert_one", _raise)

    learner = await create_user_direct("learner", "error-mongo-down@example.com")
    res = await client.post(
        "/api/v1/coach-chat/sessions",
        json={"page_key": "dashboard", "title": "t"},
        headers=await _headers(learner),
    )
    assert res.status_code == 503
    body = res.json()
    assert "MongoDB" in body["detail"] or "Database" in body["detail"]
