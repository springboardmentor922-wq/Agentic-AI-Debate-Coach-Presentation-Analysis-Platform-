"""Notification & Engagement System (PDF Module 12, item 15). Verifies real
persistence + user targeting, cross-user isolation, and the admin broadcast
path (Platform Announcements)."""
from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_debate_completion_creates_a_real_notification(client):
    """finish_debate() (see debate_live.py) creates a real
    'learning_milestone' notification — verifying it here end-to-end rather
    than just unit-testing create_notification() in isolation."""
    learner = await create_user_direct("learner", "notif-learner@example.com")
    headers = await _headers(learner)
    start = await client.post(
        "/api/v1/debate/start", json={"topic": "Notif test topic", "debate_format": "one_on_one"}, headers=headers
    )
    session_id = start.json()["id"]
    await client.post("/api/v1/debate/live", json={"session_id": session_id, "text": "a turn"}, headers=headers)
    await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=headers)

    res = await client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
    assert any(n["related_session_id"] == session_id for n in res.json())

    unread = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread.json()["unread_count"] >= 1


async def test_notifications_are_strictly_owner_scoped(client):
    alice = await create_user_direct("learner", "notif-alice@example.com")
    bob = await create_user_direct("learner", "notif-bob@example.com")

    alice_headers = await _headers(alice)
    start = await client.post(
        "/api/v1/debate/start", json={"topic": "Alice's notif topic", "debate_format": "one_on_one"}, headers=alice_headers
    )
    session_id = start.json()["id"]
    await client.post("/api/v1/debate/live", json={"session_id": session_id, "text": "turn"}, headers=alice_headers)
    await client.post(f"/api/v1/debate/finish?session_id={session_id}", headers=alice_headers)

    bob_notifications = await client.get("/api/v1/notifications", headers=await _headers(bob))
    assert bob_notifications.status_code == 200
    assert all(n["related_session_id"] != session_id for n in bob_notifications.json())


async def test_mark_read_is_owner_only(client):
    from app.core import database as db

    alice = await create_user_direct("learner", "notif-mark-alice@example.com")
    bob = await create_user_direct("learner", "notif-mark-bob@example.com")

    insert_result = await db.notifications_collection.insert_one(
        {
            "user_id": alice["id"], "type": "platform_announcement", "title": "Alice's notification",
            "message": "hi", "read": False, "created_at": "2026-01-01T00:00:00",
        }
    )
    notif_id = str(insert_result.inserted_id)

    denied = await client.patch(f"/api/v1/notifications/{notif_id}/read", headers=await _headers(bob))
    assert denied.status_code == 404

    allowed = await client.patch(f"/api/v1/notifications/{notif_id}/read", headers=await _headers(alice))
    assert allowed.status_code == 200
    assert allowed.json()["read"] is True


async def test_admin_broadcast_reaches_all_users_and_requires_admin_role(client):
    learner1 = await create_user_direct("learner", "notif-broadcast-1@example.com")
    learner2 = await create_user_direct("learner", "notif-broadcast-2@example.com")
    admin = await create_user_direct("administrator", "notif-broadcast-admin@example.com")

    denied = await client.post(
        "/api/v1/admin/notifications/broadcast",
        json={"title": "Trying to broadcast", "message": "should be rejected"},
        headers=await _headers(learner1),
    )
    assert denied.status_code == 403

    ok = await client.post(
        "/api/v1/admin/notifications/broadcast",
        json={"title": "Platform maintenance", "message": "Scheduled downtime Friday."},
        headers=await _headers(admin),
    )
    assert ok.status_code == 201

    for learner in (learner1, learner2):
        res = await client.get("/api/v1/notifications", headers=await _headers(learner))
        assert any(n["title"] == "Platform maintenance" for n in res.json())
