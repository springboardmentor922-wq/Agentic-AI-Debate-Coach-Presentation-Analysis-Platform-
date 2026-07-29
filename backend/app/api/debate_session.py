"""
=========================================================
Debate Session API

Endpoints

POST    /debate-sessions
GET     /debate-sessions
GET     /debate-sessions/{session_id}
PUT     /debate-sessions/{session_id}
DELETE  /debate-sessions/{session_id}

=========================================================
"""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth import (
    get_current_user,
    require_any_role
)

from app.models.user import User

from app.schemas.debate_session import (
    CreateDebateSessionRequest,
    UpdateDebateSessionRequest,
    DebateSessionResponse
)

from app.schemas.session_participant import (
    CreateSessionParticipantRequest,
    UpdateSessionParticipantRequest,
    SessionParticipantResponse
)

from app.schemas.session_round import (
    CreateSessionRoundRequest,
    UpdateSessionRoundRequest,
    SessionRoundResponse
)

from app.services.debate_session_service import (
    DebateSessionService
)


router = APIRouter(
    prefix="/debate-sessions",
    tags=["Debate Sessions"]
)


# ==========================================================
# Create Debate Session
# ==========================================================

@router.post(
    "",
    response_model=DebateSessionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_session(
    session_data: CreateDebateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Learner",
                "Debate Coach",
                "Educator"
            ]
        )
    )
):

    try:

        return DebateSessionService.create_session(
            db=db,
            current_user=current_user,
            session_data=session_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# Get My Debate Sessions
# ==========================================================

@router.get(
    "",
    response_model=List[DebateSessionResponse]
)
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return DebateSessionService.get_my_sessions(
        db=db,
        current_user=current_user
    )


# ==========================================================
# Get Debate Session By ID
# ==========================================================

@router.get(
    "/{session_id}",
    response_model=DebateSessionResponse
)
def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.get_session_by_id(
            db=db,
            session_id=session_id,
            current_user=current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Update Debate Session
# ==========================================================

@router.put(
    "/{session_id}",
    response_model=DebateSessionResponse
)
def update_session(
    session_id: int,
    session_data: UpdateDebateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.update_session(
            db=db,
            session_id=session_id,
            current_user=current_user,
            session_data=session_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Cancel Debate Session
# ==========================================================

@router.delete(
    "/{session_id}"
)
def cancel_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.cancel_session(
            db=db,
            session_id=session_id,
            current_user=current_user
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    

# ==========================================================
# Add Participant
# ==========================================================

@router.post(
    "/participants",
    response_model=SessionParticipantResponse,
    status_code=status.HTTP_201_CREATED
)
def add_participant(
    participant_data: CreateSessionParticipantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.add_participant(
            db=db,
            participant_data=participant_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# Get Participants
# ==========================================================

@router.get(
    "/{session_id}/participants",
    response_model=List[SessionParticipantResponse]
)
def get_participants(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.get_participants(
            db=db,
            session_id=session_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# ==========================================================
# Update Participant
# ==========================================================

@router.put(
    "/participants/{participant_id}",
    response_model=SessionParticipantResponse
)
def update_participant(
    participant_id: int,
    participant_data: UpdateSessionParticipantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.update_participant(
            db=db,
            participant_id=participant_id,
            participant_data=participant_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
# ==========================================================
# Remove Participant
# ==========================================================

@router.delete(
    "/participants/{participant_id}"
)
def remove_participant(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.remove_participant(
            db=db,
            participant_id=participant_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ==========================================================
# Create Round
# ==========================================================

@router.post(
    "/rounds",
    response_model=SessionRoundResponse,
    status_code=status.HTTP_201_CREATED
)
def create_round(
    round_data: CreateSessionRoundRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.create_round(
            db=db,
            round_data=round_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# ==========================================================
# Get Rounds
# ==========================================================

@router.get(
    "/{session_id}/rounds",
    response_model=List[SessionRoundResponse]
)
def get_rounds(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.get_rounds(
            db=db,
            session_id=session_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
# ==========================================================
# Update Round
# ==========================================================

@router.put(
    "/rounds/{round_id}",
    response_model=SessionRoundResponse
)
def update_round(
    round_id: int,
    round_data: UpdateSessionRoundRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.update_round(
            db=db,
            round_id=round_id,
            round_data=round_data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# ==========================================================
# Complete Round
# ==========================================================

@router.put(
    "/rounds/{round_id}/complete",
    response_model=SessionRoundResponse
)
def complete_round(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(
            [
                "Debate Coach",
                "Educator",
                "Administrator"
            ]
        )
    )
):

    try:

        return DebateSessionService.complete_round(
            db=db,
            round_id=round_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# ==========================================================
# Start Session
# ==========================================================

@router.put(
    "/{session_id}/start",
    response_model=DebateSessionResponse
)
def start_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.start_session(
            db=db,
            session_id=session_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
# ==========================================================
# End Session
# ==========================================================

@router.put(
    "/{session_id}/end",
    response_model=DebateSessionResponse
)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        return DebateSessionService.end_session(
            db=db,
            session_id=session_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )