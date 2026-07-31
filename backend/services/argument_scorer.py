import json
from core.gemini_client import generate_response


class ArgumentScorer:

    def score(self, topic: str, argument: str):

        prompt = f"""
You are an expert debate evaluator.

Topic:
{topic}

User Argument:
{argument}

Evaluate this argument.

Give each score from 0 to 100.

Return ONLY valid JSON.

{{
    "logic_score": 0,
    "clarity_score": 0,
    "evidence_score": 0,
    "persuasiveness_score": 0,
    "relevance_score": 0,
    "confidence_score": 0,
    "overall_score": 0
}}

Do not include explanations.
Do not use markdown.
Return only JSON.
"""

        response = generate_response(prompt)

        try:
            return json.dumps(json.loads(response))
        except Exception:
            return json.dumps({
                "logic_score": 70,
                "clarity_score": 70,
                "evidence_score": 70,
                "persuasiveness_score": 70,
                "relevance_score": 70,
                "confidence_score": 70,
                "overall_score": 70
            })