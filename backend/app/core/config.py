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
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY")

    ALGORITHM: str = os.getenv("ALGORITHM")

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


# Create a global settings object
settings = Settings()


