"""Deterministic weighted debate performance scoring."""
from app.ai.schemas.milestone3_schema import JudgeCategoryScores, PerformanceScore

class PerformanceScoringEngine:
    WEIGHTS = {
        "argument_quality": 0.30, "evidence_usage": 0.20,
        "logical_consistency": 0.20, "rebuttal_effectiveness": 0.15,
        "communication_skills": 0.15,
    }

    @classmethod
    def calculate(cls, categories: JudgeCategoryScores) -> PerformanceScore:
        overall = sum(getattr(categories, name) * weight for name, weight in cls.WEIGHTS.items())
        return PerformanceScore(categories=categories, overall_score=round(overall, 2))
