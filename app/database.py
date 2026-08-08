import os
import psycopg2
from motor.motor_asyncio import AsyncIOMotorClient

# Fallback string URIs if environment variables aren't initialized yet
POSTGRES_URI = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/debate_db")
MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Connects to PostgreSQL for fast numerical dashboards
def get_postgres_connection():
    return psycopg2.connect(POSTGRES_URI)

# Connects to MongoDB for storing long-text transcripts and conversational history
mongo_client = AsyncIOMotorClient(MONGO_URI)
db_mongo = mongo_client["debate_platform_database"]

def init_db():
    """Initializes PostgreSQL table for performance metrics if it doesn't exist."""
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS debate_performance (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                wpm INTEGER NOT NULL,
                pace_status VARCHAR(50) NOT NULL,
                fallacy_found BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("PostgreSQL table 'debate_performance' initialized successfully.")
    except Exception as e:
        print(f"[Warning] PostgreSQL connection/initialization skipped: {e}")
