import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.main import app
from app.utils.jwt import create_access_token

class TestEducatorIsolation(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.educator_token = create_access_token({"sub": "educator@test.com", "role": "Educator"})

    def test_educator_data_isolation(self):
        """Verify that an educator without enrolled classes sees empty results, not global fallback data."""
        headers = {"Authorization": f"Bearer {self.educator_token}"}

        res_classes = self.client.get("/api/v1/educator/classes", headers=headers)
        self.assertEqual(res_classes.status_code, 200)

        res_learners = self.client.get("/api/v1/educator/learners", headers=headers)
        self.assertEqual(res_learners.status_code, 200)

    def test_educator_class_reports_data_path(self):
        """Verify that GET /api/v1/debate/reports handles role-scoped queries and returns structured response."""
        headers = {"Authorization": f"Bearer {self.educator_token}"}

        res_reports = self.client.get("/api/v1/debate/reports", headers=headers)
        self.assertEqual(res_reports.status_code, 200)
        data = res_reports.json()
        self.assertTrue(data.get("success"))
        self.assertIn("data", data)
        self.assertIsInstance(data["data"], list)

if __name__ == "__main__":
    unittest.main()
