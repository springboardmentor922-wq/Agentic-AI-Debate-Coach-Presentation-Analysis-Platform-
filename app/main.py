import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from app.schemas import DebateTurnResponseSchema
from app.engine import MultiAgentDebateEngine
from app.database import get_postgres_connection, db_mongo, init_db

app = FastAPI(
    title="Debate Coaching Engine - Milestone 2 Backend",
    description="Logical Fallacy Detection, Speech Pacing, and Counterargument Generation API"
)
engine = MultiAgentDebateEngine()

@app.on_event("startup")
def startup_event():
    # Initialize the PostgreSQL schema on startup
    init_db()

async def execute_turn_processing(audio_path: str, session_id: str, debate_format: str, duration: Optional[float] = None) -> DebateTurnResponseSchema:
    # 1. Fetch dialogue history from MongoDB to support stateful multi-turn debate simulation
    history = []
    try:
        cursor = db_mongo.session_transcripts.find({"session_id": session_id}).sort("timestamp", 1)
        async for doc in cursor:
            # Reconstruct transcript history
            if doc.get("transcript"):
                history.append({"speaker": "User", "text": doc.get("transcript")})
            if doc.get("rebuttal"):
                history.append({"speaker": "AI", "text": doc.get("rebuttal")})
    except Exception as e:
        print(f"[Warning] Could not load chat history from MongoDB: {e}")

    # 2. Call the orchestrator engine
    result = await engine.process_turn(
        audio_path=audio_path,
        duration_sec=duration or 0.0,
        debate_format=debate_format,
        history=history
    )
    
    # 3. Write Step A: Log full dialogue document to MongoDB session_transcripts
    try:
        await db_mongo.session_transcripts.insert_one({
            "session_id": session_id,
            "transcript": result["user_transcript"],
            "rebuttal": result["ai_rebuttal"],
            "timestamp": datetime.datetime.utcnow()
        })
        print("Logged dialogue entry to MongoDB session_transcripts collection.")
    except Exception as e:
        print(f"[Warning] Failed to write log to MongoDB: {e}")
        
    # 4. Write Step B: Log scoring statistics directly to PostgreSQL debate_performance
    try:
        pg_conn = get_postgres_connection()
        cursor = pg_conn.cursor()
        cursor.execute(
            "INSERT INTO debate_performance (session_id, wpm, pace_status, fallacy_found) VALUES (%s, %s, %s, %s);",
            (session_id, result["wpm"], result["pace"], result["logic_data"]["fallacy_detected"])
        )
        pg_conn.commit()
        cursor.close()
        pg_conn.close()
        print("Logged performance metrics to PostgreSQL debate_performance table.")
    except Exception as e:
        print(f"[Warning] Failed to log performance metrics to PostgreSQL: {e}")
        
    return DebateTurnResponseSchema(
        user_transcript=result["user_transcript"],
        ai_rebuttal=result["ai_rebuttal"],
        words_per_minute=result["wpm"],
        pace_status=result["pace"],
        fallacy_metrics=result["logic_data"]
    )

@app.post("/api/v1/debate/process-turn", response_model=DebateTurnResponseSchema)
async def process_debate_turn_endpoint(
    audio_path: str = Query(..., description="Absolute file path to the user speech audio file"),
    session_id: str = Query(..., description="Unique debate session identifier"),
    debate_format: str = Query(..., description="Selected format, e.g. 'Oxford Debate', 'Parliamentary Debate'"),
    duration: Optional[float] = Query(None, description="Optional pre-extracted audio duration in seconds")
):
    """Processes a user audio argument, calculates pacing, runs fallacy detection, and returns the AI rebuttal."""
    return await execute_turn_processing(audio_path, session_id, debate_format, duration)

@app.post("/api/v1/debate/turn", response_model=DebateTurnResponseSchema)
async def process_debate_turn_legacy(
    audio_path: str,
    duration: float,
    debate_format: str,
    session_id: str
):
    """Legacy backward-compatible debate turn processor endpoint."""
    return await execute_turn_processing(audio_path, session_id, debate_format, duration)
