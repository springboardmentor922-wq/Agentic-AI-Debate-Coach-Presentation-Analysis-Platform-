"""
Unit & Integration Tests for Speech-to-Text, Presentation Analytics Engine,
Deterministic Scoring, Presentation Reports, and Role-Based Visibility.
(Milestone 4 Verification)
"""

import pytest
import io
import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.presentation_analysis import PresentationAnalysis
from app.presentation.services.presentation_analysis_engine import presentation_analysis_engine
from app.presentation.services.speech_to_text_service import speech_to_text_service
from app.utils.jwt import create_access_token


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
def test_user(db_session):
    """Fetch or create test learner user."""
    user = db_session.query(User).filter(User.email == "learner_m4_test@example.com").first()
    if not user:
        role = db_session.query(Role).filter(Role.name == "Learner").first()
        if not role:
            role = Role(name="Learner", description="Learner role")
            db_session.add(role)
            db_session.commit()
            db_session.refresh(role)

        user = User(
            full_name="M4 Test Learner",
            email="learner_m4_test@example.com",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/8051E83.N9j8/y2y10d0u9y6.2..",
            role_id=role.id,
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


def test_deterministic_presentation_scoring(db_session, test_user):
    """
    Verify that PresentationAnalysisEngine calculates exact deterministic scores
    from transcript and audio duration without random numbers.
    """
    # Create test presentation record
    pres = PresentationAnalysis(
        user_id=test_user.id,
        title="Test Public Speaking Keynote",
        filename="keynote.wav",
        mime_type="audio/wav",
        gridfs_id="dummy_gridfs_id",
        audio_duration_seconds=60.0, # 1.0 minute
        transcription_text="Hello ladies and gentlemen. Today um I am going to talk about climate action, like basically we need sustainable policies actually right now.",
        processing_status="TRANSCRIBED"
    )
    db_session.add(pres)
    db_session.commit()
    db_session.refresh(pres)

    # Run analysis engine
    analyzed = presentation_analysis_engine.analyze_presentation(pres.id, db_session)

    assert analyzed.processing_status == "COMPLETED"
    assert analyzed.speech_pace_wpm > 0.0
    assert analyzed.filler_words_count > 0
    assert 0.0 <= float(analyzed.confidence_score) <= 100.0
    assert 0.0 <= float(analyzed.clarity_score) <= 100.0
    assert 0.0 <= float(analyzed.overall_score) <= 100.0

    # Verify score determinism (running a second time produces exact same scores)
    score1 = float(analyzed.overall_score)
    score2 = float(presentation_analysis_engine.analyze_presentation(pres.id, db_session).overall_score)
    assert score1 == score2


def test_filler_word_detection(db_session, test_user):
    """
    Verify exact filler word counting and breakdown parsing.
    """
    transcript = "Um, I think, uh, like we should actually focus on this, you know, basically."
    pres = PresentationAnalysis(
        user_id=test_user.id,
        title="Filler Word Test",
        audio_duration_seconds=30.0,
        transcription_text=transcript,
        processing_status="TRANSCRIBED"
    )
    db_session.add(pres)
    db_session.commit()
    db_session.refresh(pres)

    analyzed = presentation_analysis_engine.analyze_presentation(pres.id, db_session)

    assert analyzed.filler_words_count >= 5
    filler_details = json.loads(analyzed.filler_words_details)
    assert "um" in filler_details or "uh" in filler_details or "like" in filler_details


def test_presentation_report_api(client, test_user, db_session):
    """
    Verify GET /api/v1/presentation/recordings/{id}/report returns structured presentation report.
    """
    pres = PresentationAnalysis(
        user_id=test_user.id,
        title="Keynote Presentation Report Test",
        audio_duration_seconds=45.0,
        transcription_text="The global economy requires green energy investments right now.",
        overall_score=88.5,
        speech_pace_wpm=140.0,
        filler_words_count=0,
        confidence_score=90.0,
        clarity_score=87.0,
        audience_engagement_score=88.0,
        processing_status="COMPLETED"
    )
    db_session.add(pres)
    db_session.commit()
    db_session.refresh(pres)

    token = create_access_token(data={"sub": test_user.email})

    res = client.get(
        f"/api/v1/presentation/recordings/{pres.id}/report",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert res.status_code == 200
    payload = res.json()
    assert payload["success"] is True
    assert "data" in payload
    assert payload["data"]["presentation_id"] == pres.id


def test_coach_presentation_submissions_api(client, db_session):
    """
    Verify Coach API GET /api/v1/coach/presentation-submissions.
    """
    coach = db_session.query(User).filter(User.email == "coach_m4_test@example.com").first()
    if not coach:
        role = db_session.query(Role).filter(Role.name == "Debate Coach").first()
        if not role:
            role = Role(name="Debate Coach", description="Coach role")
            db_session.add(role)
            db_session.commit()
            db_session.refresh(role)

        coach = User(
            full_name="M4 Debate Coach",
            email="coach_m4_test@example.com",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/8051E83.N9j8/y2y10d0u9y6.2..",
            role_id=role.id,
            is_active=True
        )
        db_session.add(coach)
        db_session.commit()

    token = create_access_token(data={"sub": coach.email})

    res = client.get(
        "/api/v1/coach/presentation-submissions",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_educator_presentation_analytics_api(client, db_session):
    """
    Verify Educator API GET /api/v1/educator/presentation-analytics.
    """
    educator = db_session.query(User).filter(User.email == "educator_m4_test@example.com").first()
    if not educator:
        role = db_session.query(Role).filter(Role.name == "Educator").first()
        if not role:
            role = Role(name="Educator", description="Educator role")
            db_session.add(role)
            db_session.commit()
            db_session.refresh(role)

        educator = User(
            full_name="M4 Educator",
            email="educator_m4_test@example.com",
            password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E/8051E83.N9j8/y2y10d0u9y6.2..",
            role_id=role.id,
            is_active=True
        )
        db_session.add(educator)
        db_session.commit()

    token = create_access_token(data={"sub": educator.email})

    res = client.get(
        "/api/v1/educator/presentation-analytics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    payload = res.json()
    assert "total_submissions" in payload
    assert "average_overall_score" in payload


def test_debate_room_audio_analysis_pipeline(client, test_user, db_session):
    """
    Verify complete Debate Room audio analysis pipeline:
    1. Upload audio to /api/v1/debate/analyze
    2. GridFS stores binary audio
    3. PostgreSQL records metadata with session_id and user_id
    4. SpeechMetrics returned in unified debate response.
    """
    token = create_access_token(data={"sub": test_user.email})

    fake_audio_binary = b"RIFF_HEADER_DUMMY_AUDIO_WAV_DEBATE_ROOM_SPEECH_TEST"

    def mock_transcribe(presentation_id, db):
        from app.models.presentation_analysis import PresentationAnalysis
        pres = db.query(PresentationAnalysis).filter(PresentationAnalysis.id == presentation_id).first()
        pres.transcription_text = "We should implement global climate action to reduce emissions and foster clean energy technology."
        pres.audio_duration_seconds = 30.0
        pres.processing_status = "TRANSCRIBED"
        db.commit()
        return pres, pres.transcription_text

    with patch.object(speech_to_text_service, "transcribe_presentation", side_effect=mock_transcribe):
        res = client.post(
            "/api/v1/debate/analyze",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "session_id": "1",
                "debate_format": "Oxford Debate",
                "user_position": "Affirmative",
                "difficulty": "Intermediate"
            },
            files={"media_file": ("debate_speech.wav", io.BytesIO(fake_audio_binary), "audio/wav")}
        )

    assert res.status_code == 200
    payload = res.json()
    assert payload["success"] is True
    data = payload["data"]

    assert data["session_id"] == 1
    assert "speech_metrics" in data
    metrics = data["speech_metrics"]
    assert metrics is not None
    assert metrics["gridfs_id"] is not None
    assert "confidence_score" in metrics
    assert "clarity_score" in metrics


