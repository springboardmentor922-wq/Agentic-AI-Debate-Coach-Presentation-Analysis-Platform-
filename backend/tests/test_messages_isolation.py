"""Cross-user data isolation for direct messaging (item 16 / item 2 of the
completion scope). The core guarantee under test: a user can never read a
conversation they are not a participant in, even if they know or guess the
other two users' IDs."""
from tests.helpers import create_user_direct


async def test_thread_is_scoped_to_current_user_only(client):
    alice = await create_user_direct("learner", "alice@example.com", "Alice")
    bob = await create_user_direct("learner", "bob@example.com", "Bob")
    eve = await create_user_direct("learner", "eve@example.com", "Eve")

    # Alice sends Bob a private message.
    res = await client.post(
        "/api/v1/messages",
        json={"recipient_id": bob["id"], "text": "Secret plan for the debate"},
        headers={"Authorization": f"Bearer {alice['access_token']}"},
    )
    assert res.status_code == 201

    # Eve (uninvolved third party) tries to read the Alice<->Bob thread by
    # requesting the thread with Bob's ID as if she were a participant.
    eve_view = await client.get(
        f"/api/v1/messages/thread/{bob['id']}",
        headers={"Authorization": f"Bearer {eve['access_token']}"},
    )
    assert eve_view.status_code == 200
    # Eve's own thread with Bob is empty — Alice's message never appears,
    # because the query is always scoped to (current_user, other_user).
    assert eve_view.json() == []


async def test_unread_count_endpoint_exists_and_is_scoped(client):
    """Regression test: GET /api/v1/messages/unread-count used to 404
    because the route didn't exist. It must exist, require auth, and only
    count messages addressed to the requesting user."""
    alice = await create_user_direct("learner", "alice2@example.com", "Alice")
    bob = await create_user_direct("learner", "bob2@example.com", "Bob")
    eve = await create_user_direct("learner", "eve2@example.com", "Eve")

    # No auth -> 401, not 404.
    anon = await client.get("/api/v1/messages/unread-count")
    assert anon.status_code == 401

    res = await client.post(
        "/api/v1/messages",
        json={"recipient_id": bob["id"], "text": "Hi Bob"},
        headers={"Authorization": f"Bearer {alice['access_token']}"},
    )
    assert res.status_code == 201

    bob_unread = await client.get(
        "/api/v1/messages/unread-count",
        headers={"Authorization": f"Bearer {bob['access_token']}"},
    )
    assert bob_unread.status_code == 200
    assert bob_unread.json() == {"unread_count": 1}

    # Eve has no messages addressed to her.
    eve_unread = await client.get(
        "/api/v1/messages/unread-count",
        headers={"Authorization": f"Bearer {eve['access_token']}"},
    )
    assert eve_unread.status_code == 200
    assert eve_unread.json() == {"unread_count": 0}

    # Reading the thread marks messages read, so the count drops back to 0.
    await client.get(
        f"/api/v1/messages/thread/{alice['id']}",
        headers={"Authorization": f"Bearer {bob['access_token']}"},
    )
    bob_unread_after = await client.get(
        "/api/v1/messages/unread-count",
        headers={"Authorization": f"Bearer {bob['access_token']}"},
    )
    assert bob_unread_after.json() == {"unread_count": 0}


async def test_conversation_list_never_shows_other_users_conversations(client):
    alice = await create_user_direct("learner", "alice2@example.com", "Alice")
    bob = await create_user_direct("learner", "bob2@example.com", "Bob")
    eve = await create_user_direct("learner", "eve2@example.com", "Eve")

    await client.post(
        "/api/v1/messages",
        json={"recipient_id": bob["id"], "text": "hi bob"},
        headers={"Authorization": f"Bearer {alice['access_token']}"},
    )

    eve_conversations = await client.get(
        "/api/v1/messages/conversations",
        headers={"Authorization": f"Bearer {eve['access_token']}"},
    )
    assert eve_conversations.json() == []

    alice_conversations = await client.get(
        "/api/v1/messages/conversations",
        headers={"Authorization": f"Bearer {alice['access_token']}"},
    )
    partner_ids = [c["user_id"] for c in alice_conversations.json()]
    assert partner_ids == [bob["id"]]


async def test_endpoints_require_authentication(client):
    res = await client.get("/api/v1/messages/conversations")
    assert res.status_code == 401
    res2 = await client.post("/api/v1/messages", json={"recipient_id": "x", "text": "hi"})
    assert res2.status_code == 401
