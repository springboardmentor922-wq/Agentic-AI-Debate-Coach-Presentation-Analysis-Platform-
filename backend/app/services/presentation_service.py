import json

from app.services.gemini_service import client


def analyze_presentation(presentation: str):

    prompt = f"""
You are an expert public speaking and presentation coach.

Analyze the student's presentation.

Return ONLY valid JSON.

The JSON must contain exactly these keys:

{{
    "clarity": 0,
    "confidence": 0,
    "communication": 0,
    "structure": 0,
    "overall": 0,
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
}}

Rules:

1. clarity must be a score from 0 to 10.

2. confidence must be a score from 0 to 10.

3. communication must be a score from 0 to 10.

4. structure must be a score from 0 to 10.

5. overall must be a score from 0 to 10.

6. strengths must be a list of short points.

7. weaknesses must be a list of short points.

8. suggestions must be a list of practical improvement suggestions.

9. Do not use markdown.

10. Do not use emojis.

11. Return JSON only.

Student Presentation:

{presentation}
"""

    try:

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        text = response.text.strip()

        if text.startswith("```json"):

            text = (
                text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        elif text.startswith("```"):

            text = (
                text
                .replace("```", "")
                .strip()
            )

        return json.loads(text)

    except Exception as e:

        print("===== PRESENTATION AI FAILED =====")
        print(e)

        return {
            "clarity": 5,
            "confidence": 5,
            "communication": 5,
            "structure": 5,
            "overall": 5,
            "strengths": [
                "The presentation contains a clear attempt to communicate the topic."
            ],
            "weaknesses": [
                "The presentation can be improved with stronger structure and supporting details."
            ],
            "suggestions": [
                "Organize the presentation into an introduction, main points and conclusion.",
                "Use clear examples to support important points.",
                "Practice speaking with confidence and clarity."
            ]
        }