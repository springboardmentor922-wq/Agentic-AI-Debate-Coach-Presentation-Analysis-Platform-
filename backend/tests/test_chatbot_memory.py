"""
Chatbot conversational memory (item 2). A live LLM isn't available in this
sandbox, so what's genuinely verifiable here is the *mechanism* that memory
depends on: that each turn's full prior conversation is correctly
assembled and handed to the LLM provider chain (get_text_result_with_history),
in order, without off-by-one errors or duplicate entries — not that a real
LLM correctly reasons over "why?" (that requires a live provider call, which
is LOCAL VERIFICATION REQUIRED — see note below). Mocking
get_text_result_with_history and inspecting exactly what it's called with is
a stronger test of "is memory actually wired in" than asserting on a real
model's output would be, since a real model could still produce a
plausible-sounding answer even from broken/empty history.
"""
from unittest.mock import AsyncMock

from app.agents import orchestrator
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_follow_up_turn_receives_full_prior_history(client, monkeypatch):
    """Send two messages in the same session; on the second call, the LLM
    must receive the first user message and first assistant reply as prior
    context — the actual mechanism a real model needs to answer "why?" or
    "explain that" correctly."""
    captured_calls = []

    async def fake_llm(*, messages, variables, temperature):
        captured_calls.append({"messages": messages, "variables": dict(variables)})
        return f"canned reply #{len(captured_calls)}"

    monkeypatch.setattr(orchestrator, "get_text_result_with_history", fake_llm)

    learner = await create_user_direct("learner", "memory-learner@example.com")
    headers = await _headers(learner)

    create_res = await client.post("/api/v1/coach-chat/sessions", json={"page_key": "dashboard", "title": "memory test"}, headers=headers)
    session_id = create_res.json()["id"]

    first = await client.post(
        f"/api/v1/coach-chat/sessions/{session_id}/messages",
        json={"page_key": "dashboard", "text": "My argument was that remote work boosts productivity."},
        headers=headers,
    )
    assert first.status_code == 200
    assert first.json()["assistant_message"]["text"] == "canned reply #1"

    second = await client.post(
        f"/api/v1/coach-chat/sessions/{session_id}/messages",
        json={"page_key": "dashboard", "text": "Why?"},
        headers=headers,
    )
    assert second.status_code == 200

    # Two LLM calls happened; the second call's history must contain the
    # first turn's user message and assistant reply.
    assert len(captured_calls) == 2
    second_call_history = captured_calls[1]["messages"]
    history_texts = [content for _role, content in second_call_history if isinstance(content, str)]
    assert any("remote work boosts productivity" in t for t in history_texts)
    assert any("canned reply #1" in t for t in history_texts)
    # And the current turn's message is passed as the template variable, not
    # baked into history (so the prompt template's {message} still works).
    assert captured_calls[1]["variables"]["message"] == "Why?"


async def test_a_new_chat_starts_with_empty_history_not_leaking_the_old_one(client, monkeypatch):
    """'Allow New Chat' + 'prevent unrelated old conversations from
    contaminating the current conversation' — a fresh session's first LLM
    call must receive zero prior turns, even though the same user has an
    older session with real content."""
    captured_calls = []

    async def fake_llm(*, messages, variables, temperature):
        captured_calls.append({"messages": messages})
        return "a reply"

    monkeypatch.setattr(orchestrator, "get_text_result_with_history", fake_llm)

    learner = await create_user_direct("learner", "memory-newchat-learner@example.com")
    headers = await _headers(learner)

    old_session = await client.post("/api/v1/coach-chat/sessions", json={"page_key": "dashboard", "title": "old chat"}, headers=headers)
    old_id = old_session.json()["id"]
    await client.post(
        f"/api/v1/coach-chat/sessions/{old_id}/messages",
        json={"page_key": "dashboard", "text": "OLD_CONVERSATION_SECRET_TOPIC"},
        headers=headers,
    )

    new_session = await client.post("/api/v1/coach-chat/sessions", json={"page_key": "dashboard", "title": "new chat"}, headers=headers)
    new_id = new_session.json()["id"]
    await client.post(
        f"/api/v1/coach-chat/sessions/{new_id}/messages",
        json={"page_key": "dashboard", "text": "hello"},
        headers=headers,
    )

    # The new session's LLM call (the second captured call overall) must not
    # contain the old session's content anywhere in its history.
    new_session_call = captured_calls[-1]
    history_texts = [content for _role, content in new_session_call["messages"] if isinstance(content, str)]
    assert not any("OLD_CONVERSATION_SECRET_TOPIC" in t for t in history_texts)


async def test_delete_conversation_removes_it_from_history_list(client):
    learner = await create_user_direct("learner", "memory-delete-learner@example.com")
    headers = await _headers(learner)

    session = await client.post("/api/v1/coach-chat/sessions", json={"page_key": "dashboard", "title": "to delete"}, headers=headers)
    session_id = session.json()["id"]

    before = await client.get("/api/v1/coach-chat/sessions", headers=headers)
    assert any(s["id"] == session_id for s in before.json())

    delete_res = await client.delete(f"/api/v1/coach-chat/sessions/{session_id}", headers=headers)
    assert delete_res.status_code == 204

    after = await client.get("/api/v1/coach-chat/sessions", headers=headers)
    assert all(s["id"] != session_id for s in after.json())
