from app.services.gemini_service import evaluate_debate

response = evaluate_debate(
    "Should AI replace teachers?",
    "AI can personalize learning for every student."
)

print(response)