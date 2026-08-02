from sqlalchemy.orm import Session

from app.models.session import DebateSession
from app.services.mongodb.transcript_service import TranscriptService


class DashboardService:

    def __init__(self):
        self.transcript_service = TranscriptService()

    async def get_dashboard(self, db: Session):

        sessions = db.query(DebateSession).all()

        total_sessions = len(sessions)

        active_sessions = sum(
            1 for s in sessions
            if s.status.lower() == "active"
        )

        completed_sessions = sum(
            1 for s in sessions
            if s.status.lower() == "completed"
        )

        durations = [s.duration for s in sessions if s.duration]

        average_duration = (
            sum(durations) / len(durations)
            if durations
            else 0
        )

        total_messages = 0

        for session in sessions:
            history = await self.transcript_service.get_history(session.id)
            total_messages += len(history)

        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "active_sessions": active_sessions,
            "completed_sessions": completed_sessions,
            "average_duration": average_duration
        }