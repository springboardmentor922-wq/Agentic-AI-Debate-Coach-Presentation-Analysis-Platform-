from google import genai
from app.config.settings import GEMINI_API_KEY, GEMINI_MODEL


class GeminiService:

    def __init__(self):
        print("GeminiService initialized")
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    async def generate(self, prompt: str):

        print("=" * 60)
        print("Entered Gemini generate()")
        print("Model:", GEMINI_MODEL)

        try:
            response = self.client.models.generate_content(
               model="gemini-3.1-flash-lite",
                contents=prompt,
            )
            print("Gemini response received")
            print(response)

            return response.text

        except Exception as e:
            print("Gemini Exception:")
            print(type(e).__name__)
            print(e)
            raise