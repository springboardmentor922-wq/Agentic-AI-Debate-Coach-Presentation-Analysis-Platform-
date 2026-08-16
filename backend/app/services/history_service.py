from sqlalchemy.orm import Session

from ..models.debate_analysis import DebateAnalysis


def get_all_history(db: Session):

    return db.query(DebateAnalysis)\
             .order_by(DebateAnalysis.created_at.desc())\
             .all()


def get_history_by_id(history_id: int, db: Session):

    return db.query(DebateAnalysis)\
             .filter(DebateAnalysis.id == history_id)\
             .first()