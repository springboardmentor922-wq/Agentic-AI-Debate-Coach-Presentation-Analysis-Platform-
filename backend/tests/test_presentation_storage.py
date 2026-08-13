"""
Unit & Integration Tests for Presentation Recording & GridFS Audio Storage
(Checkpoint 2 Verification)
"""

import pytest
import io
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.presentation_analysis import PresentationAnalysis
from app.mongodb.database import mongodb


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_users(db_session):
    """Ensure test users with JWT tokens exist in database."""
    learner1 = db_session.query(User).filter(User.email == "learner1_test_p2@example.com").first()
    if not learner1:
        role = db_session.query(Role).filter(Role.name == "Learner").first()
        if not role:
            role = Role(name="Learner", description="Learner role")
            db_session.add(role)
            db_session.commit()
            db_session.refresh(role)

        learner1 = User(
            full_name="Test Learner One",
            email="learner1_test_p2@example.com",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/8051E83.N9j8/y2y10d0u9y6.2..",  # hashed pass
            role_id=role.id,
            is_active=True
        )
        db_session.add(learner1)
        db_session.commit()
        db_session.refresh(learner1)

    learner2 = db_session.query(User).filter(User.email == "learner2_test_p2@example.com").first()
    if not learner2:
        role = db_session.query(Role).filter(Role.name == "Learner").first()
        learner2 = User(
            full_name="Test Learner Two",
            email="learner2_test_p2@example.com",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/8051E83.N9j8/y2y10d0u9y6.2..",
            role_id=role.id,
            is_active=True
        )
        db_session.add(learner2)
        db_session.commit()
        db_session.refresh(learner2)

    return learner1, learner2


def get_token_for_user(client, email):
    # Obtain JWT token via auth API or test token
    from app.utils.jwt import create_access_token
    token = create_access_token(data={"sub": email})
    return token



def test_upload_recording_unauthenticated(client):
    """Unauthenticated upload request should return 401."""
    audio_content = b"RIFF....WAVEfmt ....data...."
    response = client.post(
        "/api/v1/presentation/recordings/upload",
        files={"audio_file": ("test.wav", io.BytesIO(audio_content), "audio/wav")}
    )
    assert response.status_code == 401


def test_upload_recording_invalid_file(client, test_users):
    """Uploading executable or text file as audio should return 400."""
    learner1, _ = test_users
    token = get_token_for_user(client, learner1.email)

    # Empty file
    res1 = client.post(
        "/api/v1/presentation/recordings/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"audio_file": ("empty.wav", io.BytesIO(b""), "audio/wav")}
    )
    assert res1.status_code == 400

    # Invalid extension/MIME
    res2 = client.post(
        "/api/v1/presentation/recordings/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"audio_file": ("malicious.exe", io.BytesIO(b"MZ......"), "application/x-msdownload")}
    )
    assert res2.status_code == 400


def test_successful_recording_upload_and_gridfs_storage(client, test_users, db_session):
    """
    Test uploading a valid presentation recording:
    1. GridFS stores binary audio chunk & metadata.
    2. PostgreSQL creates presentation_analyses row with gridfs_id.
    """
    learner1, _ = test_users
    token = get_token_for_user(client, learner1.email)

    fake_audio_binary = b"WEBM_AUDIO_HEADER_BINARY_DATA_SAMPLE_PRESENTATION_TEST"
    response = client.post(
        "/api/v1/presentation/recordings/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"title": "My Test Public Keynote"},
        files={"audio_file": ("keynote.webm", io.BytesIO(fake_audio_binary), "audio/webm")}
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]

    recording_id = data["id"]
    gridfs_id_str = data["gridfs_id"]

    assert gridfs_id_str is not None
    assert data["title"] == "My Test Public Keynote"
    assert data["processing_status"] == "STORED"
    assert data["user_id"] == learner1.id

    # Verify PostgreSQL row
    pg_record = db_session.query(PresentationAnalysis).filter(PresentationAnalysis.id == recording_id).first()
    assert pg_record is not None
    assert pg_record.gridfs_id == gridfs_id_str
    assert pg_record.mime_type == "audio/webm"

    # Verify MongoDB GridFS binary storage
    gridfs_file = mongodb.gridfs.get(ObjectId(gridfs_id_str))
    assert gridfs_file is not None
    stored_bytes = gridfs_file.read()
    assert stored_bytes == fake_audio_binary


def test_recording_ownership_isolation(client, test_users):
    """Learner 2 should NOT be able to stream Learner 1's audio recording."""
    learner1, learner2 = test_users
    token1 = get_token_for_user(client, learner1.email)
    token2 = get_token_for_user(client, learner2.email)

    # Learner 1 uploads
    fake_audio = b"LEARNER_ONE_PRIVATE_SPEECH"
    res_upload = client.post(
        "/api/v1/presentation/recordings/upload",
        headers={"Authorization": f"Bearer {token1}"},
        data={"title": "Learner One Secret Speech"},
        files={"audio_file": ("secret.wav", io.BytesIO(fake_audio), "audio/wav")}
    )
    rec_id = res_upload.json()["data"]["id"]

    # Learner 1 streams audio (Allowed)
    res_stream_l1 = client.get(
        f"/api/v1/presentation/recordings/{rec_id}/audio",
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res_stream_l1.status_code == 200
    assert res_stream_l1.content == fake_audio

    # Learner 2 tries to stream audio (Forbidden 403)
    res_stream_l2 = client.get(
        f"/api/v1/presentation/recordings/{rec_id}/audio",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res_stream_l2.status_code == 403
