"""
AI Debate Simulation Engine + Performance Scoring (PDF Modules 8, 9 /
Milestone 3). Exercises the real multi-turn flow end-to-end with zero LLM
keys configured, so the AI opponent, argument/fallacy analysis, and scoring
all run through their real deterministic fallback logic — not mocks.
"""
from tests.helpers import create_user_direct


async def _learner_headers(client, email="debate-sim-learner@example.com"):
    learner = await create_user_direct("learner", email)
    return {"Authorization": f"Bearer {learner['access_token']}"}, learner


async def test_full_debate_simulation_workflow(client):
    """start -> multiple live turns (real AI opponent + real argument/fallacy
    analysis each turn) -> finish -> real performance score persisted."""
    headers, learner = await _learner_headers(client)

    start_res = await client.post(
        "/api/v1/debate/start",
        json={"topic": "Should homework be abolished?", "debate_format": "one_on_one", "position": "for"},
        headers=headers,
    )
    assert start_res.status_code == 201
    session = start_res.json()
    session_id = session["id"]
    assert session["topic"] == "Should homework be abolished?"
    assert session["status"] == "active"

    # Turn 1
    turn1 = await client.post(
        "/api/v1/debate/live",
        json={"session_id": session_id, "text": "Homework reinforces classroom learning and builds independent study habits."},
        headers=headers,
    )
    assert turn1.status_code == 200
    t1_body = turn1.json()
    assert t1_body["ai_rebuttal"]  # real AI opponent turn, not empty
    assert "fallacy_report" in t1_body
    assert "argument_analysis" in t1_body

    # Turn 2 — multi-turn: the AI opponent responds again in the same session.
    turn2 = await client.post(
        "/api/v1/debate/live",
        json={"session_id": session_id, "text": "Studies also show that homework improves retention over time."},
        headers=headers,
    )
    assert turn2.status_code == 200
    assert turn2.json()["ai_rebuttal"]

    # A different learner cannot submit a turn into someone else's session.
    other_headers, _ = await _learner_headers(client, email="debate-sim-intruder@example.com")
    intrude = await client.post(
        "/api/v1/debate/live",
        json={"session_id": session_id, "text": "trying to hijack this session"},
        headers=other_headers,
    )
    assert intrude.status_code in (403, 404)

    # Finish -> real feedback report + performance score, computed from the
    # actual recorded turns above (not a hardcoded value).
    finish_res = await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=headers)
    assert finish_res.status_code == 200
    finish_body = finish_res.json()
    report = finish_body["report"]
    assert "overall_rating" in report
    assert 0 <= report["overall_rating"] <= 10
    # PDF's weighted scoring model dimensions are present, not just an
    # opaque single number.
    for dim in ("argument_quality", "evidence_usage", "logical_consistency"):
        assert dim in report

    # Score persisted and retrievable via the performance/report endpoints,
    # not just returned once and discarded.
    saved_report = await client.get(f"/api/v1/analysis/debate/{session_id}/report", headers=headers)
    assert saved_report.status_code == 200
    assert saved_report.json()["overall_rating"] == report["overall_rating"]


async def test_finish_requires_at_least_one_turn(client):
    headers, _ = await _learner_headers(client, email="empty-session-learner@example.com")
    start_res = await client.post(
        "/api/v1/debate/start",
        json={"topic": "Test topic with no turns", "debate_format": "one_on_one"},
        headers=headers,
    )
    session_id = start_res.json()["id"]
    finish_res = await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=headers)
    assert finish_res.status_code == 400


async def test_start_debate_requires_learner_role(client):
    coach = await create_user_direct("debate_coach", "coach-sim@example.com")
    res = await client.post(
        "/api/v1/debate/start",
        json={"topic": "x", "debate_format": "one_on_one"},
        headers={"Authorization": f"Bearer {coach['access_token']}"},
    )
    assert res.status_code == 403
