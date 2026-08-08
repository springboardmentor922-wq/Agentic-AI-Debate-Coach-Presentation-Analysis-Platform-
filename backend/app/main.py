import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.db import Base, engine, SessionLocal
from backend.app.routers import auth, debate, presentation, coaching, notifications

from sqlalchemy import text

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed default topics if none exist
from backend.app.models.models import DebateTopic
db = SessionLocal()
try:
    if db.query(DebateTopic).filter(DebateTopic.is_predefined == True).count() == 0:
        default_topics = [
            "Artificial Intelligence will replace human artists",
            "Social media platforms do more harm than good",
            "Universal Basic Income should be implemented globally",
            "Climate change requires mandatory carbon tax systems",
            "Cryptocurrency will replace traditional banking systems"
        ]
        for t in default_topics:
            db.add(DebateTopic(title=t, is_predefined=True))
        db.commit()
except Exception as e:
    print("Failed to seed default topics:", e)
finally:
    db.close()

# Self-healing SQLite migration to add new columns if missing
with engine.connect() as conn:
    # 1. Update debate_sessions
    result = conn.execute(text("PRAGMA table_info(debate_sessions)"))
    columns = [row[1] for row in result.fetchall()]
    if "provider" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN provider VARCHAR DEFAULT 'Local Simulation Engine'"))
        conn.commit()
    if "score" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN score FLOAT"))
        conn.commit()
    if "is_challenge" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN is_challenge BOOLEAN DEFAULT 0"))
        conn.commit()
    if "deadline" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN deadline DATETIME"))
        conn.commit()
    if "challenge_type" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN challenge_type VARCHAR"))
        conn.commit()
    if "position_role" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN position_role VARCHAR DEFAULT 'Pro'"))
        conn.commit()
    if "scheduled_at" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN scheduled_at DATETIME"))
        conn.commit()
    if "duration_minutes" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN duration_minutes INTEGER DEFAULT 30"))
        conn.commit()
    if "current_round" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN current_round INTEGER DEFAULT 1"))
        conn.commit()
    if "round_structure" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN round_structure VARCHAR DEFAULT 'Standard'"))
        conn.commit()
    if "recording_enabled" not in columns:
        conn.execute(text("ALTER TABLE debate_sessions ADD COLUMN recording_enabled BOOLEAN DEFAULT 1"))
        conn.commit()

    # 2. Update debate_topics
    result = conn.execute(text("PRAGMA table_info(debate_topics)"))
    columns = [row[1] for row in result.fetchall()]
    if "category" not in columns:
        conn.execute(text("ALTER TABLE debate_topics ADD COLUMN category VARCHAR DEFAULT 'General'"))
        conn.commit()
    if "description" not in columns:
        conn.execute(text("ALTER TABLE debate_topics ADD COLUMN description TEXT"))
        conn.commit()
    if "target_format" not in columns:
        conn.execute(text("ALTER TABLE debate_topics ADD COLUMN target_format VARCHAR DEFAULT 'One-on-One Debate'"))
        conn.commit()
    if "difficulty" not in columns:
        conn.execute(text("ALTER TABLE debate_topics ADD COLUMN difficulty VARCHAR DEFAULT 'Intermediate'"))
        conn.commit()
    if "tags" not in columns:
        conn.execute(text("ALTER TABLE debate_topics ADD COLUMN tags JSON"))
        conn.commit()

    # 3. Update speech_analyses
    result = conn.execute(text("PRAGMA table_info(speech_analyses)"))
    columns = [row[1] for row in result.fetchall()]
    if "audience_engagement_score" not in columns:
        conn.execute(text("ALTER TABLE speech_analyses ADD COLUMN audience_engagement_score FLOAT DEFAULT 0.0"))
        conn.commit()

    # 4. Update users to add coach_id and educator_id
    result = conn.execute(text("PRAGMA table_info(users)"))
    columns = [row[1] for row in result.fetchall()]
    if "coach_id" not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
        conn.commit()
    if "educator_id" not in columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN educator_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
        conn.commit()

    # 5. Update profiles to add current_streak and last_active_date
    result = conn.execute(text("PRAGMA table_info(profiles)"))
    columns = [row[1] for row in result.fetchall()]
    if "current_streak" not in columns:
        conn.execute(text("ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 1"))
        conn.commit()
    if "last_active_date" not in columns:
        conn.execute(text("ALTER TABLE profiles ADD COLUMN last_active_date DATETIME"))
        conn.commit()

app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis API",
    description="Backend AI reasoning engine and analytics processor for speech training and debate simulation.",
    version="1.0.0"
)

# Set up CORS for frontend integration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # default Vite port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # Fallback wildcard for docker deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(debate.router, prefix="/api")
app.include_router(presentation.router, prefix="/api")
app.include_router(coaching.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "service": "Agentic AI Debate Coach & Presentation Analysis System API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
