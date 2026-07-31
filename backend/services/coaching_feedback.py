import json
from core.gemini_client import generate_response


class CoachingFeedback:

    def generate(self, topic: str, argument: str):

        prompt = f"""
You are an expert AI Debate Coach.

Topic:
{topic}

User Argument:
{argument}

Analyze the user's argument and provide constructive coaching feedback.

Return ONLY valid JSON in exactly this format:

{{
    "strengths": [
        "",
        ""
    ],
    "areas_to_improve": [
        "",
        ""
    ],
    "next_challenge": "",
    "speaking_tips": [
        "",
        "",
        "",
        ""
    ]
}}

Rules:
- Give exactly 2 strengths.
- Give exactly 2 areas_to_improve.
- Give exactly 1 next_challenge.
- Give exactly 4 speaking_tips.
- Speaking tips should improve confidence, body language, voice modulation, eye contact and presentation.
- Do NOT omit any field.
- Do NOT use markdown.
- Return ONLY valid JSON.
"""

        response = generate_response(prompt)

        try:
            data = json.loads(response)

            data.setdefault("strengths", [
                "Clear position",
                "Relevant argument"
            ])

            data.setdefault("areas_to_improve", [
                "Add supporting evidence",
                "Address counterarguments"
            ])

            data.setdefault(
                "next_challenge",
                "Should online education replace traditional classrooms?"
            )

            # Always ensure speaking_tips exists
            if (
                "speaking_tips" not in data
                or not isinstance(data["speaking_tips"], list)
                or len(data["speaking_tips"]) == 0
            ):
                data["speaking_tips"] = [
                    "Maintain eye contact with your audience.",
                    "Speak slowly and clearly.",
                    "Support your claims with facts and examples.",
                    "Avoid absolute words like 'always' and 'never'."
                ]

            return json.dumps(data)

        except Exception:
            return json.dumps({
                "strengths": [
                    "Clear position",
                    "Relevant argument"
                ],
                "areas_to_improve": [
                    "Add supporting evidence",
                    "Address counterarguments"
                ],
                "next_challenge":
                    "Should online education replace traditional classrooms?",
                "speaking_tips": [
                    "Maintain eye contact with your audience.",
                    "Speak slowly and clearly.",
                    "Support your claims with facts and examples.",
                    "Avoid absolute words like 'always' and 'never'."
                ]
            })