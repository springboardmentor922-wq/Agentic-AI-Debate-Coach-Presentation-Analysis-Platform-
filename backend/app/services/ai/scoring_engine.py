from app.schemas.argument_analysis import ArgumentAnalysis


class ScoringEngine:

    def score(self, analysis: ArgumentAnalysis):

        score = 100

        score -= len(analysis.weaknesses) * 10

        if len(analysis.strengths) >= 3:
            score += 5

        score = max(0, min(score, 100))

        return {
            "score": score,
            "grade": self.get_grade(score)
        }

    def get_grade(self, score: int):

        if score >= 90:
            return "Excellent"

        if score >= 75:
            return "Good"

        if score >= 60:
            return "Average"

        if score >= 40:
            return "Weak"

        return "Poor"