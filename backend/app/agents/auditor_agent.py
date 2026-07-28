from ..services.llm_service import generate_json


def analyze_argument(text: str):

    prompt = f"""
You are an expert AI Debate Coach.

Analyze the following argument.

Return ONLY valid JSON.

{{
    "fallacy_detected": true,
    "fallacy_type": "",
    "offending_text": "",
    "explanation": "",
    "correction_suggestion": ""
}}

Argument:
{text}
"""

    return generate_json(prompt)