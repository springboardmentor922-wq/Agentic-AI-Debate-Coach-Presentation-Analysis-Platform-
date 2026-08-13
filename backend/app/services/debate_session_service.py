"""
=========================================================
Debate Session Service

Business Logic for:

- Create Debate Session
- Get All Debate Sessions
- Get Debate Session By ID
- Update Debate Session
- Cancel Debate Session

=========================================================
"""

from sqlalchemy.orm import Session

from app.models.debate_session import DebateSession
from app.models.debate_topic import DebateTopic
from app.models.user import User
from app.models.session_participant import SessionParticipant
from app.models.session_round import SessionRound
from app.models.practice_assignment import LearnerPracticeAssignment


from app.schemas.debate_session import (
    CreateDebateSessionRequest,
    UpdateDebateSessionRequest
)
from app.schemas.session_participant import (
    CreateSessionParticipantRequest,
    UpdateSessionParticipantRequest
)

from app.schemas.session_round import (
    CreateSessionRoundRequest,
    UpdateSessionRoundRequest
)


class DebateSessionService:

    # =====================================================
    # Create Debate Session
    # =====================================================

    @staticmethod
    def create_session(
        db: Session,
        current_user: User,
        session_data: CreateDebateSessionRequest
    ):

        topic_id_to_use = session_data.topic_id
        format_to_use = session_data.debate_format

        practice_task = None
        if hasattr(session_data, "practice_assignment_id") and session_data.practice_assignment_id:
            practice_task = db.query(LearnerPracticeAssignment).filter(
                LearnerPracticeAssignment.id == session_data.practice_assignment_id
            ).first()
            if practice_task:
                if practice_task.topic_id:
                    topic_id_to_use = practice_task.topic_id
                if practice_task.debate_format:
                    format_to_use = practice_task.debate_format

                if practice_task.session_id:
                    existing_session = db.query(DebateSession).filter(DebateSession.id == practice_task.session_id).first()
                    if existing_session:
                        practice_task.status = "In Progress"
                        db.commit()
                        return existing_session

                # Check if user already created/started a session for this topic after assignment
                user_session = db.query(DebateSession).filter(
                    DebateSession.user_id == current_user.id,
                    DebateSession.topic_id == topic_id_to_use,
                    DebateSession.created_at >= practice_task.created_at
                ).order_by(DebateSession.created_at.desc()).first()

                if user_session:
                    practice_task.session_id = user_session.id
                    practice_task.status = "In Progress"
                    db.commit()
                    return user_session

        # Check whether topic exists and is active
        topic = (
            db.query(DebateTopic)
            .filter(
                DebateTopic.id == topic_id_to_use,
                DebateTopic.is_active == True
            )
            .first()
        )

        if topic is None:
            raise ValueError("Selected debate topic does not exist.")

        new_session = DebateSession(
            user_id=current_user.id,
            topic_id=topic_id_to_use,
            debate_format=format_to_use,
            debate_position=session_data.debate_position or "Affirmative",
            scheduled_at=session_data.scheduled_at,
            session_status="Scheduled",
            created_by=current_user.id
        )

        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        if practice_task:
            practice_task.session_id = new_session.id
            practice_task.status = "In Progress"
            db.commit()

        return new_session


    # =====================================================
    # Get All Debate Sessions
    # =====================================================

    @staticmethod
    def get_my_sessions(
        db: Session,
        current_user: User
    ):

        return (
            db.query(DebateSession)
            .filter(
                DebateSession.user_id == current_user.id
            )
            .all()
        )

    # =====================================================
    # Get Debate Session By ID
    # =====================================================

    @staticmethod
    def get_session_by_id(
        db: Session,
        session_id: int,
        current_user: User
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == session_id,
                DebateSession.user_id == current_user.id
            )
            .first()
        )

        if session is None:
            raise ValueError("Debate session not found.")

        return session

    # =====================================================
    # Update Debate Session
    # =====================================================

    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        current_user: User,
        session_data: UpdateDebateSessionRequest
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == session_id,
                DebateSession.user_id == current_user.id
            )
            .first()
        )

        if session is None:
            raise ValueError("Debate session not found.")

        update_data = session_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(session, field, value)

        db.commit()

        db.refresh(session)

        return session

    # =====================================================
    # Cancel Debate Session
    # =====================================================

    @staticmethod
    def cancel_session(
        db: Session,
        session_id: int,
        current_user: User
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == session_id,
                DebateSession.user_id == current_user.id
            )
            .first()
        )

        if session is None:
            raise ValueError("Debate session not found.")

        session.session_status = "Cancelled"

        db.commit()

        db.refresh(session)

        return {
            "message": "Debate session cancelled successfully."
        }
    
    # =====================================================
    # Add Participant
    # =====================================================

    @staticmethod
    def add_participant(
        db: Session,
        participant_data: CreateSessionParticipantRequest
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == participant_data.session_id
            )
            .first()
        )

        if not session:
            raise ValueError("Debate session not found.")

        existing = (
            db.query(SessionParticipant)
            .filter(
                SessionParticipant.session_id == participant_data.session_id,
                SessionParticipant.user_id == participant_data.user_id
            )
            .first()
        )

        if existing:
            raise ValueError(
                "Participant already exists in this session."
            )

        participant = SessionParticipant(

            session_id=participant_data.session_id,

            user_id=participant_data.user_id,

            role_in_session=participant_data.role_in_session,

            position=participant_data.position

        )

        db.add(participant)

        db.commit()

        db.refresh(participant)

        return participant

    # =====================================================
    # Get Session Participants
    # =====================================================

    @staticmethod
    def get_participants(
        db: Session,
        session_id: int
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == session_id
            )
            .first()
        )

        if not session:
            raise ValueError("Debate session not found.")

        return (

            db.query(SessionParticipant)

            .filter(
                SessionParticipant.session_id == session_id
            )

            .all()

        )

    # =====================================================
    # Update Participant
    # =====================================================

    @staticmethod
    def update_participant(
        db: Session,
        participant_id: int,
        participant_data: UpdateSessionParticipantRequest
    ):

        participant = (

            db.query(SessionParticipant)

            .filter(
                SessionParticipant.id == participant_id
            )

            .first()

        )

        if not participant:

            raise ValueError("Participant not found.")

        update_data = participant_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():

            setattr(participant, field, value)

        db.commit()

        db.refresh(participant)

        return participant

    # =====================================================
    # Remove Participant
    # =====================================================

    @staticmethod
    def remove_participant(
        db: Session,
        participant_id: int
    ):

        participant = (

            db.query(SessionParticipant)

            .filter(
                SessionParticipant.id == participant_id
            )

            .first()

        )

        if not participant:

            raise ValueError("Participant not found.")

        db.delete(participant)

        db.commit()

        return {

            "message":
            "Participant removed successfully."

        }

        # =====================================================
    # Create Round
    # =====================================================

    @staticmethod
    def create_round(
        db: Session,
        round_data: CreateSessionRoundRequest
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == round_data.session_id
            )
            .first()
        )

        if not session:
            raise ValueError("Debate session not found.")

        existing_round = (
            db.query(SessionRound)
            .filter(
                SessionRound.session_id == round_data.session_id,
                SessionRound.round_number == round_data.round_number
            )
            .first()
        )

        if existing_round:
            raise ValueError(
                "Round number already exists for this session."
            )

        new_round = SessionRound(

            session_id=round_data.session_id,

            round_number=round_data.round_number,

            round_name=round_data.round_name,

            duration_minutes=round_data.duration_minutes

        )

        db.add(new_round)

        db.commit()

        db.refresh(new_round)

        return new_round

        # =====================================================
    # Get Session Rounds
    # =====================================================

    @staticmethod
    def get_rounds(
        db: Session,
        session_id: int
    ):

        session = (
            db.query(DebateSession)
            .filter(
                DebateSession.id == session_id
            )
            .first()
        )

        if not session:
            raise ValueError("Debate session not found.")

        return (

            db.query(SessionRound)

            .filter(
                SessionRound.session_id == session_id
            )

            .order_by(
                SessionRound.round_number
            )

            .all()

        )

        # =====================================================
    # Update Round
    # =====================================================

    @staticmethod
    def update_round(
        db: Session,
        round_id: int,
        round_data: UpdateSessionRoundRequest
    ):

        round_obj = (

            db.query(SessionRound)

            .filter(
                SessionRound.id == round_id
            )

            .first()

        )

        if not round_obj:
            raise ValueError("Round not found.")

        update_data = round_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():

            setattr(round_obj, field, value)

        db.commit()

        db.refresh(round_obj)

        return round_obj


        # =====================================================
    # Complete Round
    # =====================================================

    @staticmethod
    def complete_round(
        db: Session,
        round_id: int
    ):

        round_obj = (

            db.query(SessionRound)

            .filter(
                SessionRound.id == round_id
            )

            .first()

        )

        if not round_obj:
            raise ValueError("Round not found.")

        round_obj.status = "Completed"

        db.commit()

        db.refresh(round_obj)

        return round_obj

        # =====================================================
    # Start Session
    # =====================================================

    @staticmethod
    def start_session(
        db: Session,
        session_id: int
    ):

        session = (

            db.query(DebateSession)

            .filter(
                DebateSession.id == session_id
            )

            .first()

        )

        if not session:

            raise ValueError("Debate session not found.")

        if session.session_status == "Completed":

            raise ValueError(
                "Completed sessions cannot be started."
            )

        if session.session_status == "In Progress":

            raise ValueError(
                "Session is already in progress."
            )

        from datetime import datetime

        session.session_status = "In Progress"

        session.started_at = datetime.utcnow()

        db.commit()

        db.refresh(session)

        return session


        # =====================================================
    # End Session
    # =====================================================

    @staticmethod
    def end_session(
        db: Session,
        session_id: int
    ):

        session = (

            db.query(DebateSession)

            .filter(
                DebateSession.id == session_id
            )

            .first()

        )

        if not session:

            raise ValueError("Debate session not found.")

        if session.session_status == "Completed":

            raise ValueError(
                "Session has already been completed."
            )

        from datetime import datetime

        session.session_status = "Completed"

        session.ended_at = datetime.utcnow()

        db.commit()

        db.refresh(session)

        return session