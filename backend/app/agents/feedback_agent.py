from ..services.llm_service import generate_json


def generate_feedback(argument: str):

    prompt = f"""
You are an expert debate coach.

Evaluate the argument.

Return ONLY JSON.

{{
    "clarity_score": 0,
    "logic_score": 0,
    "persuasiveness_score": 0,
    "grammar_score": 0,
    "feedback": [
        "",
        "",
        ""
    ]
}}

Argument:
{argument}
"""

    return generate_json(prompt)