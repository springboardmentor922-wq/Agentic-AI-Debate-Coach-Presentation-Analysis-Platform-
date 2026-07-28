from ..services.llm_service import generate_json


def generate_counterargument(argument: str):

    prompt = f"""
You are an experienced debate opponent.

Generate a strong counterargument.

Return ONLY JSON.

{{
    "counterargument": "",
    "supporting_points": [
        "",
        "",
        ""
    ]
}}

Argument:
{argument}
"""

    return generate_json(prompt)