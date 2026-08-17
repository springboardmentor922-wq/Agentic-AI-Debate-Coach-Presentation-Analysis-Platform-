from sqlalchemy.orm import Session

from app.models.debate_session import DebateSession
from app.schemas.debate_session import DebateSessionCreate


from app.models.user import User


def create_session(
    current_user: User,
    session: DebateSessionCreate,
    db: Session
):

    new_session = DebateSession(

        learner_id=current_user.id,

        topic=session.topic,

        category=session.category,

        difficulty=session.difficulty,

        duration=session.duration,

        created_by=current_user.full_name,

        status="Pending Review"

    )

    db.add(new_session)

    db.commit()

    db.refresh(new_session)

    return new_session

def get_all_sessions(db: Session):

    return db.query(DebateSession).all()


def get_session(session_id: int, db: Session):

    return db.query(DebateSession).filter(
        DebateSession.id == session_id
    ).first()


def update_session(session_id: int, status: str, db: Session):

    session = db.query(DebateSession).filter(
        DebateSession.id == session_id
    ).first()

    if session is None:
        return None

    session.status = status

    db.commit()
    db.refresh(session)

    return session


def delete_session(session_id: int, db: Session):

    session = db.query(DebateSession).filter(
        DebateSession.id == session_id
    ).first()

    if session is None:
        return None

    db.delete(session)
    db.commit()

    return True