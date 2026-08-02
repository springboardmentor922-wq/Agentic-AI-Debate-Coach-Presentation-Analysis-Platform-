from sqlalchemy.orm import Session

from app.models.session import DebateSession
from app.services.mongodb.transcript_service import TranscriptService


class StatisticsService:

    def __init__(self):
        self.transcript_service = TranscriptService()

    async def get_statistics(self, db: Session):

        sessions = db.query(DebateSession).all()

        total_sessions = len(sessions)

        completed_sessions = sum(
            1 for s in sessions
            if s.status.lower() == "completed"
        )

        active_sessions = sum(
            1 for s in sessions
            if s.status.lower() == "active"
        )

        total_messages = 0

        for session in sessions:
            history = await self.transcript_service.get_history(session.id)
            total_messages += len(history)

        average_messages = (
            total_messages / total_sessions
            if total_sessions
            else 0
        )

        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "active_sessions": active_sessions,
            "total_transcript_messages": total_messages,
            "average_messages_per_session": round(average_messages, 2)
        }