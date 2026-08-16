from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

try:
    response = client.models.generate_content(
        model="models/gemini-3.5-flash",
        contents="Say hello in one sentence."
    )

    print(response.text)

except Exception as e:
    print(type(e).__name__)
    print(e)