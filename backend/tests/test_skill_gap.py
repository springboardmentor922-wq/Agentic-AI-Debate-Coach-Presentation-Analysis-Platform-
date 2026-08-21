from app.core import database as db
from app.services import skill_gap_service

from tests.helpers import create_user_direct


async def _seed_report(user_id: str, argument_quality: float, evidence_usage: float = 7.0):
    await db.debate_feedback_reports_collection.insert_one(
        {
            "user_id": user_id,
            "session_id": "s1",
            "report": {
                "argument_quality": argument_quality,
                "evidence_usage": evidence_usage,
                "logical_consistency": 8.0,
                "rebuttal_effectiveness": 6.0,
                "communication_skills": 7.0,
                "weaknesses": ["Weak rebuttals"],
            },
            "created_at": "2026-01-01T00:00:00",
        }
    )


async def test_compute_skill_gap_empty_returns_empty_result():
    result = await skill_gap_service.compute_skill_gap([])
    assert result["sample_size"] == 0
    assert result["averages"] == {}


async def test_compute_skill_gap_averages_and_strengths_weaknesses():
    learner = await create_user_direct("learner", "l1@example.com")
    await _seed_report(learner["id"], argument_quality=9.0)
    await _seed_report(learner["id"], argument_quality=7.0)

    result = await skill_gap_service.compute_skill_gap([learner["id"]])
    assert result["sample_size"] == 2
    assert result["learner_count"] == 1
    # (9+7)/2 * 10 = 80
    assert result["averages"]["argument_quality"] == 80.0
    assert len(result["strengths"]) == 2
    assert len(result["weaknesses"]) == 2
    assert result["recommendations"][0]["title"] == "Weak rebuttals"


async def test_resolve_learner_ids_filters_by_learner_and_department():
    coach_roster = []
    l1 = await create_user_direct("learner", "dept-a-1@example.com", department="Debate A")
    l2 = await create_user_direct("learner", "dept-b-1@example.com", department="Debate B")
    coach_roster = [l1["id"], l2["id"]]

    # Explicit learner filter wins outright.
    only_l1 = await skill_gap_service.resolve_learner_ids(coach_roster, l1["id"], None)
    assert only_l1 == [l1["id"]]

    # Department filter narrows within the caller's own scope.
    dept_a = await skill_gap_service.resolve_learner_ids(coach_roster, None, "Debate A")
    assert dept_a == [l1["id"]]

    # A department filter can't be used to reach outside the caller's scope
    # even if other learners exist in that department platform-wide.
    l3_outside_roster = await create_user_direct("learner", "dept-a-2@example.com", department="Debate A")
    dept_a_still_scoped = await skill_gap_service.resolve_learner_ids(coach_roster, None, "Debate A")
    assert l3_outside_roster["id"] not in dept_a_still_scoped

    # No filters at all -> caller's base scope unchanged.
    no_filter = await skill_gap_service.resolve_learner_ids(coach_roster, None, None)
    assert set(no_filter) == set(coach_roster)


async def test_coach_skill_gap_endpoint_respects_department_filter(client):
    coach = await create_user_direct("debate_coach", "coach2@example.com")
    l1 = await create_user_direct("learner", "sg-l1@example.com", department="Debate A")
    l2 = await create_user_direct("learner", "sg-l2@example.com", department="Debate B")
    await db.coach_assignments_collection.insert_many(
        [
            {"coach_id": coach["id"], "learner_id": l1["id"], "assigned_at": "2026-01-01"},
            {"coach_id": coach["id"], "learner_id": l2["id"], "assigned_at": "2026-01-01"},
        ]
    )
    await _seed_report(l1["id"], argument_quality=10.0)
    await _seed_report(l2["id"], argument_quality=2.0)

    res = await client.get(
        "/api/v1/coach/skill-gap",
        params={"department": "Debate A"},
        headers={"Authorization": f"Bearer {coach['access_token']}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["sample_size"] == 1
    assert data["averages"]["argument_quality"] == 100.0  # only l1's report counted
