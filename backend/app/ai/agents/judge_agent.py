from app.ai.schemas.milestone3_schema import JudgeCategoryScores

class JudgeAgent:
    """Deterministic judge: only coaching language is generative, never scores."""
    def evaluate(self, **kwargs) -> JudgeCategoryScores:
        analysis = kwargs["argument_analysis"]
        fallacies = kwargs["fallacies"]
        criteria = analysis.get("evaluation_criteria", {})
        scoring = analysis.get("argument_scoring", {})
        detected = fallacies.get("detected_fallacies", [])
        credibility = fallacies.get("credibility_assessment", {}).get("credibility_score", 50)
        argument_quality = float(scoring.get("overall_score", 0))
        evidence_usage = round((float(criteria.get("evidence_strength", 1)) * 10 + float(credibility)) / 2, 2)
        logical_consistency = max(0.0, round(float(criteria.get("logical_consistency", 1)) * 10 - min(len(detected) * 8, 32), 2))
        rebuttal_effectiveness = min(100.0, 45.0 + min(len(kwargs["counterargument"].get("challenge_questions", [])) * 8, 24) + min(len(kwargs["counterargument"].get("evidence_sources", [])) * 10, 30))
        communication_skills = round((float(criteria.get("clarity", 1)) + float(criteria.get("relevance", 1)) + float(criteria.get("persuasiveness", 1))) * 10 / 3, 2)
        return JudgeCategoryScores(
            argument_quality=round(argument_quality, 2), evidence_usage=evidence_usage,
            logical_consistency=logical_consistency, rebuttal_effectiveness=round(rebuttal_effectiveness, 2),
            communication_skills=communication_skills,
            rationale=["Category scores are derived deterministically from the validated argument analysis and fallacy results.", f"{len(detected)} detected fallacy/fallacies reduced logical consistency."],
        )
