import unittest

from app.services.presentation_service import analyze_presentation


class PresentationAnalysisTests(unittest.TestCase):
    def test_analysis_returns_bounded_scores_and_metrics(self):
        report = analyze_presentation(
            "First, renewable energy reduces emissions. However, policy must support "
            "reliable storage. In conclusion, communities should invest now.",
            duration_seconds=45,
        )

        self.assertEqual(report["word_count"], 17)
        self.assertGreaterEqual(report["overall_score"], 0)
        self.assertLessEqual(report["overall_score"], 10)
        self.assertEqual(set(report["metrics"]), {"clarity", "structure", "pacing", "confidence"})
        self.assertEqual(report["words_per_minute"], 22.7)

    def test_filler_words_produce_actionable_suggestion(self):
        report = analyze_presentation(
            "Um, I think that, like, this plan is useful because it helps students learn better."
        )

        self.assertGreaterEqual(report["filler_word_count"], 2)
        self.assertTrue(any("filler" in suggestion.lower() for suggestion in report["suggestions"]))


if __name__ == "__main__":
    unittest.main()
