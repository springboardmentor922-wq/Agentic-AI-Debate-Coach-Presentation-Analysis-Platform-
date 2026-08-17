import json

from app.services.gemini_service import client
from app.services.local_ai_service import local_evaluate


def analyze_argument(argument: str):

    prompt = f"""
You are an expert AI Debate Coach.

Analyze the student's argument.

Return ONLY valid JSON.

{{
    "claim":"",
    "supporting_points":[],
    "strengths":[],
    "weaknesses":[],
    "suggestions":[]
}}

Argument:

{argument}
"""

    try:

        print("===== USING GEMINI =====")

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        text = response.text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

    except Exception as e:

        print("===== GEMINI FAILED =====")
        print(e)

        print("===== USING LOCAL AI =====")

        local = local_evaluate("Argument Analysis", argument)

        return {

            "claim": argument,

            "supporting_points": [
                "Generated using Local AI fallback."
            ],

            "strengths": local["strengths"],

            "weaknesses": local["weaknesses"],

            "suggestions": local["coach_tips"]

        }