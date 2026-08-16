from ..services.llm_service import generate_json


def analyze_argument(text: str):

    prompt = f"""
You are an expert AI Debate Coach and logic auditor. Analyze the following
argument carefully. Mark a fallacy only when the learner's own wording gives
enough evidence for it; do not label a normal disagreement or an unsupported
claim as a named fallacy. If no fallacy is clearly present, return false,
"No clear fallacy", and explain the strongest remaining improvement.

Return ONLY valid JSON.

{{
    "fallacy_detected": false,
    "fallacy_type": "",
    "offending_text": "",
    "explanation": "",
    "correction_suggestion": ""
}}

Argument:
{text}
"""

    return generate_json(prompt)
