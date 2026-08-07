import io

import pytest

from app.services import whisper_service
from tests.helpers import register_and_verify_learner


@pytest.fixture(autouse=True)
def _mock_transcription(monkeypatch):
    """Whisper (OpenAI + the local faster-whisper fallback) both require
    real network/model access this sandbox doesn't have. The pipeline
    logic being tested here — job creation, background processing, status
    polling, persistence — is independent of which transcription engine
    produced the text, so it's mocked at that single boundary."""

    async def _fake_transcribe(file_path):
        return whisper_service.TranscriptionResult(
            text="This is a test argument about why remote work improves productivity for software teams.",
            engine="openai",
            fallback_reason=None,
        )

    monkeypatch.setattr(whisper_service, "transcribe_file", _fake_transcribe)


async def test_upload_audio_returns_job_id_and_completes(client):
    auth = await register_and_verify_learner(client)
    headers = {"Authorization": f"Bearer {auth['access_token']}"}

    files = {"file": ("turn.wav", io.BytesIO(b"fake-audio-bytes"), "audio/wav")}
    upload_res = await client.post("/api/v1/debate/upload-audio", files=files, headers=headers)
    assert upload_res.status_code == 202
    job_id = upload_res.json()["job_id"]
    assert upload_res.json()["status"] == "queued"

    # BackgroundTasks in a test ASGI transport run inline before the
    # response is actually returned to the caller in most cases, but poll
    # a few times regardless so this isn't flaky if that timing changes.
    import asyncio

    job = None
    for _ in range(20):
        status_res = await client.get(f"/api/v1/jobs/{job_id}", headers=headers)
        assert status_res.status_code == 200
        job = status_res.json()
        if job["status"] in ("done", "error"):
            break
        await asyncio.sleep(0.05)

    assert job["status"] == "done", job
    assert job["progress"] == 100
    assert job["result"]["transcript"].startswith("This is a test argument")
    assert job["result"]["presentation_score"]["overall_score"] is not None


async def test_job_status_is_owner_only(client):
    auth_a = await register_and_verify_learner(client, email="owner@example.com")
    auth_b = await register_and_verify_learner(client, email="intruder@example.com")

    files = {"file": ("turn.wav", io.BytesIO(b"fake-audio-bytes"), "audio/wav")}
    upload_res = await client.post(
        "/api/v1/debate/upload-audio", files=files, headers={"Authorization": f"Bearer {auth_a['access_token']}"}
    )
    job_id = upload_res.json()["job_id"]

    forbidden_res = await client.get(
        f"/api/v1/jobs/{job_id}", headers={"Authorization": f"Bearer {auth_b['access_token']}"}
    )
    assert forbidden_res.status_code == 403


async def test_upload_audio_rejects_unsupported_format(client):
    auth = await register_and_verify_learner(client)
    headers = {"Authorization": f"Bearer {auth['access_token']}"}

    files = {"file": ("turn.exe", io.BytesIO(b"not audio"), "application/octet-stream")}
    res = await client.post("/api/v1/debate/upload-audio", files=files, headers=headers)
    assert res.status_code == 400
