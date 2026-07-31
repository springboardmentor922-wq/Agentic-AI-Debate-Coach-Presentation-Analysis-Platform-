import os
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def debate_chat(topic, message):

    prompt = f"""
You are an expert AI Debate Coach. The user is interacting with you in a chat interface. 

User's Request: "{message}"
Current Topic Context: "{topic}"

INSTRUCTIONS:
1. First, identify what the user is doing.
2. If the user asks for debate topics, ONLY provide a list of 3-4 interesting debate topics. Do NOT give counter-arguments.
3. If the user asks a question about tips, strategies, or help, provide a helpful answer as a coach.
4. If the user makes a direct statement, opinion, or factual claim, TREAT IT AS A DEBATE ARGUMENT. Immediately act as an AI Opponent and provide a strong counter-argument against their statement.

Rules:
- Be highly efficient and concise. Provide direct, point-by-point bulleted responses.
- Keep the response under 150 words.
- Do not use markdown headers.
- Answer their specific request directly without unnecessary introductory fluff.
"""
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "temperature": 0.9,
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print("GROQ CHATBOT ERROR:", str(e))
        return "I'm having trouble connecting to my knowledge base right now. Could you please try again?"