"""
The Adjudicator AI Agent.

Implements the Logical Fallacy Detection Engine (Module 5) and the
Argument Analysis Engine (Module 4) as described in Milestone 2.

Architecture:
  Schema Layer      -> app/schemas/fallacy.py (Pydantic models)
  Provider Layer    -> app/services/llm_provider.py (Google Gemini -> fallback chain)
  Deterministic Layer -> app/services/deterministic_analysis.py (rule-based, used only if
                          every configured LLM provider fails)
  API Layer         -> app/routers/analysis.py
"""
 
import logging

from app.schemas.fallacy import FallacyReport, ArgumentAnalysis, DebateFeedbackReport
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError
from app.services import deterministic_analysis as det

logger = logging.getLogger(__name__)

FALLACY_SYSTEM_PROMPT = """You are an elite, impartial debate adjudicator and logic professor.
Your job is to act as the quality-control layer downstream of the Argument Analysis
Engine: you are given the debater's raw utterance AND the structured argument
analysis already extracted from it (claims, evidence, and per-criterion scores).
Use that structured analysis as context — a claim already flagged as weakly
supported by low evidence_strength_score is a strong signal to look for Hasty
Generalization or Appeal to Authority there, for example — then inspect the
actual text for whether it contains a logical fallacy.

Supported fallacy types you must check for:
- Ad Hominem
- Straw Man
- False Dilemma
- Slippery Slope
- Appeal to Authority
- Circular Reasoning
- Hasty Generalization
- Red Herring

Rules:
1. If no fallacy exists, set fallacy_detected to false and leave the other fields null
   (confidence_score should reflect your confidence that NO fallacy is present).
2. If a fallacy exists, quote the exact offending excerpt from the input text.
3. Give a short, educational explanation of *why* it is a fallacy (explanation).
4. Separately, give why_incorrect: identify the specific invalid premise or inference
   step that makes the reasoning fail — more technical/precise than explanation.
5. Rate severity as "low", "medium", or "high" based on how much this fallacy
   undermines the overall argument.
6. Give an actionable, one-sentence correction_suggestion that keeps the debater's
   intent but fixes the reasoning.
7. Give better_version: a full rewritten version of the offending text that
   preserves the debater's point but avoids the fallacy entirely.
8. Give credibility_assessment: 1 sentence on how much this fallacy damages the
   credibility of the claim it supports, given the argument analysis's own
   evidence_strength_score and logical_consistency_score for that same text.
9. Give confidence_score (0-1): how confident you are in this detection.
10. Be objective and consistent (you are being run at temperature 0).
"""

ARGUMENT_ANALYSIS_SYSTEM_PROMPT = """You are an elite, impartial debate coach and argument analyst.
Analyze the debater's text and extract:
- The core claims being made
- The evidence/support offered for those claims
- A short (1-2 sentence) assessment of the *reasoning quality*: whether the
  chain of reasoning from evidence to claim is sound, whether inferences are
  justified, and whether any logical gaps exist (this is distinct from
  logical_consistency_score, which only measures internal contradiction).

Then score the argument from 0-10 on each of:
- Clarity
- Relevance
- Evidence Strength
- Logical Consistency
- Persuasiveness
- Reasoning Quality (how sound and well-justified the reasoning chain is)

Compute overall_argument_score as the mean of all six sub-scores (0-10, one decimal place).
Finally, write 2-3 sentences of constructive, specific feedback the debater can act on.
Be objective and consistent (you are being run at temperature 0).
"""


async def detect_fallacy(text: str, argument_analysis: ArgumentAnalysis | None = None) -> FallacyReport:
    """Module 5 — Logical Fallacy Detection Engine.

    `argument_analysis` is the already-computed output of the Argument
    Analysis Engine (Module 4) for this same text. Passing it in implements
    the two-stage pipeline the spec requires: Module 4 extracts and scores
    the argument first, then Module 5 uses those structured results (not
    just the raw text again) as context for validating and flagging flaws.
    Kept optional so this function still works standalone (e.g. the
    /analysis/fallacy endpoint, which offers fallacy checking on its own).

    Falls back through the configured LLM provider chain, and finally to a
    deterministic rule-based detector, so a fallacy report is always
    produced — never an empty/placeholder result.
    """
    try:
        return await get_structured_result(
            system_prompt=FALLACY_SYSTEM_PROMPT,
            human_prompt=(
                "Debate utterance:\n\n{text}\n\n"
                "Argument Analysis Engine output for this same utterance (JSON, or "
                '"none available" if this fallacy check is being run standalone):\n{argument_analysis}'
            ),
            variables={
                "text": text,
                "argument_analysis": argument_analysis.model_dump_json() if argument_analysis else "none available",
            },
            output_schema=FallacyReport,
            temperature=0.0,
        )
    except AllProvidersUnavailableError:
        logger.warning("detect_fallacy: all LLM providers unavailable, using deterministic fallback")
        return det.detect_fallacy_deterministic(text, argument_analysis)
    except Exception:
        logger.exception("detect_fallacy: unexpected error, using deterministic fallback")
        return det.detect_fallacy_deterministic(text, argument_analysis)


