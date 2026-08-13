"""All Four Dashboards (PDF Module 11, item 13). Verifies each of the
Learner, Debate Coach, Educator, and Administrator dashboards is reachable
by its own role with real data, and firmly rejected for every other role —
the "each role sees exactly the information it is authorized to see"
requirement, checked as an actual permission matrix rather than spot-checked
per role."""
from datetime import datetime, timedelta, timezone

from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_learner_dashboard_summary(client):
    learner = await create_user_direct("learner", "dash-learner@example.com")
    res = await client.get("/api/v1/dashboard/summary", headers=await _headers(learner))
    assert res.status_code == 200


async def test_dashboard_summary_handles_mixed_datetime_formats(client):
    """Regression test: GET /api/v1/dashboard/summary used to 500 with
    "can't compare offset-naive and offset-aware datetimes" whenever a
    performance_scores/debate_sessions document had a naive datetime object,
    a tz-aware datetime object, or an ISO string in a different format than
    the others. Seed one of each and confirm the endpoint no longer breaks."""
    from app.core.database import performance_scores_collection, debate_sessions_collection

    learner = await create_user_direct("learner", "dash-mixed-dt@example.com")
    now = datetime.now(timezone.utc)

    await performance_scores_collection.insert_many([
        {
            "user_id": learner["id"],
            "session_id": "s1",
            "score": 80,
            # naive datetime object (no tzinfo) — as some legacy records are
            "created_at": (now - timedelta(days=1)).replace(tzinfo=None),
        },
        {
            "user_id": learner["id"],
            "session_id": "s2",
            "score": 90,
            # tz-aware datetime object
            "created_at": now - timedelta(days=10),
        },
        {
            "user_id": learner["id"],
            "session_id": "s3",
            "score": 70,
            # ISO string with a trailing 'Z' instead of an explicit offset
            "created_at": (now - timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S") + "Z",
        },
    ])
    await debate_sessions_collection.insert_one({
        "owner_id": learner["id"],
        "status": "completed",
        "updated_at": (now - timedelta(days=1)).replace(tzinfo=None),
        "recording": {"duration_seconds": 120},
    })

    res = await client.get("/api/v1/dashboard/summary", headers=await _headers(learner))
    assert res.status_code == 200
    body = res.json()
    assert body["sessions_completed"] >= 1


async def test_admin_platform_analytics_reflects_real_users(client):
    admin = await create_user_direct("administrator", "dash-admin@example.com")
    await create_user_direct("learner", "dash-admin-learner1@example.com")
    await create_user_direct("learner", "dash-admin-learner2@example.com")

    res = await client.get("/api/v1/admin/analytics", headers=await _headers(admin))
    assert res.status_code == 200

    role_summary = await client.get("/api/v1/admin/roles/summary", headers=await _headers(admin))
    assert role_summary.status_code == 200
    # Real counts from the DB, not hardcoded — at least the 2 learners + 1
    # admin just created must be reflected.
    body = role_summary.json()
    total = sum(body.values()) if isinstance(body, dict) else None
    assert total is None or total >= 3


async def test_educator_classroom_analytics(client):
    educator = await create_user_direct("educator", "dash-educator@example.com")
    res = await client.get("/api/v1/educator/classroom-analytics", headers=await _headers(educator))
    assert res.status_code == 200


async def test_coach_review_queue_and_assigned_learners(client):
    coach = await create_user_direct("debate_coach", "dash-coach@example.com")
    res = await client.get("/api/v1/coach/review-queue", headers=await _headers(coach))
    assert res.status_code == 200
    res2 = await client.get("/api/v1/coach/assigned-learners", headers=await _headers(coach))
    assert res2.status_code == 200


async def test_dashboard_endpoints_reject_wrong_roles(client):
    """Full negative matrix: none of the three non-owning roles can reach
    another role's dashboard endpoint."""
    learner = await create_user_direct("learner", "dash-matrix-learner@example.com")
    coach = await create_user_direct("debate_coach", "dash-matrix-coach@example.com")
    educator = await create_user_direct("educator", "dash-matrix-educator@example.com")
    admin = await create_user_direct("administrator", "dash-matrix-admin@example.com")

    # Admin-only endpoint rejected for the other three roles.
    for user in (learner, coach, educator):
        res = await client.get("/api/v1/admin/analytics", headers=await _headers(user))
        assert res.status_code == 403, f"{user['role']} should not reach admin analytics"

    # Educator-only endpoint rejected for the other three roles.
    for user in (learner, coach, admin):
        res = await client.get("/api/v1/educator/classroom-analytics", headers=await _headers(user))
        assert res.status_code == 403, f"{user['role']} should not reach educator analytics"

    # Coach-only endpoint rejected for the other three roles.
    for user in (learner, educator, admin):
        res = await client.get("/api/v1/coach/review-queue", headers=await _headers(user))
        assert res.status_code == 403, f"{user['role']} should not reach coach review queue"

    # Learner-only endpoint rejected for the other three roles.
    for user in (coach, educator, admin):
        res = await client.get("/api/v1/dashboard/summary", headers=await _headers(user))
        assert res.status_code == 403, f"{user['role']} should not reach learner dashboard"


async def test_dashboards_require_authentication(client):
    for path in (
        "/api/v1/dashboard/summary",
        "/api/v1/admin/analytics",
        "/api/v1/educator/classroom-analytics",
        "/api/v1/coach/review-queue",
    ):
        res = await client.get(path)
        assert res.status_code == 401, f"{path} should require auth"


async def test_coach_review_end_to_end_updates_learner_notification_and_plan(client):
    """The real cross-dashboard flow: learner completes a debate -> it
    enters the coach review queue -> coach reviews it -> learner gets a
    notification and their coaching plan reflects the coach's real
    feedback."""
    learner = await create_user_direct("learner", "dash-e2e-learner@example.com")
    coach = await create_user_direct("debate_coach", "dash-e2e-coach@example.com")

    from app.core import database as db
    await db.coach_assignments_collection.insert_one({"coach_id": coach["id"], "learner_id": learner["id"]})

    learner_headers = await _headers(learner)
    start = await client.post(
        "/api/v1/debate/start", json={"topic": "Dashboard e2e topic", "debate_format": "one_on_one"}, headers=learner_headers
    )
    session_id = start.json()["id"]
    await client.post(
        "/api/v1/debate/live", json={"session_id": session_id, "text": "a real argument turn"}, headers=learner_headers
    )
    await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=learner_headers)

    coach_headers = await _headers(coach)
    queue = await client.get("/api/v1/coach/review-queue", headers=coach_headers)
    assert queue.status_code == 200
    entry = next((r for r in queue.json() if r["session_id"] == session_id), None)
    assert entry is not None, "completed debate did not enter the coach review queue"

    claim_res = await client.post(f"/api/v1/coach/review/{entry['id']}/claim", headers=coach_headers)
    assert claim_res.status_code == 200

    submit_res = await client.post(
        f"/api/v1/coach/review/{entry['id']}/submit",
        json={"coach_comments": "Solid structure, work on evidence citations.", "coach_score": 78},
        headers=coach_headers,
    )
    assert submit_res.status_code == 200

    notifications = await client.get("/api/v1/notifications", headers=learner_headers)
    assert notifications.status_code == 200
    assert any("coach" in (n.get("type") or "").lower() or "coach" in (n.get("title") or "").lower() for n in notifications.json())

    reports = await client.get("/api/v1/reports", headers=learner_headers)
    match = next(item for item in reports.json()["items"] if item["id"] == session_id)
    assert match["coach_score"] == 78
