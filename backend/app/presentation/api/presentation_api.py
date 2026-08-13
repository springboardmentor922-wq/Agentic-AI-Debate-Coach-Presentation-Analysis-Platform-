"""
Presentation API Endpoints

Exposes REST APIs for presentation audio upload, streaming, transcription,
speech analytics execution, status polling, and full performance reports.
"""

from typing import Optional
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db, SessionLocal
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.system_logs import AuditLog
from app.models.presentation_analysis import PresentationAnalysis
from app.mongodb.database import mongodb
from app.presentation.schemas.presentation_schema import (
    PresentationRecordingResponse,
    PresentationListResponse,
    PresentationRecordingData,
)
from app.presentation.services.audio_storage_service import audio_storage_service
from app.presentation.services.speech_to_text_service import speech_to_text_service
from app.presentation.services.presentation_analysis_engine import presentation_analysis_engine

router = APIRouter(
    prefix="/presentation/recordings",
    tags=["Presentation Recording & Analysis"],
)


def run_full_presentation_pipeline(presentation_id: int):
    """Background task to run STT + Presentation Analytics engine."""
    db = SessionLocal()
    try:
        # Step 1: Speech-to-Text
        presentation, _ = speech_to_text_service.transcribe_presentation(presentation_id, db)
        
        # Step 2: Presentation Analytics Engine
        presentation_analysis_engine.analyze_presentation(presentation.id, db)

        # Audit Log
        audit = AuditLog(
            user_id=presentation.user_id,
            action="PRESENTATION_ANALYSIS_COMPLETED",
            resource_type="presentation_analysis",
            resource_id=presentation.id,
            details=f"Processed presentation '{presentation.title}' with score {presentation.overall_score}"
        )
        db.add(audit)
        db.commit()
    except Exception as exc:
        print(f"Background presentation pipeline error for ID {presentation_id}: {exc}")
        presentation = db.query(PresentationAnalysis).filter(PresentationAnalysis.id == presentation_id).first()
        if presentation:
            presentation.processing_status = "FAILED"
            db.commit()
    finally:
        db.close()


