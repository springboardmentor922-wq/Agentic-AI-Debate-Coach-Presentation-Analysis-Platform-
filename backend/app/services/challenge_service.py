import random

TOPICS = [
    {
        "topic": "Should AI Replace Teachers?",
        "difficulty": "Easy",
        "position": "Against"
    },
    {
        "topic": "Should College Education be Free?",
        "difficulty": "Medium",
        "position": "For"
    },
    {
        "topic": "Is Social Media Harmful?",
        "difficulty": "Medium",
        "position": "Against"
    },
    {
        "topic": "Should Plastic be Completely Banned?",
        "difficulty": "Easy",
        "position": "For"
    },
    {
        "topic": "Should Space Exploration Receive More Funding?",
        "difficulty": "Hard",
        "position": "For"
    }
]


def get_daily_challenge():

    challenge = random.choice(TOPICS)

    challenge["estimated_time"] = "8 Minutes"

    challenge["reason"] = (
        "Today's challenge focuses on improving your reasoning and rebuttal skills."
    )

    return challenge
