import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.ai.scoring.scoring_engine import PerformanceScoringEngine
from app.ai.schemas.milestone3_schema import JudgeCategoryScores

class TestScoringEngine(unittest.TestCase):
    def test_deterministic_scoring_formula(self):
        """Verify that scoring engine applies 30-20-20-15-15 weighted breakdown correctly."""
        categories = JudgeCategoryScores(
            argument_quality=80.0,
            evidence_usage=90.0,
            logical_consistency=70.0,
            rebuttal_effectiveness=85.0,
            communication_skills=95.0
        )

        result = PerformanceScoringEngine.calculate(categories)

        expected_overall = round(
            (80.0 * 0.30) + (90.0 * 0.20) + (70.0 * 0.20) + (85.0 * 0.15) + (95.0 * 0.15),
            2
        )

        self.assertEqual(result.overall_score, expected_overall)
        self.assertEqual(result.categories.argument_quality, 80.0)
        self.assertEqual(result.categories.evidence_usage, 90.0)
        self.assertEqual(result.categories.logical_consistency, 70.0)
        self.assertEqual(result.categories.rebuttal_effectiveness, 85.0)
        self.assertEqual(result.categories.communication_skills, 95.0)

if __name__ == "__main__":
    unittest.main()
