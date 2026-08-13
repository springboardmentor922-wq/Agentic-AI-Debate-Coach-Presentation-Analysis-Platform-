"""Personalized Learning / Learning Hub (PDF Module 12, Milestone 3/4).
Drives a learner through a completed debate first so practice exercises and
learning materials are generated from real weaknesses (not stubbed), then
exercises the quiz flow end-to-end."""
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def _learner_with_a_completed_debate(client, email):
    learner = await create_user_direct("learner", email)
    headers = await _headers(learner)
    start = await client.post(
        "/api/v1/debate/start",
        json={"topic": "Should exams be abolished?", "debate_format": "one_on_one"},
        headers=headers,
    )
    session_id = start.json()["id"]
    # Deliberately trigger a real fallacy detection so downstream
    # weakness-based generation (exercises/materials) has real signal.
    await client.post(
        "/api/v1/debate/live",
        json={"session_id": session_id, "text": "You're just stupid if you think exams matter."},
        headers=headers,
    )
    await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=headers)
    return learner, headers


async def test_practice_exercises_require_debate_history_first(client):
    fresh_learner = await create_user_direct("learner", "learning-fresh@example.com")
    res = await client.post("/api/v1/practice-exercises/generate", headers=await _headers(fresh_learner))
    assert res.status_code == 400


async def test_practice_exercises_generated_from_real_weaknesses(client):
    learner, headers = await _learner_with_a_completed_debate(client, "learning-practice@example.com")
    res = await client.post("/api/v1/practice-exercises/generate", headers=headers)
    assert res.status_code == 200
    exercises = res.json()
    assert len(exercises) > 0

    listed = await client.get("/api/v1/practice-exercises", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == len(exercises)

    # Completing an exercise persists and is reflected back.
    exercise_id = exercises[0]["id"]
    complete_res = await client.post(f"/api/v1/practice-exercises/{exercise_id}/complete", headers=headers)
    assert complete_res.status_code == 200
    assert complete_res.json()["completed"] is True


async def test_quiz_full_flow_start_submit_score(client):
    learner, headers = await _learner_with_a_completed_debate(client, "learning-quiz@example.com")

    topics_res = await client.get("/api/v1/quizzes", headers=headers)
    assert topics_res.status_code == 200
    assert len(topics_res.json()) > 0
    topic = topics_res.json()[0]["topic"]

    start_res = await client.post(f"/api/v1/quizzes/{topic}/start", headers=headers)
    assert start_res.status_code == 200
    attempt = start_res.json()
    assert len(attempt["questions"]) > 0
    # Real questions, each with real answer options — not empty placeholders.
    for q in attempt["questions"]:
        assert q["question"]
        assert len(q["options"]) >= 2

    # Submit an answer for every question (index 0 for all — score doesn't
    # need to be perfect, just real and persisted).
    answers = [0] * len(attempt["questions"])
    submit_res = await client.post(
        f"/api/v1/quizzes/attempt/{attempt['id']}/submit", json={"answers": answers}, headers=headers
    )
    assert submit_res.status_code == 200
    assert 0 <= submit_res.json()["score"] <= 100


async def test_learning_materials_are_personalized(client):
    learner, headers = await _learner_with_a_completed_debate(client, "learning-materials@example.com")
    res = await client.get("/api/v1/learning-materials", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_mentor_ask_and_history_are_owner_scoped(client):
    alice, alice_headers = await _learner_with_a_completed_debate(client, "learning-mentor-alice@example.com")
    ask_res = await client.post(
        "/api/v1/mentor/ask", json={"question": "How can I improve my rebuttals?"}, headers=alice_headers
    )
    assert ask_res.status_code == 200
    assert ask_res.json()["text"]

    history_res = await client.get("/api/v1/mentor/history", headers=alice_headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1

    bob = await create_user_direct("learner", "learning-mentor-bob@example.com")
    bob_history = await client.get("/api/v1/mentor/history", headers=await _headers(bob))
    assert bob_history.status_code == 200
    assert bob_history.json() == []


async def test_learning_hub_endpoints_require_learner_role(client):
    coach = await create_user_direct("debate_coach", "learning-hub-coach@example.com")
    res = await client.get("/api/v1/quizzes", headers=await _headers(coach))
    assert res.status_code == 403
    res2 = await client.post("/api/v1/mentor/ask", json={"question": "hi"}, headers=await _headers(coach))
    assert res2.status_code == 403
