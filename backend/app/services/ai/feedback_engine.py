from app.schemas.argument_analysis import ArgumentAnalysis


class FeedbackEngine:

    def generate(self, analysis: ArgumentAnalysis, score: dict):

        return {
            "summary": analysis.overall_analysis,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "score": score["score"],
            "grade": score["grade"]
        }