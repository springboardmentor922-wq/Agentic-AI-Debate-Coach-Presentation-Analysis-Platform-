"""
Audio Storage Service

Handles presentation audio upload, GridFS binary storage,
PostgreSQL metadata persistence, and authorized audio retrieval.
"""

from typing import List, Tuple, Optional, BinaryIO
from pathlib import Path
from bson import ObjectId
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status

from app.mongodb.database import mongodb
from app.models.presentation_analysis import PresentationAnalysis
from app.models.user import User
from app.models.coach_assignment import CoachAssignment
from app.models.educator_class import ClassEnrollment, EducatorClass


class AudioStorageService:
    ALLOWED_MIME_TYPES = {
        "audio/webm",
        "audio/wav",
        "audio/x-wav",
        "audio/mp3",
        "audio/mpeg",
        "audio/ogg",
        "audio/m4a",
        "audio/mp4",
        "audio/aac",
        "video/webm",
    }

    ALLOWED_EXTENSIONS = {
        ".webm", ".wav", ".mp3", ".ogg", ".m4a", ".mp4", ".aac"
    }

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    def validate_file(self, file: UploadFile, contents: bytes):
        """Validate recording MIME type and file size."""
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty audio recording submitted."
            )

        if len(contents) > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Audio file size exceeds the limit of {self.MAX_FILE_SIZE // (1024 * 1024)}MB."
            )

        mime_type = file.content_type.lower() if file.content_type else ""
        filename_ext = Path(file.filename).suffix.lower() if file.filename else ""

        is_valid_mime = mime_type in self.ALLOWED_MIME_TYPES or mime_type.startswith("audio/")
        is_valid_ext = filename_ext in self.ALLOWED_EXTENSIONS

        if not (is_valid_mime or is_valid_ext):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{mime_type}'. Allowed extensions: .webm, .wav, .mp3, .ogg, .m4a, .mp4"
            )

    async def save_audio(
        self,
        file: UploadFile,
        user_id: int,
        title: Optional[str] = None,
        session_id: Optional[int] = None,
        db: Session = None
    ) -> PresentationAnalysis:
        """
        Store audio binary in MongoDB GridFS and persist metadata in PostgreSQL presentation_analyses.
        """
        contents = await file.read()
        self.validate_file(file, contents)

        # Sanitize filename
        original_filename = Path(file.filename).name if file.filename else "recording.webm"
        safe_filename = f"user_{user_id}_{original_filename}"
        mime_type = file.content_type or "audio/webm"

        # Store in GridFS
        gridfs_file_id = mongodb.gridfs.put(
            contents,
            filename=safe_filename,
            contentType=mime_type,
            metadata={"user_id": user_id, "session_id": session_id}
        )
        gridfs_id_str = str(gridfs_file_id)

        # Persist PostgreSQL record
        presentation = PresentationAnalysis(
            user_id=user_id,
            session_id=session_id,
            title=title or "Untitled Presentation",
            gridfs_id=gridfs_id_str,
            filename=safe_filename,
            mime_type=mime_type,
            processing_status="STORED"
        )

        db.add(presentation)
        db.commit()
        db.refresh(presentation)

        return presentation

    def verify_access_authorization(
        self,
        presentation: PresentationAnalysis,
        current_user: User,
        db: Session
    ):
        """
        Validate RBAC ownership for audio access:
        - Owner can access.
        - Administrator can access.
        - Debate Coach can access if assigned to learner.
        - Educator can access if learner is in educator's class.
        """
        if current_user.role and current_user.role.name == "Administrator":
            return

        if presentation.user_id == current_user.id:
            return

        user_role = current_user.role.name if current_user.role else "Learner"

        if user_role == "Debate Coach":
            # Check coach assignment
            assignment = db.query(CoachAssignment).filter(
                CoachAssignment.coach_id == current_user.id,
                CoachAssignment.learner_id == presentation.user_id
            ).first()
            if assignment:
                return

        if user_role == "Educator":
            # Check educator class enrollment
            educator_class_ids = [
                c.id for c in db.query(EducatorClass.id).filter(EducatorClass.educator_id == current_user.id).all()
            ]
            enrollment = db.query(ClassEnrollment).filter(
                ClassEnrollment.class_id.in_(educator_class_ids),
                ClassEnrollment.learner_id == presentation.user_id
            ).first()
            if enrollment:
                return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this presentation recording."
        )

    def get_recording(
        self,
        recording_id: int,
        current_user: User,
        db: Session
    ) -> PresentationAnalysis:
        """Fetch PostgreSQL presentation record with authorization check."""
        presentation = db.query(PresentationAnalysis).filter(
            PresentationAnalysis.id == recording_id,
            PresentationAnalysis.is_deleted == False
        ).first()

        if not presentation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Presentation recording with ID {recording_id} not found."
            )

        self.verify_access_authorization(presentation, current_user, db)
        return presentation

    def get_audio_stream(
        self,
        recording_id: int,
        current_user: User,
        db: Session
    ) -> Tuple[BinaryIO, str, str]:
        """
        Retrieve binary stream from MongoDB GridFS with RBAC verification.
        Returns (gridfs_file_stream, mime_type, filename).
        """
        presentation = self.get_recording(recording_id, current_user, db)

        if not presentation.gridfs_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No GridFS audio stored for this presentation."
            )

        try:
            gridfs_file = mongodb.gridfs.get(ObjectId(presentation.gridfs_id))
            return gridfs_file, presentation.mime_type or "audio/webm", presentation.filename or "recording.webm"
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file binary could not be retrieved from GridFS storage."
            ) from exc

    def list_recordings_for_user(
        self,
        user_id: int,
        db: Session
    ) -> List[PresentationAnalysis]:
        """Fetch all non-deleted presentation recordings owned by user."""
        return db.query(PresentationAnalysis).filter(
            PresentationAnalysis.user_id == user_id,
            PresentationAnalysis.is_deleted == False
        ).order_by(PresentationAnalysis.created_at.desc()).all()


audio_storage_service = AudioStorageService()
