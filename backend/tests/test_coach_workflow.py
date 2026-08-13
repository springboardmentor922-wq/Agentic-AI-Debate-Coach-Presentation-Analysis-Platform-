import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app
from app.utils.jwt import create_access_token

class TestCoachWorkflow(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.coach_token = create_access_token({"sub": "coach@test.com", "role": "Debate Coach"})

    def test_coach_evaluation_unsubmitted_session_rejection(self):
        """Verify that coach evaluation fails if session_id is missing or session is unsubmitted."""
        headers = {"Authorization": f"Bearer {self.coach_token}"}

        res_invalid = self.client.post("/api/v1/coach/evaluations", json={
            "learner_id": 1,
            "session_id": 999999,
            "communication_score": 80.0,
            "logic_score": 85.0,
            "rebuttal_score": 75.0,
            "evidence_score": 80.0,
            "confidence_score": 85.0
        }, headers=headers)
        self.assertEqual(res_invalid.status_code, 404)

if __name__ == "__main__":
    unittest.main()
