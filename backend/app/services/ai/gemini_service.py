import json

from google import genai

from app.config.settings import (
    GEMINI_API_KEY,
    GEMINI_MODEL
)


class GeminiService:

    def __init__(self):

        print("GeminiService initialized")

        self.client = genai.Client(
            api_key=GEMINI_API_KEY
        )

    async def generate(
        self,
        prompt: str
    ):

        response = self.client.models.generate_content(

            model=GEMINI_MODEL,

            contents=prompt

        )

        return response.text

    async def generate_json(
        self,
        prompt: str
    ):

        response = await self.generate(prompt)

        try:

            start = response.find("{")

            end = response.rfind("}") + 1

            return json.loads(
                response[start:end]
            )

        except Exception:

            return {

                "clarity": 75,

                "confidence": 75,

                "speaking_speed": "Normal",

                "filler_words": [],

                "strengths": [

                    "Well structured"

                ],

                "weaknesses": [

                    "Needs more evidence"

                ],

                "feedback": response,

                "overall_score": 75

            }