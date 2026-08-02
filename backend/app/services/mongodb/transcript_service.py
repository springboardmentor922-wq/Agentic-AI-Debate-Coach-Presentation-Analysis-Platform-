from datetime import datetime

from app.database.mongodb import get_mongo


class TranscriptService:

    def __init__(self):
        self.db = get_mongo()
        self.collection = self.db["debate_transcripts"]

    async def add_message(
        self,
        session_id: int,
        user_id: int,
        speaker: str,
        message: str,
        topic: str
    ):
        print("===== SAVING TO MONGODB =====")
        print(f"Session: {session_id}, Speaker: {speaker}")

        result = await self.collection.insert_one(
            {
                "session_id": session_id,
                "user_id": user_id,
                "speaker": speaker,
                "topic": topic,
                "message": message,
                "timestamp": datetime.utcnow()
            }
        )

        print("Inserted ID:", result.inserted_id)

    async def get_history(
        self,
        session_id: int,
        limit: int = 20
    ):
        cursor = (
            self.collection
            .find({"session_id": session_id})
            .sort("timestamp", 1)
            .limit(limit)
        )

        history = []

        async for doc in cursor:
            history.append(
                {
                    "speaker": doc["speaker"],
                    "message": doc["message"]
                }
            )

        return history