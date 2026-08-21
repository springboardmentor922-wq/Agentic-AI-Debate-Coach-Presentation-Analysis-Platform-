"""
LLM Configuration

Uses Groq LLM for the AI Debate Coach.
"""

from langchain_groq import ChatGroq

from app.core.config import settings


llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL,
    temperature=settings.LLM_TEMPERATURE,
)