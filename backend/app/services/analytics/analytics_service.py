from sqlalchemy.orm import Session

from app.models.session import DebateSession
from app.services.mongodb.transcript_service import TranscriptService


class AnalyticsService:

    def __init__(self):
        self.transcript_service = TranscriptService()

    async def get_overview(
        self,
        db: Session
    ):

        sessions = db.query(
            DebateSession
        ).all()

        total_sessions = len(sessions)

        completed = len(
            [
                s
                for s in sessions
                if s.status.lower() == "completed"
            ]
        )

        active = len(
            [
                s
                for s in sessions
                if s.status.lower() == "active"
            ]
        )

        durations = [
            s.duration
            for s in sessions
            if s.duration
        ]

        average_duration = (
            sum(durations) / len(durations)
            if durations
            else 0
        )

        scores = []

        for session in sessions:

            history = await self.transcript_service.get_history(
                session.id
            )

            score = self._calculate_score(
                history
            )

            scores.append(score)

        average_score = (
            round(sum(scores) / len(scores))
            if scores
            else 0
        )

        wins = len(
            [
                score
                for score in scores
                if score >= 75
            ]
        )

        return {

            "total_sessions": total_sessions,

            "average_score": average_score,

            "wins": wins,

            "completed": completed,

            "active_sessions": active,

            "average_duration": round(
                average_duration,
                1
            )

        }

    async def get_performance(
        self,
        session_id: int
    ):

        history = await self.transcript_service.get_history(
            session_id
        )

        user_messages = len(
            [
                m
                for m in history
                if m["speaker"] == "user"
            ]
        )

        ai_messages = len(
            [
                m
                for m in history
                if m["speaker"] == "ai"
            ]
        )

        return {

            "total_messages": len(history),

            "user_messages": user_messages,

            "ai_messages": ai_messages

        }

    async def get_history(
        self,
        db: Session
    ):

        sessions = db.query(
            DebateSession
        ).all()

        result = []

        for session in sessions:

            history = await self.transcript_service.get_history(
                session.id
            )

            topic_name = (
                session.topic.title
                if session.topic
                else "Unknown"
            )

            score = self._calculate_score(
                history
            )

            strengths = self._strengths(
                history
            )

            weaknesses = self._weaknesses(
                history
            )

            feedback = self._feedback(
                score,
                strengths,
                weaknesses
            )

            result.append(

                {

                    "session_id": session.id,

                    "topic": topic_name,

                    "score": score,

                    "strengths": strengths,

                    "weaknesses": weaknesses,

                    "feedback": feedback

                }

            )

        return result

    ####################################################################
    #                        SCORING ENGINE
    ####################################################################

    def _calculate_score(
        self,
        history
    ):

        user_messages = [

            message["message"]

            for message in history

            if message["speaker"] == "user"

        ]

        joined = " ".join(
            user_messages
        ).lower()

        total_words = len(
            joined.split()
        )

        score = 35

        # ----------------------------------------------------
        # Participation
        # ----------------------------------------------------

        if len(user_messages) == 1:

            score += 5

        elif len(user_messages) == 2:

            score += 10

        elif len(user_messages) >= 3:

            score += 15

        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        if total_words >= 20:

            score += 5

        if total_words >= 50:

            score += 5

        if total_words >= 100:

            score += 5

        # ----------------------------------------------------
        # Evidence
        # ----------------------------------------------------

        evidence_keywords = [

            "because",
            "example",
            "examples",
            "research",
            "study",
            "studies",
            "statistics",
            "statistic",
            "evidence",
            "data",
            "survey",
            "according"

        ]

        evidence_hits = sum(

            1

            for word in evidence_keywords

            if word in joined

        )

        score += min(
            evidence_hits * 2,
            8
        )

        # ----------------------------------------------------
        # Counter Arguments
        # ----------------------------------------------------

        rebuttal_keywords = [

            "however",
            "although",
            "while",
            "yet",
            "but",
            "on the other hand",
            "despite"

        ]

        rebuttal_hits = sum(

            1

            for word in rebuttal_keywords

            if word in joined

        )

        score += min(
            rebuttal_hits * 2,
            7
        )
                # ----------------------------------------------------
        # Conclusion
        # ----------------------------------------------------

        conclusion_keywords = [

            "therefore",
            "thus",
            "overall",
            "in conclusion",
            "to conclude",
            "finally",
            "hence"

        ]

        if any(
            word in joined
            for word in conclusion_keywords
        ):
            score += 5

        # ----------------------------------------------------
        # Vocabulary Bonus
        # ----------------------------------------------------

        vocabulary_keywords = [

            "innovation",
            "sustainable",
            "consequently",
            "perspective",
            "significant",
            "economic",
            "ethical",
            "environmental",
            "development",
            "efficient"

        ]

        vocabulary_hits = sum(

            1

            for word in vocabulary_keywords

            if word in joined

        )

        score += min(
            vocabulary_hits,
            5
        )

        # ----------------------------------------------------
        # Small variation so every debate isn't identical
        # ----------------------------------------------------

        variation = (
            total_words % 5
        ) - 2

        score += variation

        score = max(
            55,
            min(score, 95)
        )

        return score

    ####################################################################
    #                        STRENGTHS
    ####################################################################

    def _strengths(
        self,
        history
    ):

        joined = " ".join(

            message["message"]

            for message in history

            if message["speaker"] == "user"

        ).lower()

        total_words = len(
            joined.split()
        )

        strengths = []

        if any(
            word in joined
            for word in [
                "because",
                "therefore",
                "thus"
            ]
        ):
            strengths.append(
                "Logical Reasoning"
            )

        if any(
            word in joined
            for word in [
                "research",
                "study",
                "statistics",
                "data",
                "example"
            ]
        ):
            strengths.append(
                "Supporting Evidence"
            )

        if any(
            word in joined
            for word in [
                "however",
                "although",
                "while",
                "yet"
            ]
        ):
            strengths.append(
                "Counter Arguments"
            )

        if total_words >= 90:
            strengths.append(
                "Detailed Explanation"
            )

        if any(
            word in joined
            for word in [
                "therefore",
                "overall",
                "finally"
            ]
        ):
            strengths.append(
                "Strong Conclusion"
            )

        if len(strengths) < 2:

            strengths.append(
                "Clear Communication"
            )

        return strengths[:2]

    ####################################################################
    #                        WEAKNESSES
    ####################################################################

    def _weaknesses(
        self,
        history
    ):

        joined = " ".join(

            message["message"]

            for message in history

            if message["speaker"] == "user"

        ).lower()

        total_words = len(
            joined.split()
        )

        weaknesses = []

        if "example" not in joined and "research" not in joined:

            weaknesses.append(
                "Need More Supporting Evidence"
            )

        if "however" not in joined:

            weaknesses.append(
                "Weak Rebuttal"
            )

        if total_words < 60:

            weaknesses.append(
                "Arguments Too Short"
            )

        if not any(
            word in joined
            for word in [
                "therefore",
                "overall",
                "finally",
                "thus"
            ]
        ):

            weaknesses.append(
                "Missing Conclusion"
            )

        if len(weaknesses) < 2:

            weaknesses.append(
                "Clarity"
            )

        return weaknesses[:2]

    ####################################################################
    #                        FEEDBACK
    ####################################################################

    def _feedback(
        self,
        score,
        strengths,
        weaknesses
    ):

        if score >= 90:

            return (
                f"Outstanding debate performance. "
                f"Your {strengths[0].lower()} made your arguments highly convincing. "
                f"Continue improving {weaknesses[0].lower()} to reach an even higher level."
            )

        elif score >= 80:

            return (
                f"Very good debate. "
                f"Your {strengths[0].lower()} stood out throughout the discussion. "
                f"Working on {weaknesses[0].lower()} will make your arguments stronger."
            )

        elif score >= 70:

            return (
                f"Good performance with a solid foundation. "
                f"Focus on improving {weaknesses[0].lower()} and continue building confidence."
            )

        elif score >= 60:

            return (
                f"You presented your ideas clearly but there is room for improvement. "
                f"Pay more attention to {weaknesses[0].lower()} and provide stronger support for your claims."
            )

        return (
            f"This debate is a good starting point. "
            f"Practice developing stronger arguments, include more evidence, "
            f"and work on {weaknesses[0].lower()}."
        )