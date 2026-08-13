import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app

def run_tests():
    client = TestClient(app)
    print("=========================================")
    print("RUNNING EXTENDED CHATBOT ACCEPTANCE SUITE")
    print("=========================================\n")

    test_cases = [
        ("TEST 1: Unauthenticated Login Page", "/login", None, "What is this platform?"),
        ("TEST 2: Learner Dashboard Practice", "/learner/dashboard", 1, "What should I practice today?"),
        ("TEST 3: AI Simulation Counterarguments", "/ai-simulation", 1, "Suggest strong counterarguments for my opponent."),
        ("TEST 4: General Oxford Debate Question", "/topics", 1, "What is an Oxford debate?"),
        ("TEST 5: Unexpected Evidence Question", "/skills", 1, "Why is evidence more convincing than just giving opinions?"),
        ("TEST 6: Follow-up Opponent Objection", "/ai-simulation", 1, "What would my opponent say?"),
        ("TEST 7: Fallacy Check Intent", "/debate-room/1", 1, "Check my argument for logical fallacies."),
        ("TEST 8: Argument Strength Analysis", "/debate-room/1", 1, "Analyze the strength of my argument."),
        ("TEST 9: Topic Recommendation", "/topics", 1, "Suggest a debate topic."),
        ("TEST 10: AI Report Weakness Query", "/ai-analysis-report", 1, "What is my biggest weakness?"),
        ("TEST 11: Real-Time Route Switching", "/ai-simulation", 1, "What should I do here?"),
        ("TEST 12: Coach Data Isolation", "/coach/dashboard", 2, "Which learner needs attention?"),
        ("TEST 13: Educator Class Overview", "/educator/dashboard", 3, "Which students are struggling?"),
        ("TEST 14: Admin Platform Stats", "/admin/dashboard", 4, "Show platform statistics."),
    ]

    passed_count = 0

    for test_name, page, user_id, message in test_cases:
        payload = {
            "page": page,
            "user_id": user_id,
            "message": message,
            "conversation_history": [
                {"role": "user", "content": "Give me an argument for AI regulation."},
                {"role": "assistant", "content": "AI regulation ensures ethical safety, data privacy compliance, and mitigates systemic societal risks."}
            ] if "Follow-up" in test_name else []
        }
        res = client.post("/api/v1/chat", json=payload)
        assert res.status_code == 200, f"API call failed for {test_name}: {res.text}"

        body = res.json()
        assert body.get("success") is True, f"Response not successful for {test_name}"
        data = body.get("data", [])
        assert len(data) > 0, f"No agent outputs returned for {test_name}"

        output_content = data[0].get("content", "")

        # Mandatory checks
        assert not output_content.strip().startswith("[{"), f"FAIL {test_name}: Output is raw JSON array!"
        assert "analyzing your query based on current page context" not in output_content.lower(), f"FAIL {test_name}: Output contains generic placeholder!"
        assert len(output_content) > 20, f"FAIL {test_name}: Output too short!"

        # Disambiguation assertion for counterarguments
        if "Counterargument" in test_name:
            assert "recommend an ai simulation" not in output_content.lower(), f"FAIL {test_name}: Counterargument query returned generic topic recommendation!"
            assert any(word in output_content.lower() for word in ["counterargument", "rebuttal", "oppon", "objection", "negative"]), f"FAIL {test_name}: Response lacks counterarguments!"

        print(f"[PASS] {test_name}")
        clean_snippet = output_content[:120].replace('\n', ' ').encode('ascii', 'ignore').decode('ascii')
        print(f"   Sample Output Snippet: {clean_snippet}...\n")
        passed_count += 1

    print("=========================================")
    print(f"ALL {passed_count}/{len(test_cases)} EXTENDED CHATBOT TESTS PASSED SUCCESSFULLY!")
    print("=========================================")

if __name__ == "__main__":
    run_tests()
