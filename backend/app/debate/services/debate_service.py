"""
Debate Processing Service

Purpose:
    Orchestrates the complete debate processing workflow.

Responsibilities:
    - Receive uploaded speech.
    - Generate transcript using Whisper.
    - Perform AI argument analysis.
    - Perform logical fallacy detection.
    - Persist results to MongoDB and PostgreSQL.
    - Return a unified debate analysis response.

Note:
    This service acts as the workflow orchestrator.
    It does not contain speech recognition logic or
    AI reasoning logic. Those responsibilities belong
    to their respective services.
"""

import asyncio
import json
from typing import Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.ai.schemas.argument_analysis_schema import (
    ArgumentAnalysisResponse,
)
from app.ai.schemas.fallacy_detection_schema import (
    FallacyDetectionResponse,
)
from app.debate.schemas.debate_schema import (
    DebateAnalysisData,
    DebateAnalysisResponse,
    DebateTranscription,
    SpeechMetrics,
)
from app.services.ai_analysis_service import (
    ai_analysis_service,
)
from app.speech.services.speech_service import (
    speech_service,
)
from app.presentation.services.audio_storage_service import audio_storage_service
from app.presentation.services.speech_to_text_service import speech_to_text_service
from app.presentation.services.presentation_analysis_engine import presentation_analysis_engine
from app.ai.orchestrator.debate_graph import debate_orchestrator
from app.ai.schemas.milestone3_schema import (
    AIDebateOpponentResponse, CoachingResponse, CounterargumentResponse,
    LearningPathResponse, PerformanceScore, RecommendationResponse,
    ObservabilityMetadata,
)

class DebateService:
    """
    Service responsible for orchestrating the complete
    debate analysis workflow.
    """

    async def process_debate(
        self,
        session_id: int,
        speech_text: str | None = None,
        media_file: UploadFile | None = None,
        user_id: int | None = None,
        debate_format: str = "One-on-One",
        difficulty: str = "Intermediate",
        user_position: str = "Affirmative",
        current_round: int = 1,
        db: Session | None = None,
    ) -> DebateAnalysisResponse:
        """
        Process a complete debate submission.

        Supports:
            - Typed speech
            - Uploaded audio
            - Uploaded video
        """

        # -------------------------------------------------
        # Step 1: Speech Storage, STT & Presentation Analytics
        # -------------------------------------------------
        speech_metrics_data: Optional[SpeechMetrics] = None

        if speech_text and speech_text.strip() != "":
            transcript = speech_text.strip()
            input_type = "text"
            media_filename = None
        else:
            media_filename = media_file.filename if media_file else "recording.webm"
            input_type = "media_upload"

            if db and user_id and media_file:
                # 1. Store binary audio/video in GridFS and metadata in PostgreSQL
                presentation = await audio_storage_service.save_audio(
                    file=media_file,
                    user_id=user_id,
                    title=f"Debate Session #{session_id} Speech",
                    session_id=session_id,
                    db=db,
                )
                # 2. Run Whisper speech-to-text from GridFS binary
                presentation, transcript = speech_to_text_service.transcribe_presentation(
                    presentation_id=presentation.id,
                    db=db,
                )
                # 3. Calculate presentation speech analytics
                presentation = presentation_analysis_engine.analyze_presentation(
                    presentation_id=presentation.id,
                    db=db,
                )

                filler_details = presentation.filler_words_details
                if isinstance(filler_details, str):
                    try:
                        filler_details = json.loads(filler_details)
                    except Exception:
                        pass

                speech_metrics_data = SpeechMetrics(
                    recording_id=presentation.id,
                    gridfs_id=presentation.gridfs_id,
                    audio_duration_seconds=float(presentation.audio_duration_seconds or 0.0),
                    speech_pace_wpm=float(presentation.speech_pace_wpm or 0.0),
                    filler_words_count=int(presentation.filler_words_count or 0),
                    filler_words_details=filler_details,
                    confidence_score=float(presentation.confidence_score or 0.0),
                    clarity_score=float(presentation.clarity_score or 0.0),
                    audience_engagement_score=float(presentation.audience_engagement_score or 0.0),
                    prosody_pitch_variance=float(presentation.prosody_pitch_variance or 0.0),
                    energy_variance=float(presentation.energy_variance or 0.0),
                    pause_count=int(presentation.pause_count or 0),
                    overall_presentation_score=float(presentation.overall_score or 0.0),
                    processing_status=presentation.processing_status,
                )
            elif media_file:
                transcript = await speech_service.transcribe_audio(media_file)
            else:
                transcript = "No speech text or recording content submitted."

        # -------------------------------------------------
        # Step 2: Multi-Agent AI Debate Analysis
        # -------------------------------------------------
        workflow = await asyncio.to_thread(
            debate_orchestrator.invoke,
            session_id=session_id, user_id=user_id, argument=transcript,
            debate_format=debate_format, difficulty=difficulty,
            user_position=user_position, current_round=current_round,
            input_type=input_type, media_filename=media_filename,
        )
        argument_analysis = ArgumentAnalysisResponse.model_validate(workflow["argument_analysis"])
        logical_fallacy_analysis = FallacyDetectionResponse.model_validate(workflow["logical_fallacy_analysis"])

        return DebateAnalysisResponse(
            success=True,
            message="Debate processed successfully.",
            data=DebateAnalysisData(
                session_id=session_id,
                transcript=DebateTranscription(
                    transcript=transcript,
                ),
                argument_analysis=argument_analysis,
                logical_fallacy_analysis=logical_fallacy_analysis,
                counterargument=CounterargumentResponse.model_validate(workflow["counterargument"]),
                ai_debate_opponent=AIDebateOpponentResponse.model_validate(workflow["ai_debate_opponent"]),
                performance=PerformanceScore.model_validate(workflow["performance"]),
                coaching=CoachingResponse.model_validate(workflow["coaching"]),
                recommendations=RecommendationResponse.model_validate(workflow["recommendations"]),
                learning_path=LearningPathResponse.model_validate(workflow["learning_path"]),
                progress_updated=workflow.get("progress_updated"),
                observability=ObservabilityMetadata.model_validate(workflow["observability"]),
                speech_metrics=speech_metrics_data,
            ),
        )
    

# Singleton service instance
debate_service = DebateService()
