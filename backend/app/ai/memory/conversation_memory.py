"""Mongo-backed compact debate memory; only three raw turns are returned to agents."""
from datetime import datetime, timezone
from app.mongodb.database import mongodb

class ConversationMemory:
    def load(self, session_id: int) -> dict:
        document = mongodb.conversation_memory_collection.find_one({"session_id": session_id}) or {}
        return {"recent_turns": document.get("recent_turns", [])[-3:], "summary": document.get("summary", ""), "previous_scores": document.get("previous_scores", [])[-5:]}

    def save(self, session_id: int, turn: dict, summary: str, score: float | None) -> None:
        current = self.load(session_id)
        turns = (current["recent_turns"] + [turn])[-3:]
        scores = (current["previous_scores"] + ([score] if score is not None else []))[-5:]
        mongodb.conversation_memory_collection.update_one({"session_id": session_id}, {"$set": {"recent_turns": turns, "summary": summary, "previous_scores": scores, "updated_at": datetime.now(timezone.utc)}}, upsert=True)

conversation_memory = ConversationMemory()
