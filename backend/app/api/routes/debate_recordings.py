from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.postgres import get_db
from app.models.debate_recording import DebateRecording, RecordingStatus, RecordingType
from app.models.debate_session import DebateSession
from app.models.user import User
from app.schemas.debate_recording import RecordingOut
from app.services.storage import get_storage_backend

router = APIRouter(prefix="/api/v1/debate-recordings", tags=["Debate Recordings"])


@router.post("/start", response_model=RecordingOut, status_code=201)
def start_recording(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Debate session not found")

    recording = DebateRecording(
        debate_session_id=session_id,
        user_id=current_user.id,
        recording_type=RecordingType.AUDIO,
        status=RecordingStatus.RECORDING,
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)
    return recording


@router.post("/{recording_id}/stop", response_model=RecordingOut)
async def stop_recording(
    recording_id: int,
    duration: int,
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    recording = db.query(DebateRecording).filter(DebateRecording.id == recording_id).first()
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.status != RecordingStatus.RECORDING:
        raise HTTPException(status_code=400, detail="This recording is not in a startable-to-stop state")

    try:
        file_bytes = await audio.read()
        storage = get_storage_backend()
        url = await storage.save(file_bytes, audio.filename or f"recording_{recording_id}.webm")
    except Exception as e:
        recording.status = RecordingStatus.FAILED
        db.commit()
        # The debate itself must not fail because of this — the caller (frontend) treats
        # this as "recording unavailable" and keeps the session running normally.
        raise HTTPException(status_code=502, detail=f"Recording upload failed: {e}")

    recording.recording_url = url
    recording.duration = duration
    recording.file_size = len(file_bytes)
    recording.status = RecordingStatus.COMPLETED
    db.commit()
    db.refresh(recording)
    return recording


@router.get("/{session_id}", response_model=list[RecordingOut])
def list_recordings_for_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Debate session not found")

    return (
        db.query(DebateRecording)
        .filter(DebateRecording.debate_session_id == session_id)
        .order_by(DebateRecording.created_at.desc())
        .all()
    )


@router.delete("/{recording_id}", status_code=204)
async def delete_recording(
    recording_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    recording = db.query(DebateRecording).filter(DebateRecording.id == recording_id).first()
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Recording not found")

    if recording.recording_url:
        storage = get_storage_backend()
        await storage.delete(recording.recording_url)

    db.delete(recording)
    db.commit()