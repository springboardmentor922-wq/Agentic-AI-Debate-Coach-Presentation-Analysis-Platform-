import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User
from app.utils.jwt import create_access_token
from app.utils.password import hash_password

class TestAuthRBAC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db = SessionLocal()
        try:
            def _create_user(email, full_name, role_id):
                user = db.query(User).filter(User.email == email).first()
                if user:
                    user.role_id = role_id
                else:
                    user = User(
                        email=email,
                        full_name=full_name,
                        password_hash=hash_password("Pass123!"),
                        role_id=role_id,
                        is_active=True
                    )
                    db.add(user)
                db.commit()
                db.refresh(user)
                return user.email

            # Database Schema Mapping:
            # 1 = Administrator, 2 = Educator, 3 = Debate Coach, 4 = Learner
            cls.learner_email = _create_user("unique_learner_rbac_2026@test.com", "Unique Learner", 4)
            cls.coach_email = _create_user("unique_coach_rbac_2026@test.com", "Unique Coach", 3)
            cls.educator_email = _create_user("unique_educator_rbac_2026@test.com", "Unique Educator", 2)
            cls.admin_email = _create_user("unique_admin_rbac_2026@test.com", "Unique Admin", 1)
        finally:
            db.close()

    def setUp(self):
        self.client = TestClient(app)
        self.learner_token = create_access_token({"sub": self.learner_email, "role": "Learner"})
        self.coach_token = create_access_token({"sub": self.coach_email, "role": "Debate Coach"})
        self.admin_token = create_access_token({"sub": self.admin_email, "role": "Administrator"})

    def test_public_registration_roles(self):
        """Verify that public registration allows Learner, Debate Coach, Educator and rejects Administrator."""
        db = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == "registered_coach_test2026@test.com").first()
            if existing:
                db.delete(existing)
                db.commit()
        finally:
            db.close()

        res_admin = self.client.post("/auth/register", json={
            "full_name": "Attacker Admin",
            "email": "attackeradmin_unique4@test.com",
            "password": "Password123!",
            "role": "Administrator"
        })
        self.assertEqual(res_admin.status_code, 400)
        self.assertIn("Administrator accounts cannot be created via public registration", res_admin.json()["detail"])

        res_coach = self.client.post("/auth/register", json={
            "full_name": "New Coach User",
            "email": "registered_coach_test2026@test.com",
            "password": "Password123!",
            "role": "Debate Coach"
        })
        self.assertEqual(res_coach.status_code, 201)
        self.assertEqual(res_coach.json()["role"], "Debate Coach")

    def test_rbac_endpoint_protection(self):
        """Verify that role-based access control blocks unauthorized role access across endpoints."""
        learner_headers = {"Authorization": f"Bearer {self.learner_token}"}
        coach_headers = {"Authorization": f"Bearer {self.coach_token}"}
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

        res_l = self.client.get("/api/v1/admin/users", headers=learner_headers)
        self.assertEqual(res_l.status_code, 403)

        res_lc = self.client.get("/api/v1/coach/learners", headers=learner_headers)
        self.assertEqual(res_lc.status_code, 403)

        res_c = self.client.get("/api/v1/admin/users", headers=coach_headers)
        self.assertEqual(res_c.status_code, 403)

        res_a = self.client.get("/api/v1/admin/users", headers=admin_headers)
        self.assertEqual(res_a.status_code, 200)

if __name__ == "__main__":
    unittest.main()
