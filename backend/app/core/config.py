"""
=========================================================
Project Configuration

Loads environment variables from .env

Used by:
- Database
- JWT Authentication
- OAuth2
- Future AI Modules
=========================================================
"""

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

class Settings:
    """
    Central configuration class.
    """

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agentic_ai_debate_coach.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")

    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    )

    # AI / LLM Configuration

    OLLAMA_MODEL: str = os.getenv(
        "OLLAMA_MODEL",
        "llama3.1:8b"
    )

    OLLAMA_BASE_URL: str = os.getenv(
        "OLLAMA_BASE_URL",
        "http://localhost:11434"
    )

    LLM_TEMPERATURE: float = float(
        os.getenv("LLM_TEMPERATURE", 0.3)
    )

    LLM_MAX_TOKENS: int = int(
        os.getenv("LLM_MAX_TOKENS", 1024)
    )

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq").lower()

    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "agentic_ai_debate_coach")
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/faiss")

# Create a global settings object
settings = Settings()


