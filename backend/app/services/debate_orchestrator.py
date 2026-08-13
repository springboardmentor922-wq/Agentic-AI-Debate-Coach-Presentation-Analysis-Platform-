import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.agents.debate_graph import run_debate_turn
from app.db.mongodb import session_logs_collection, fallacy_analysis_collection
from app.models.debate_session import DebateSession
from app.models.debate_topic import DebateTopic
from app.models.user_profile import UserProfile
from app.schemas.debate import PersonaSettings
from app.schemas.scoring import ArgumentScore
from app.schemas.argument_analysis import ArgumentAnalysisResult
from app.services.fallacy_detection import analyze_for_fallacy
from app.services.argument_scoring import score_argument
from app.services.argument_analysis import analyze_argument
from app.services.counterargument_generation import generate_counterarguments, CounterargumentResult
from app.services.performance_scoring import compute_turn_performance_score
from app.models.debate_turn_score import DebateTurnScore


logger = logging.getLogger(__name__)


async def _get_last_ai_message(session_id: int) -> str:
    last_turn = await session_logs_collection.find_one(
        {"session_id": session_id, "event": "debate_turn"},
        sort=[("timestamp", -1)],
    )
    return last_turn["ai_text"] if last_turn else ""


async def process_debate_message(
    db: Session,
    session: DebateSession,
    user_text: str,
    persona: PersonaSettings,
    current_user_id: int,
    presentation_metrics: dict | None = None,
):
    topic = db.query(DebateTopic).filter(DebateTopic.id == session.topic_id).first()
    opponent_prior_text = await _get_last_ai_message(session.id)

    debate_format_value = session.debate_format.value if session.debate_format else None

    prior_turn_count = await session_logs_collection.count_documents(
        {"session_id": session.id, "event": "debate_turn"}
    )
    turn_number = prior_turn_count + 1
    max_turns = getattr(session, "max_turns", None) or 6

    # Run fallacy check + scoring on the learner's own turn (not the AI's) — this is what
    # the learner sees flagged in their own transcript bubble.
    fallacy_result = analyze_for_fallacy(user_text)

    try:
        score_result: ArgumentScore = score_argument(user_text, opponent_prior_text, debate_format_value)
    except Exception as e:
        logger.error(f"Argument scoring failed for session {session.id}: {e}")
        score_result = ArgumentScore(
            clarity=5,
            evidence_strength=5,
            rebuttal_quality=5,
            logical_consistency=5,
            overall_note="Scoring was unavailable for this turn due to a system issue.",
        )

    try:
        argument_analysis: ArgumentAnalysisResult | None = analyze_argument(user_text)
    except Exception as e:
        # Argument analysis is supplementary — the debate must continue even if this fails.
        logger.error(f"Argument analysis failed for session {session.id}: {e}")
        argument_analysis = None

    try:
        counterargument_result: CounterargumentResult | None = generate_counterarguments(
            user_argument=user_text,
            debate_topic=topic.title if topic else "the assigned motion",
            user_position=session.stance.value if session.stance else "for",
        )
    except Exception as e:
        # Real-time challenge generation is supplementary — the debate must continue even if this fails.
        logger.error(f"Counterargument generation failed for session {session.id}: {e}")
        counterargument_result = None

    # Composite performance score — pure aggregation of the outputs above, no new LLM call.
    performance_score = compute_turn_performance_score(
        fallacy_result, score_result, argument_analysis, counterargument_result, presentation_metrics
    )

    learner_profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user_id).first()
    )
    experience_level = learner_profile.experience_level.value if learner_profile else "beginner"

    try:
        ai_reply = run_debate_turn(
            session_id=session.id,
            topic_title=topic.title if topic else "the assigned motion",
            user_stance=session.stance.value if session.stance else "for",
            user_text=user_text,
            aggressiveness=persona.aggressiveness,
            sophistication=persona.sophistication,
            fallacy_rate=persona.fallacy_rate,
            debate_format=debate_format_value or "one_on_one",
            experience_level=experience_level,
            turn_number=turn_number,
            max_turns=max_turns,
        )
    except Exception as e:
        logger.error(f"AI turn generation failed for session {session.id}: {e}", exc_info=True)
        ai_reply = (
            "I need a moment to gather my thoughts — please go ahead and continue, "
            "or try resubmitting your last point."
        )

    now = datetime.now(timezone.utc)

    turn_doc = {
        "session_id": session.id,
        "event": "debate_turn",
        "turn_number": turn_number,
        "user_text": user_text,
        "ai_text": ai_reply,
        "fallacy_result": fallacy_result.model_dump(),
        "score_result": score_result.model_dump(),
        "argument_analysis": argument_analysis.model_dump() if argument_analysis else None,
        "counterarguments": counterargument_result.model_dump() if counterargument_result else None,
        "challenge_questions": counterargument_result.challenge_questions if counterargument_result else [],
        "performance_score": performance_score.model_dump(),
        "presentation_metrics": presentation_metrics,
        "timestamp": now,
    }
    await session_logs_collection.insert_one(turn_doc)

    if fallacy_result.fallacy_detected:
        await fallacy_analysis_collection.insert_one(
            {
                "user_id": current_user_id,
                "session_id": session.id,
                "input_text": user_text,
                "result": fallacy_result.model_dump(),
                "created_at": now,
                "reasoning_quality": fallacy_result.reasoning_analysis.quality,
                "credibility_score": fallacy_result.credibility_assessment.score,
            }
        )

    turn_score = DebateTurnScore(
        session_id=session.id,
        clarity=score_result.clarity,
        evidence_strength=score_result.evidence_strength,
        rebuttal_quality=score_result.rebuttal_quality,
        logical_consistency=score_result.logical_consistency,
        wpm=presentation_metrics.get("wpm") if presentation_metrics else None,
        filler_count=presentation_metrics.get("filler_count") if presentation_metrics else None,
        speech_duration=presentation_metrics.get("duration_seconds") if presentation_metrics else None,
        argument_strength_score=argument_analysis.argument_strength.score if argument_analysis and argument_analysis.argument_strength else None,
        relevance=argument_analysis.evaluation.relevance.score if argument_analysis and argument_analysis.evaluation else None,
        persuasiveness=argument_analysis.evaluation.persuasiveness.score if argument_analysis and argument_analysis.evaluation else None,
        argument_quality_score=performance_score.argument_quality.score,
        evidence_usage_score=performance_score.evidence_usage.score,
        logical_consistency_composite=performance_score.logical_consistency.score,
        rebuttal_effectiveness_score=performance_score.rebuttal_effectiveness.score,
        communication_skills_score=performance_score.communication_skills.score,
        debate_performance_score=performance_score.debate_performance_score,
        critical_thinking_score=performance_score.critical_thinking_score,
    )
    db.add(turn_score)
    db.commit()

    turn_count = prior_turn_count + 1

    return ai_reply, turn_count, fallacy_result, score_result, argument_analysis, counterargument_result