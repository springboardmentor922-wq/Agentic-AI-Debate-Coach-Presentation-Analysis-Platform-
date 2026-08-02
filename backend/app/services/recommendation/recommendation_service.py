from app.services.mongodb.transcript_service import TranscriptService


class RecommendationService:

    def __init__(self):
        self.transcript_service = TranscriptService()

    async def generate(
        self,
        session_id: int
    ):

        history = await self.transcript_service.get_history(
            session_id
        )

        score = self._calculate_score(
            history
        )

        joined = " ".join(

            message["message"]

            for message in history

            if message["speaker"] == "user"

        ).lower()

        strengths = self._strengths(joined)

        weaknesses = self._weaknesses(joined)

        recommendations = self._recommendations(
            weaknesses
        )

        if score >= 90:

            difficulty = "Expert"

        elif score >= 80:

            difficulty = "Hard"

        elif score >= 70:

            difficulty = "Medium"

        else:

            difficulty = "Easy"

        return {

            "strengths": strengths,

            "weaknesses": weaknesses,

            "recommendations": recommendations,

            "next_difficulty": difficulty

        }

    ###########################################################
    # SCORE
    ###########################################################

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

        # Participation

        if len(user_messages) >= 3:

            score += 15

        elif len(user_messages) == 2:

            score += 10

        else:

            score += 5

        # Explanation

        if total_words >= 20:

            score += 5

        if total_words >= 50:

            score += 5

        if total_words >= 100:

            score += 5

        # Evidence

        evidence = [

            "because",
            "example",
            "examples",
            "research",
            "study",
            "statistics",
            "evidence",
            "data"

        ]

        score += min(

            sum(
                1
                for word in evidence
                if word in joined
            ) * 2,

            8

        )

        # Rebuttal

        rebuttal = [

            "however",
            "although",
            "while",
            "yet",
            "despite"

        ]

        score += min(

            sum(
                1
                for word in rebuttal
                if word in joined
            ) * 2,

            7

        )

        # Conclusion

        if any(

            word in joined

            for word in [

                "therefore",

                "overall",

                "thus",

                "finally"

            ]

        ):

            score += 5

        score += (total_words % 5) - 2

        return max(
            55,
            min(score, 95)
        )

    ###########################################################
    # STRENGTHS
    ###########################################################

    def _strengths(
        self,
        text
    ):

        strengths = []

        if "because" in text or "therefore" in text:

            strengths.append(
                "Logical Reasoning"
            )

        if any(

            word in text

            for word in [

                "research",

                "statistics",

                "data",

                "example"

            ]

        ):

            strengths.append(
                "Supporting Evidence"
            )

        if any(

            word in text

            for word in [

                "however",

                "although",

                "while"

            ]

        ):

            strengths.append(
                "Counter Arguments"
            )

        if len(text.split()) > 90:

            strengths.append(
                "Detailed Explanation"
            )

        if len(strengths) < 3:

            strengths.append(
                "Clear Communication"
            )

        return strengths[:3]

    ###########################################################
    # WEAKNESSES
    ###########################################################

    def _weaknesses(
        self,
        text
    ):

        weaknesses = []

        if "example" not in text:

            weaknesses.append(
                "Supporting Evidence"
            )

        if "however" not in text:

            weaknesses.append(
                "Counter Arguments"
            )

        if len(text.split()) < 60:

            weaknesses.append(
                "Detailed Explanation"
            )

        if "therefore" not in text and "overall" not in text:

            weaknesses.append(
                "Conclusion"
            )

        return weaknesses[:3]

    ###########################################################
    # RECOMMENDATIONS
    ###########################################################

    def _recommendations(
        self,
        weaknesses
    ):

        mapping = {

            "Supporting Evidence":

                "Use statistics, research papers, or real-life examples.",

            "Counter Arguments":

                "Address the opponent's viewpoint before defending your own.",

            "Detailed Explanation":

                "Expand every argument with additional reasoning and examples.",

            "Conclusion":

                "Finish your debate with a strong concluding statement."

        }

        recommendations = []

        for weakness in weaknesses:

            if weakness in mapping:

                recommendations.append(
                    mapping[weakness]
                )

        recommendations.append(

            "Practice speaking confidently and maintain a logical flow throughout the debate."

        )

        return recommendations