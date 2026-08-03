from app.services.ai.gemini_service import GeminiService


class PresentationEngine:

    def __init__(self):
        self.gemini = GeminiService()

    async def analyze(self, transcript: str):
        prompt = f"""
You are an AI Presentation Coach.

Analyze the presentation transcript.

Evaluate:

- clarity
- confidence
- speaking speed
- filler words
- body language (estimate from transcript)
- audience engagement
- strengths
- weaknesses
- overall coaching feedback

Transcript:

{transcript}

Return ONLY JSON.

{{
"clarity":90,
"confidence":84,
"speaking_speed":"Good",
"filler_words":["um"],
"strengths":["..."],
"weaknesses":["..."],
"feedback":"...",
"overall_score":86
}}
"""

        return await self.gemini.generate_json(prompt)