@router.post(
    "/upload",
    response_model=PresentationRecordingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_presentation_recording(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    session_id: Optional[int] = Form(None),
    auto_analyze: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a browser-recorded presentation audio file.
    Stores binary file in MongoDB GridFS, persists metadata in PostgreSQL presentation_analyses,
    and automatically triggers background STT + Speech Analytics processing.
    """
    try:
        presentation = await audio_storage_service.save_audio(
            file=audio_file,
            user_id=current_user.id,
            title=title,
            session_id=session_id,
            db=db
        )

        # Record audit log
        audit = AuditLog(
            user_id=current_user.id,
            action="PRESENTATION_RECORDING_UPLOADED",
            resource_type="presentation_analysis",
            resource_id=presentation.id,
            details=f"Uploaded presentation audio '{presentation.filename}' to GridFS ID {presentation.gridfs_id}"
        )
        db.add(audit)
        db.commit()

        if auto_analyze:
            background_tasks.add_task(run_full_presentation_pipeline, presentation.id)

        return PresentationRecordingResponse(
            success=True,
            message="Presentation recording stored in GridFS and queued for analysis.",
            data=PresentationRecordingData.model_validate(presentation)
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store presentation recording: {str(exc)}"
        ) from exc


@router.post(
    "/{recording_id}/process",
    response_model=PresentationRecordingResponse,
    status_code=status.HTTP_200_OK,
)
def trigger_presentation_processing(
    recording_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually trigger STT & Presentation Analytics execution for a stored recording.
    """
    presentation = audio_storage_service.get_recording(recording_id, current_user, db)
    background_tasks.add_task(run_full_presentation_pipeline, presentation.id)
    
    return PresentationRecordingResponse(
        success=True,
        message="Presentation processing initiated.",
        data=PresentationRecordingData.model_validate(presentation)
    )


@router.get(
    "",
    response_model=PresentationListResponse,
    status_code=status.HTTP_200_OK,
)
def list_user_presentation_recordings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all presentation recordings for the authenticated learner.
    """
    recordings = audio_storage_service.list_recordings_for_user(
        user_id=current_user.id,
        db=db
    )
    return PresentationListResponse(
        success=True,
        message="Presentation recordings retrieved successfully.",
        data=[PresentationRecordingData.model_validate(r) for r in recordings]
    )


@router.get(
    "/{recording_id}",
    response_model=PresentationRecordingResponse,
    status_code=status.HTTP_200_OK,
)
def get_presentation_recording_detail(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve presentation recording metadata with RBAC verification.
    """
    presentation = audio_storage_service.get_recording(
        recording_id=recording_id,
        current_user=current_user,
        db=db
    )
    return PresentationRecordingResponse(
        success=True,
        message="Presentation recording details retrieved.",
        data=PresentationRecordingData.model_validate(presentation)
    )


@router.get(
    "/{recording_id}/status",
    status_code=status.HTTP_200_OK,
)
def get_presentation_processing_status(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Poll presentation processing status (STORED, TRANSCRIBING, ANALYZING, COMPLETED, FAILED).
    """
    presentation = audio_storage_service.get_recording(recording_id, current_user, db)
    return {
        "success": True,
        "recording_id": presentation.id,
        "status": presentation.processing_status,
        "overall_score": float(presentation.overall_score or 0.0),
        "updated_at": presentation.updated_at.isoformat() if presentation.updated_at else None
    }


@router.get(
    "/{recording_id}/report",
    status_code=status.HTTP_200_OK,
)
def get_presentation_report(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve complete presentation performance report from MongoDB document store.
    """
    presentation = audio_storage_service.get_recording(recording_id, current_user, db)

    # Fetch document from MongoDB
    report_doc = mongodb.presentation_analysis_collection.find_one({"presentation_id": presentation.id})
    
    if not report_doc:
        # Fallback to generating report structure from PostgreSQL fields if MongoDB doc missing
        if presentation.processing_status != "COMPLETED":
            return {
                "success": False,
                "message": f"Presentation processing is in status '{presentation.processing_status}' and not completed yet.",
                "status": presentation.processing_status
            }
        
        # Build fallback doc from PostgreSQL
        report_doc = {
            "presentation_id": presentation.id,
            "user_id": presentation.user_id,
            "title": presentation.title,
            "audio_duration_seconds": float(presentation.audio_duration_seconds or 0.0),
            "transcript": presentation.transcription_text or "",
            "metrics": {
                "overall_score": float(presentation.overall_score or 0.0),
                "speech_pace_wpm": float(presentation.speech_pace_wpm or 0.0),
                "filler_words_count": int(presentation.filler_words_count or 0),
                "clarity_score": float(presentation.clarity_score or 0.0),
                "confidence_score": float(presentation.confidence_score or 0.0),
                "audience_engagement_score": float(presentation.audience_engagement_score or 0.0),
                "prosody": {
                    "pitch_variance": float(presentation.prosody_pitch_variance or 0.0),
                    "energy_variance": float(presentation.energy_variance or 0.0),
                    "pause_count": int(presentation.pause_count or 0)
                }
            },
            "feedback": {
                "strengths": ["Presentation processing completed successfully."],
                "weaknesses": [],
                "recommendations": ["Review transcript and vocal pacing."]
            }
        }
    else:
        report_doc["_id"] = str(report_doc["_id"])

    return {
        "success": True,
        "message": "Presentation report retrieved successfully.",
        "data": report_doc
    }


@router.get(
    "/{recording_id}/audio",
    status_code=status.HTTP_200_OK,
)
def stream_presentation_audio(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stream binary audio file from MongoDB GridFS with RBAC verification.
    """
    gridfs_file, mime_type, filename = audio_storage_service.get_audio_stream(
        recording_id=recording_id,
        current_user=current_user,
        db=db
    )

    def iterfile():
        while True:
            chunk = gridfs_file.read(1024 * 64)
            if not chunk:
                break
            yield chunk

    headers = {
        "Content-Disposition": f'inline; filename="{filename}"'
    }

    return StreamingResponse(
        iterfile(),
        media_type=mime_type,
        headers=headers
    )
