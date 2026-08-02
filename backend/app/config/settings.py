from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# MongoDB
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://localhost:27017"
)

MONGO_DATABASE = os.getenv(
    "MONGO_DATABASE",
    "debate_platform"
)
GEMINI_MODEL = os.getenv("GEMINI_MODEL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
