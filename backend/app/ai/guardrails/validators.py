"""Input and prompt guardrails for graph entry points."""
import re
from fastapi import HTTPException, status

INJECTION_PATTERNS = ("ignore previous instructions", "reveal system prompt", "jailbreak", "developer message")

def validate_debate_input(text: str) -> str:
    clean = text.strip()
    if len(clean) < 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Provide a substantive debate argument of at least 10 characters.")
    if len(clean) > 12000:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Debate input exceeds the 12,000-character limit.")
    lowered = clean.lower()
    if any(pattern in lowered for pattern in INJECTION_PATTERNS):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The submitted text contains unsupported instruction-like content.")
    if len(re.sub(r"[^A-Za-z]", "", clean)) < 5:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Please provide an on-topic debate statement.")
    return clean
