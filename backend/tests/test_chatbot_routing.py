import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def send_chat(page: str, message: str, user_id: int = 1, history: list = None):
    payload = {
        "page": page,
        "user_id": user_id,
        "message": message,
        "conversation_history": history or []
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    outputs = data.get("data", [])
    assert len(outputs) > 0
    content = outputs[0].get("content", "")
    selected_agents = outputs[0].get("selected_agents", [])
    return content, selected_agents

def test_1_topic_intent():
    content, selected = send_chat("/topics", "can u give me some debate topics")
    assert not content.strip().startswith("Hello") or "score is" not in content[:60]
    assert any(k in content.lower() for k in ["topics", "debate", "should"])
    assert "Topic Strategy Agent" in selected or "Recommendation & Coaching Agent" in selected

def test_2_counterargument_intent():
    content, selected = send_chat("/ai-simulation", "give me counterarguments")
    assert any(k in content.lower() for k in ["counterargument", "rebuttal", "opponent", "objection"])
    assert "Counterargument Agent" in selected

def test_3_fallacy_intent():
    content, selected = send_chat("/debate-room/1", "check my argument for fallacies")
    assert any(k in content.lower() for k in ["fallacy", "fallacies", "straw man", "ad hominem"])
    assert "Logical Fallacy Detection Agent" in selected

def test_4_argument_analysis_intent():
    content, selected = send_chat("/debate-room/1", "analyze my argument")
    assert any(k in content.lower() for k in ["claim", "warrant", "evidence", "argument"])
    assert "Argument Analysis Agent" in selected

def test_5_performance_intent():
    content, selected = send_chat("/skills", "why is my score low?")
    assert any(k in content.lower() for k in ["score", "performance", "skill", "reasoning"])
    assert "Performance Analytics Agent" in selected or "Recommendation & Coaching Agent" in selected

def test_6_coaching_intent():
    content, selected = send_chat("/dashboard", "how can i improve?")
    assert any(k in content.lower() for k in ["plan", "practice", "focus", "recommend"])
    assert "Recommendation & Coaching Agent" in selected

def test_7_general_question():
    content, selected = send_chat("/topics", "what is an oxford debate?")
    assert "oxford" in content.lower() and "motion" in content.lower()

def test_8_followup_question():
    history = [
        {"role": "user", "content": "give me five debate topics"},
        {"role": "assistant", "content": "1. AI in education\n2. Social media regulation"}
    ]
    content, selected = send_chat("/topics", "make them intermediate level", history=history)
    assert any(k in content.lower() for k in ["intermediate", "topics", "should"])

def test_9_cross_page_context():
    content_dash, _ = send_chat("/dashboard", "give me some debate topics")
    content_top, _ = send_chat("/topics", "give me some debate topics")
    assert "should" in content_dash.lower() or "topics" in content_dash.lower()
    assert "should" in content_top.lower() or "topics" in content_top.lower()

def test_10_profile_data_not_overriding_user_intent():
    content, _ = send_chat("/topics", "can u give me some debate topics")
    assert "Your current average debate score is" not in content[:60]

def test_11_no_raw_json():
    content, _ = send_chat("/topics", "suggest debate topics")
    assert not content.strip().startswith("[{") and not content.strip().startswith("{")

def test_12_authenticated_context():
    content, _ = send_chat("/dashboard", "what should I practice today?", user_id=1)
    assert len(content) > 20

def test_13_unauthenticated_context():
    content, selected = send_chat("/login", "what is this platform?", user_id=None)
    assert "welcome" in content.lower() or "platform" in content.lower()
    assert "General Debate Coach" in selected

def test_14_logout_state():
    content, selected = send_chat("/login", "how does AI analysis work?", user_id=None)
    assert "debate" in content.lower() or "analysis" in content.lower()

def test_15_ai_simulation_context():
    content, selected = send_chat("/ai-simulation", "what should I do here?")
    assert len(content) > 20

def test_16_debate_room_context():
    content, selected = send_chat("/debate-room/1", "what can my opponent say?")
    assert any(k in content.lower() for k in ["opponent", "counterargument", "rebuttal"])

def test_17_ai_analysis_report_context():
    content, selected = send_chat("/ai-analysis-report", "explain my latest report")
    assert len(content) > 20
