import pytest
from app.services.debate_topic_service import DebateTopicService, sanitize_topic_text
from app.schemas.debate_topic import GenerateTopicRequest, CreateDebateTopicRequest
from app.models.user import User

def test_sanitize_topic_text():
    # Verify various Ref # patterns are removed correctly
    raw_1 = "Should Technology policies be modernized for Beginner challenges (Ref #954)?"
    assert sanitize_topic_text(raw_1) == "Should Technology policies be modernized for Beginner challenges?"

    raw_2 = "Should Technology policies be modernized for Beginner challenges (Ref #977)?"
    assert sanitize_topic_text(raw_2) == "Should Technology policies be modernized for Beginner challenges?"

    raw_3 = "Should AI regulations be updated [Ref #123]?"
    assert sanitize_topic_text(raw_3) == "Should AI regulations be updated?"

    raw_4 = "Should AI regulations be updated Ref #456?"
    assert sanitize_topic_text(raw_4) == "Should AI regulations be updated?"

    raw_5 = "Should AI regulations be updated (Seed #789)?"
    assert sanitize_topic_text(raw_5) == "Should AI regulations be updated?"

    raw_6 = "Should AI regulations be updated (Reference #999)?"
    assert sanitize_topic_text(raw_6) == "Should AI regulations be updated?"

    raw_clean = "Should Technology policies be modernized for Beginner challenges?"
    assert sanitize_topic_text(raw_clean) == raw_clean


def test_generate_ai_topic_no_ref_id(db_session):
    # Mock current user
    user = User(id=1, full_name="Test User", email="test@example.com", role_id=1, password_hash="hash")
    
    req = GenerateTopicRequest(
        category="Technology",
        difficulty_level="Beginner",
        debate_format="Public Forum Debate"
    )

    # Test multiple generations (both standard pool and fallback)
    for _ in range(5):
        res = DebateTopicService.generate_ai_topic(
            db=db_session,
            req=req,
            current_user=user
        )
        assert res.title is not None
        assert "Ref #" not in res.title
        assert "Ref#" not in res.title
        assert "(Ref" not in res.title
        assert "[Ref" not in res.title
        assert "Seed" not in res.title
