from app.services.ai.argument_engine import ArgumentEngine
from app.services.ai.fallacy_engine import FallacyEngine
from app.services.ai.scoring_engine import ScoringEngine
from app.services.ai.feedback_engine import FeedbackEngine
from app.services.mongodb.transcript_service import TranscriptService


class DebateEngine:

    def __init__(self):

        self.argument = ArgumentEngine()
        self.fallacy = FallacyEngine()
        self.scoring = ScoringEngine()
        self.feedback = FeedbackEngine()
        self.transcripts = TranscriptService()

    async def process_text(
        self,
        session_id: int,
        user_id: int,
        topic: str,
        text: str,
        position: str = "For",
        debate_format: str = "One-on-One Debate"
    ):

        history = await self.transcripts.get_history(session_id)

        history_text = ""

        for message in history:

            history_text += (
                f"{message['speaker'].upper()}: "
                f"{message['message']}\n"
            )

        analysis = await self.argument.analyze_argument(

            argument=text,

            debate_format=debate_format,

            history=history_text,

            position=position

        )

        await self.transcripts.add_message(

            session_id=session_id,

            user_id=user_id,

            speaker="user",

            message=text,

            topic=topic

        )

        await self.transcripts.add_message(

            session_id=session_id,

            user_id=user_id,

            speaker="ai",

            message=analysis.opponent_response,

            topic=topic

        )

        score = self.scoring.score(analysis)

        feedback = self.feedback.generate(

            analysis,

            score

        )

        return {

            "analysis": analysis.model_dump(),

            "fallacies": analysis.fallacies,

            "opponent": analysis.opponent_response,

            "feedback": {

                **feedback,

                "counterargument": analysis.counterargument,

                "coaching": analysis.feedback

            }

        }