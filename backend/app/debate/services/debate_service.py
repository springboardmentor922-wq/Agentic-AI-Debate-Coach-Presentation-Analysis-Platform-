"""
Debate Processing Service

Purpose:
    Orchestrates the complete debate processing workflow.

Responsibilities:
    - Receive uploaded speech.
    - Generate transcript using Whisper.
    - Perform AI argument analysis.
    - Perform logical fallacy detection.
    - (Future) Persist results to MongoDB.
    - Return a unified debate analysis response.

Note:
    This service acts as the workflow orchestrator.
    It does not contain speech recognition logic or
    AI reasoning logic. Those responsibilities belong
    to their respective services.
"""

from fastapi import UploadFile

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
)
from app.services.ai_analysis_service import (
    ai_analysis_service,
)
from app.speech.services.speech_service import (
    speech_service,
)
from app.mongodb.debate_repository import debate_repository

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
    ) -> DebateAnalysisResponse:
        """
        Process a complete debate submission.

        Supports:
            • Typed speech
            • Uploaded audio
            • Uploaded video
        """

    # -------------------------------------------------
    # Step 1
    # Get Transcript
    # -------------------------------------------------

        if speech_text:

            transcript = speech_text

            input_type = "text"

            media_filename = None

        else:

            transcript = await speech_service.transcribe_audio(
                media_file
            )

            input_type = "media_upload"

            media_filename = media_file.filename

        # -------------------------------------------------
        # Step 2
        # Argument Analysis
        # -------------------------------------------------

        argument_analysis: ArgumentAnalysisResponse = (
            ai_analysis_service.analyze_argument(
                transcript
            )
        )

        # -------------------------------------------------
        # Step 3
        # Logical Fallacy Detection
        # -------------------------------------------------

        logical_fallacy_analysis: FallacyDetectionResponse = (
            ai_analysis_service.detect_fallacies(
                transcript
            )
        )

        # -------------------------------------------------
        # Step 4
        # Save to MongoDB
        # -------------------------------------------------

        report_id = debate_repository.save_debate_analysis(
            session_id=session_id,
            user_id=0,
            topic_id=0,
            input_type=input_type,
            media_filename=media_filename,
            transcript={
                "transcript": transcript
            },
            argument_analysis=argument_analysis.model_dump(),
            logical_fallacy_analysis=logical_fallacy_analysis.model_dump(),
        )

        # -------------------------------------------------
        # Step 5
        # Return Response
        # -------------------------------------------------

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
            ),
        )
    

# Singleton service instance
debate_service = DebateService()