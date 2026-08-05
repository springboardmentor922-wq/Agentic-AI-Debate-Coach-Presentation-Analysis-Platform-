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

import asyncio
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

        workflow = await asyncio.to_thread(
            debate_orchestrator.invoke,
            session_id=session_id, user_id=user_id, argument=transcript,
            debate_format=debate_format, difficulty=difficulty,
            user_position=user_position, current_round=current_round,
            input_type=input_type, media_filename=media_filename,
        )
        argument_analysis = ArgumentAnalysisResponse.model_validate(workflow["argument_analysis"])
        logical_fallacy_analysis = FallacyDetectionResponse.model_validate(workflow["logical_fallacy_analysis"])

        # The graph's final persistence node stores this complete workflow
        # exactly once. Keep API orchestration free of duplicate writes.

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
            ),
        )
    

# Singleton service instance
debate_service = DebateService()
