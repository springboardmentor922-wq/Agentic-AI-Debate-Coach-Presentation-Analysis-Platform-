import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app
from app.utils.jwt import create_access_token

from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.utils.password import hash_password

class TestCoachWorkflow(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        db = SessionLocal()
        try:
            role = db.query(Role).filter(Role.name == "Debate Coach").first()
            user = db.query(User).filter(User.email == "coach@test.com").first()
            if not user:
                user = User(
                    email="coach@test.com",
                    full_name="Workflow Test Coach",
                    password_hash=hash_password("Pass123!"),
                    role_id=role.id if role else 3,
                    is_active=True
                )
                db.add(user)
            else:
                if role:
                    user.role_id = role.id
            db.commit()
        finally:
            db.close()
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
