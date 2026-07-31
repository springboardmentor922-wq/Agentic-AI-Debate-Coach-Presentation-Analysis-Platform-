from core.gemini_client import generate_response

prompt = "Say hello in one sentence."

response = generate_response(prompt)

print(response)