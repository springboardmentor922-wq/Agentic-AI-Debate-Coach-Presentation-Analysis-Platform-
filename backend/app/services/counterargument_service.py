"""
Counterargument Generation Engine (Module 6), expanded per Milestone 3 Part 6
to cover: counterarguments, alternative perspectives, questions an opponent
may ask, missing evidence, weak claims, and three flavors of improvement
suggestion (logical / evidence / practical). Uses the LLM provider fallback
chain (app/services/llm_provider.py) — no hardcoded output unless every
provider is unavailable, in which case a deterministic, transcript-derived
bundle is generated instead (app/services/deterministic_analysis.py).
"""
import logging

from app.schemas.debate_simulation import CounterargumentBundle
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError
from app.services import deterministic_analysis as det

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an elite debate coach acting as devil's advocate.
Given a debater's argument (and topic, if provided), produce a full
counter-analysis:

- counterarguments: direct rebuttals a skilled opponent would raise
- alternative_perspectives: other valid framings/angles on the issue
- opponent_questions: pointed questions an opponent may ask to expose gaps
- missing_evidence: claims made without sufficient supporting evidence
- weak_claims: specific claims that are logically or factually shaky
- improvement_suggestions: general ways to strengthen this argument
- logical_improvements: fixes to the reasoning/structure specifically
- evidence_recommendations: what kind of evidence/sources would help
- practical_suggestions: delivery/strategy advice for using this argument in a live debate

Each list should have 2-4 concise, specific items (not generic platitudes).
Be objective and consistent (temperature 0.2)."""


async def generate_counterarguments(text: str, topic: str | None = None) -> CounterargumentBundle:
    try:
        return await get_structured_result(
            system_prompt=SYSTEM_PROMPT,
            human_prompt="Topic: {topic}\n\nDebater's argument:\n{text}",
            variables={"topic": topic or "General debate", "text": text},
            output_schema=CounterargumentBundle,
            temperature=0.2,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_counterarguments: all LLM providers unavailable, using deterministic fallback")
        return det.generate_counterarguments_deterministic(text, topic)
    except Exception:
        logger.exception("generate_counterarguments: unexpected error, using deterministic fallback")
        return det.generate_counterarguments_deterministic(text, topic)
