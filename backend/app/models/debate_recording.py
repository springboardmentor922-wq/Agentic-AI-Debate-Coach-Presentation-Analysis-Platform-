import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.postgres import Base


class RecordingType(str, enum.Enum):
    AUDIO = "audio"
    VIDEO = "video"  # not implemented yet — reserved for future scalability


class RecordingStatus(str, enum.Enum):
    RECORDING = "recording"
    COMPLETED = "completed"
    FAILED = "failed"


class DebateRecording(Base):
    __tablename__ = "debate_recordings"

    id = Column(Integer, primary_key=True, index=True)
    debate_session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    recording_url = Column(String(500), nullable=True)  # set once upload completes
    duration = Column(Integer, nullable=True)  # seconds
    recording_type = Column(Enum(RecordingType), default=RecordingType.AUDIO)
    file_size = Column(Integer, nullable=True)  # bytes
    status = Column(Enum(RecordingStatus), default=RecordingStatus.RECORDING)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    session = relationship("DebateSession")
    user = relationship("User")