async def analyze_argument(text: str) -> ArgumentAnalysis:
    """Module 4 — Argument Analysis Engine.

    Falls back through the configured LLM provider chain, and finally to a
    deterministic rule-based analyzer, so a meaningful, non-zero analysis is
    always produced.
    """
    try:
        return await get_structured_result(
            system_prompt=ARGUMENT_ANALYSIS_SYSTEM_PROMPT,
            human_prompt="Debate utterance:\n\n{text}",
            variables={"text": text},
            output_schema=ArgumentAnalysis,
            temperature=0.0,
        )
    except AllProvidersUnavailableError:
        logger.warning("analyze_argument: all LLM providers unavailable, using deterministic fallback")
        return det.analyze_argument_deterministic(text)
    except Exception:
        logger.exception("analyze_argument: unexpected error, using deterministic fallback")
        return det.analyze_argument_deterministic(text)


FEEDBACK_REPORT_SYSTEM_PROMPT = """You are an elite, impartial debate coach preparing a final
performance report for a debater at the end of a debate session.

You will be given the debate topic and a sequence of the debater's turns, each already
paired with its argument analysis and fallacy report from earlier in the session.

Synthesize ALL of this into one cohesive report:
- strengths: what the debater did well across the session (short bullets)
- weaknesses: what weakened their case (short bullets)
- missing_evidence: claims made without sufficient support (short bullets)
- logical_issues: fallacies/reasoning gaps found across the session (short bullets,
  reference the fallacy types actually detected where relevant)
- recommended_improvements: specific, actionable next steps for THIS debate (short bullets)
- learning_recommendations: broader curriculum/skill-building suggestions distinct from
  recommended_improvements — e.g. skill modules or drills to practice going forward (short bullets)
- final_summary: 2-3 sentences summarizing overall performance
- argument_quality (0-10): quality of claims, structure, and reasoning across the session
- evidence_usage (0-10): how well claims were backed by concrete evidence/data/sources
- logical_consistency (0-10): internal consistency of reasoning across turns
- rebuttal_effectiveness (0-10): how effectively the debater responded to the AI opponent's rebuttals
- communication_skills (0-10): clarity, persuasiveness, and delivery of the debater's points
- overall_rating: 0-10, computed as a weighted synthesis of the five sub-scores above plus
  overall argument quality — be fair and consistent (temperature 0).
"""


async def generate_feedback_report(topic: str, turns: list[dict]) -> DebateFeedbackReport:
    """
    Module: Debate Feedback Report Generation (Milestone 2). Aggregates every
    turn's stored argument analysis + fallacy report for a session and asks
    the LLM to synthesize one final coaching report.

    Falls back through the configured LLM provider chain, and finally to a
    deterministic aggregation of the session's real per-turn scores, so a
    completed session with recorded turns NEVER produces an empty report or
    an overall_rating of 0.
    """
    try:
        return await get_structured_result(
            system_prompt=FEEDBACK_REPORT_SYSTEM_PROMPT,
            human_prompt="Debate topic: {topic}\n\nSession turns (JSON):\n{turns}",
            variables={"topic": topic, "turns": turns},
            output_schema=DebateFeedbackReport,
            temperature=0.0,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_feedback_report: all LLM providers unavailable, using deterministic fallback")
        return det.generate_feedback_report_deterministic(topic, turns)
    except Exception:
        logger.exception("generate_feedback_report: unexpected error, using deterministic fallback")
        return det.generate_feedback_report_deterministic(topic, turns)
  