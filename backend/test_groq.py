import os
from dotenv import load_dotenv
load_dotenv()
import requests

def test_groq():
    prompt = "Test"
    print("KEY:", os.environ.get("GROQ_API_KEY", "")[:10] + "...")
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama3-8b-8192",
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    print(response.text)

if __name__ == "__main__":
    test_groq()
