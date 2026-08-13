"""File upload validation (item 20: security — file upload validation)."""
import io

from tests.helpers import create_user_direct


async def _headers(user):
    return {"Authorization": f"Bearer {user['access_token']}"}


async def test_audio_upload_rejects_disallowed_extension(client):
    learner = await create_user_direct("learner", "upload-learner@example.com")
    res = await client.post(
        "/api/v1/debate/upload-audio",
        files={"file": ("malicious.exe", io.BytesIO(b"not really audio"), "application/octet-stream")},
        headers=await _headers(learner),
    )
    assert res.status_code == 400


async def test_audio_upload_rejects_empty_file(client):
    learner = await create_user_direct("learner", "upload-learner2@example.com")
    res = await client.post(
        "/api/v1/debate/upload-audio",
        files={"file": ("empty.wav", io.BytesIO(b""), "audio/wav")},
        headers=await _headers(learner),
    )
    assert res.status_code == 400


async def test_audio_upload_accepts_allowed_extension_and_returns_job(client):
    learner = await create_user_direct("learner", "upload-learner3@example.com")
    fake_audio = b"RIFF" + b"\x00" * 100  # not a real WAV, but passes extension/size checks
    res = await client.post(
        "/api/v1/debate/upload-audio",
        files={"file": ("recording.wav", io.BytesIO(fake_audio), "audio/wav")},
        headers=await _headers(learner),
    )
    assert res.status_code == 202
    assert res.json()["job_id"]


async def test_upload_requires_learner_role(client):
    coach = await create_user_direct("debate_coach", "upload-coach@example.com")
    res = await client.post(
        "/api/v1/debate/upload-audio",
        files={"file": ("recording.wav", io.BytesIO(b"fake" * 10), "audio/wav")},
        headers=await _headers(coach),
    )
    assert res.status_code == 403


async def test_upload_requires_authentication(client):
    res = await client.post(
        "/api/v1/debate/upload-audio",
        files={"file": ("recording.wav", io.BytesIO(b"fake" * 10), "audio/wav")},
    )
    assert res.status_code == 401
