from ..services.llm_service import generate_json


def generate_feedback(argument: str):

    prompt = f"""
You are an expert debate coach and impartial evaluator. Evaluate only the
learner's reasoning in the supplied argument. Do not reward a position simply
because you agree with it, and do not invent evidence that is not present.

Score every category from 0 to 10 using this rubric:
- Clarity: a precise claim, clear structure, and understandable wording.
- Logic: valid reasoning, relevant reasons, and no unsupported leaps.
- Persuasiveness: relevant evidence/examples, explanation of impact, and a
  credible response to likely objections.
- Grammar: readable, professional language and sentence control.

Use 8-10 only when the argument gives specific, well-explained support. Use
5-7 for a reasonable argument with clear gaps. Use 0-4 when the argument is
mostly unsupported, unclear, or logically weak. Give exactly three concrete,
actionable suggestions that quote or refer to what is missing; never give
generic praise.

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
