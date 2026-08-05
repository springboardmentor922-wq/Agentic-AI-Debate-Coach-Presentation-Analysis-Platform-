from app.services.ai.gemini_service import GeminiService


class PresentationEngine:

    def __init__(self):
        self.gemini = GeminiService()

    async def analyze(self, transcript: str):

        prompt = f"""
You are an expert AI Presentation Coach.

Analyze the presentation transcript.

Evaluate:

- Clarity (0-100)
- Confidence (0-100)
- Speaking Speed
- Filler Words
- Audience Engagement
- Strengths
- Weaknesses
- Coaching Feedback
- Overall Score

Transcript:

{transcript}

Return ONLY valid JSON.

{{
"clarity":90,
"confidence":86,
"speaking_speed":"Good",
"filler_words":["um","uh"],
"strengths":["Clear structure","Good confidence"],
"weaknesses":["More evidence","Reduce filler words"],
"feedback":"Excellent presentation. Improve evidence and reduce filler words.",
"overall_score":88
}}
"""

        return await self.gemini.generate_json(prompt)