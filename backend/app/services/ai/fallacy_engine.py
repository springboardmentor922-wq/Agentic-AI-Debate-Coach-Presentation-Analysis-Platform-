from app.services.ai.gemini_service import GeminiService


class FallacyEngine:

    def __init__(self):
        self.gemini = GeminiService()

    async def detect(self, argument: str):

        prompt = f"""
You are an expert in logical reasoning.

Analyze the following argument.

Argument:
{argument}

Identify:

1. Logical fallacies (if any)
2. Explain each fallacy.
3. Suggest how to improve the argument.

Return your answer in a clear bullet-point format.
"""

        return await self.gemini.generate(prompt)