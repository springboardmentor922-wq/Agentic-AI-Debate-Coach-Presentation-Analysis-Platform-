from tests.helpers import register_and_verify_learner, create_user_direct


async def test_learner_can_generate_and_track_coaching_plan(client):
    """No OpenAI/Anthropic keys are configured in this test env, so this
    exercises the real deterministic fallback path in
    coaching_plan_service.py end-to-end through the actual API."""
    auth = await register_and_verify_learner(client)
    headers = {"Authorization": f"Bearer {auth['access_token']}"}

    gen_res = await client.post("/api/v1/coaching-plans/generate", headers=headers)
    assert gen_res.status_code == 200
    plan = gen_res.json()
    assert len(plan["weeks"]) == 4
    assert plan["completion_percent"] == 0.0
    assert plan["status"] == "active"
    # Every exercise should have a real computed deadline, not a placeholder.
    for week in plan["weeks"]:
        for ex in week["exercises"]:
            assert ex["deadline"]
            assert ex["completed"] is False

    latest_res = await client.get("/api/v1/coaching-plans/latest", headers=headers)
    assert latest_res.status_code == 200
    assert latest_res.json()["id"] == plan["id"]

    # Complete one exercise and confirm completion_percent actually moves.
    progress_res = await client.patch(
        f"/api/v1/coaching-plans/{plan['id']}/progress",
        json={"exercise_key": "1:0", "completed": True},
        headers=headers,
    )
    assert progress_res.status_code == 200
    updated = progress_res.json()
    assert updated["completion_percent"] > 0
    assert updated["weeks"][0]["exercises"][0]["completed"] is True


async def test_learner_cannot_view_another_learners_plan(client):
    auth_a = await register_and_verify_learner(client, email="a@example.com", full_name="Learner A")
    auth_b = await register_and_verify_learner(client, email="b@example.com", full_name="Learner B")

    gen_res = await client.post(
        "/api/v1/coaching-plans/generate", headers={"Authorization": f"Bearer {auth_a['access_token']}"}
    )
    plan_id = gen_res.json()["id"]

    # Learner B tries to progress-update Learner A's plan.
    forbidden_res = await client.patch(
        f"/api/v1/coaching-plans/{plan_id}/progress",
        json={"exercise_key": "1:0", "completed": True},
        headers={"Authorization": f"Bearer {auth_b['access_token']}"},
    )
    assert forbidden_res.status_code == 404  # not found rather than leaking existence via 403

    # Learner B listing plans defaults to their own id and correctly finds none.
    list_res = await client.get(
        "/api/v1/coaching-plans", headers={"Authorization": f"Bearer {auth_b['access_token']}"}
    )
    assert list_res.status_code == 200
    assert list_res.json() == []


async def test_coach_can_view_assigned_learners_plan_but_not_unassigned(client):
    learner_auth = await register_and_verify_learner(client, email="roster@example.com")
    learner_id = learner_auth["user"]["id"]

    coach = await create_user_direct("debate_coach", "coach@example.com")
    other_coach = await create_user_direct("debate_coach", "other-coach@example.com")

    from app.core import database as db

    await db.coach_assignments_collection.insert_one({"coach_id": coach["id"], "learner_id": learner_id, "assigned_at": "2026-01-01"})

    await client.post(
        "/api/v1/coaching-plans/generate", headers={"Authorization": f"Bearer {learner_auth['access_token']}"}
    )

    assigned_res = await client.get(
        "/api/v1/coaching-plans",
        params={"learner_id": learner_id},
        headers={"Authorization": f"Bearer {coach['access_token']}"},
    )
    assert assigned_res.status_code == 200
    assert len(assigned_res.json()) == 1

    unassigned_res = await client.get(
        "/api/v1/coaching-plans",
        params={"learner_id": learner_id},
        headers={"Authorization": f"Bearer {other_coach['access_token']}"},
    )
    assert unassigned_res.status_code == 403
