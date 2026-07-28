from sqlalchemy.orm import Session

from ..agents.auditor_agent import analyze_argument
from ..agents.opponent_agent import generate_counterargument
from ..agents.feedback_agent import generate_feedback

from ..models.debate_analysis import DebateAnalysis


def calculate_score(feedback):

    return round(
        (
            feedback["clarity_score"] +
            feedback["logic_score"] +
            feedback["persuasiveness_score"] +
            feedback["grammar_score"]
        ) / 4,
        1
    )


def analyze_debate(argument: str, db: Session):

    fallacy = analyze_argument(argument)

    counter = generate_counterargument(argument)

    feedback = generate_feedback(argument)

    overall_score = calculate_score(feedback)

    analysis = DebateAnalysis(
        argument=argument,
        overall_score=overall_score,
        fallacy_type=fallacy["fallacy_type"],
        explanation=fallacy["explanation"],
        counter_argument=counter["counterargument"],
        feedback="\n".join(feedback["feedback"])
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "overall_score": overall_score,
        "fallacy_analysis": fallacy,
        "counter_argument": counter,
        "feedback": feedback
    }