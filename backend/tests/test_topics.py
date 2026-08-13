"""Debate topic curation (PDF Module 3: Debate Session Management —
topic creation) and its Admin CRUD counterpart. Exercises the real seeded
topic list plus admin-only create/update/delete."""
from app.services import topics_service
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def _ensure_topics_seeded():
    # Topics are normally seeded by debate_live.py's @router.on_event("startup")
    # handler, which httpx's ASGITransport (used by the `client` fixture) never
    # triggers — so tests that need real curated topics must seed explicitly.
    await topics_service.ensure_seeded()


async def test_topics_are_seeded_and_listable(client):
    await _ensure_topics_seeded()
    learner = await create_user_direct("learner", "topics-learner@example.com")
    res = await client.get("/api/v1/debate/topics", headers=await _headers(learner))
    assert res.status_code == 200
    assert len(res.json()) > 0


async def test_topics_can_be_filtered_by_format(client):
    await _ensure_topics_seeded()
    learner = await create_user_direct("learner", "topics-learner2@example.com")
    res = await client.get("/api/v1/debate/topics?debate_format=one_on_one", headers=await _headers(learner))
    assert res.status_code == 200
    for topic in res.json():
        assert topic["debate_format"] == "one_on_one"


async def test_starting_a_debate_without_a_topic_auto_picks_one(client):
    await _ensure_topics_seeded()
    """Module 3: 'Debate topic creation' — starting a debate with no topic
    specified must auto-select a real curated topic for the chosen format,
    not fail or return an empty topic."""
    learner = await create_user_direct("learner", "topics-learner3@example.com")
    res = await client.post(
        "/api/v1/debate/start", json={"debate_format": "one_on_one"}, headers=await _headers(learner)
    )
    assert res.status_code == 201
    assert res.json()["topic"]


async def test_admin_can_create_update_delete_topic(client):
    admin = await create_user_direct("administrator", "topics-admin@example.com")
    headers = await _headers(admin)

    create_res = await client.post(
        "/api/v1/admin/content/topics",
        json={
            "title": "A brand new custom topic for testing",
            "category": "Education",
            "difficulty": "intermediate",
            "debate_format": "policy_debate",
        },
        headers=headers,
    )
    assert create_res.status_code == 201
    topic_id = create_res.json()["id"]

    update_res = await client.patch(
        f"/api/v1/admin/content/topics/{topic_id}",
        json={
            "title": "An updated custom topic title",
            "category": "Education",
            "difficulty": "intermediate",
            "debate_format": "policy_debate",
        },
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "An updated custom topic title"

    delete_res = await client.delete(f"/api/v1/admin/content/topics/{topic_id}", headers=headers)
    assert delete_res.status_code == 204

    listed = await client.get("/api/v1/admin/content/topics", headers=headers)
    assert all(t["id"] != topic_id for t in listed.json())


async def test_topic_admin_endpoints_require_admin_role(client):
    learner = await create_user_direct("learner", "topics-learner4@example.com")
    res = await client.post(
        "/api/v1/admin/content/topics",
        json={
            "title": "Should not be allowed",
            "category": "Education",
            "difficulty": "intermediate",
            "debate_format": "policy_debate",
        },
        headers=await _headers(learner),
    )
    assert res.status_code == 403
