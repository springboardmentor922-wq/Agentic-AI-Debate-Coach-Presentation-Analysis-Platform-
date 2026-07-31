import json
from sqlalchemy.orm import Session

from models.debate_history import DebateHistory


class HistoryService:

    def save_debate(
        self,
        db: Session,
        user_id: int,
        topic: str,
        debate_format: str,
        experience_level: str,
        user_argument: str,
        ai_response: str,
        fallacy_report: str,
        argument_score: dict,
        coaching_feedback: dict
    ):

        debate = DebateHistory(
            user_id=user_id,
            topic=topic,
            debate_format=debate_format,
            experience_level=experience_level,
            user_argument=user_argument,
            ai_response=ai_response,
            fallacy_report=fallacy_report,
            argument_score=json.dumps(argument_score),
            coaching_feedback=json.dumps(coaching_feedback)
    )

        db.add(debate)
        db.commit()
        db.refresh(debate)

        return debate
    def get_history(self, db: Session):
        return db.query(DebateHistory).order_by(
            DebateHistory.created_at.desc()
        ).all()
    def get_debate_by_id(self, db: Session, debate_id: int):
        return (
            db.query(DebateHistory)
            .filter(DebateHistory.id == debate_id)
            .first()
        )