import json

from app.services.gemini_service import client
from app.services.local_ai_service import local_evaluate


def ai_debate(topic, user_position, user_argument):

    ai_position = "Against" if user_position == "For" else "For"

    prompt = f"""
You are an international debate champion.

Debate Topic:
{topic}

Student Position:
{user_position}

Student Argument:
{user_argument}

Your Position:
{ai_position}

Reply as the opponent.

Rules:

- Reply only in plain text.
- Do NOT use markdown.
- Do NOT use **.
- Do NOT use headings.
- Do NOT use bullet points.
- Do NOT use emojis.
- Reply in 120-180 words.
- Give exactly 3 logical counterarguments.
- Refute the student's points respectfully.
- Return ONLY JSON.

{{
    "ai_position":"{ai_position}",
    "ai_response":"..."
}}
"""

    try:

        print("\n===== AI DEBATE USING GEMINI =====")

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        text = response.text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

    except Exception as e:

        print("\n===== GEMINI FAILED =====")
        print(e)

        print("\n===== USING LOCAL AI =====")

        return {

            "ai_position": ai_position,

            "ai_response": (
                f"As the {ai_position} side, I respectfully disagree. "
                "Your argument makes valid points, but it lacks sufficient evidence. "
                "There are several real-world examples that support the opposite position. "
                "Consider addressing those counterpoints to strengthen your debate."
            )

        }