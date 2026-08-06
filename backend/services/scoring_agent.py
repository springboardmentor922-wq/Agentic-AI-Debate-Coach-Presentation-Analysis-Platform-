"""Argument Analysis Engine (Milestone 2, Module 4) + Performance Scoring
Engine (Milestone 3, Step 3).

Does two jobs in one structured call:
1. Extraction -- pulls out the main claim and any evidence actually offered.
2. Scoring -- rates the statement 0-100 on Clarity, Relevance, Evidence
   Strength, Logical Consistency, and Persuasiveness, then combines them
   into overall_score using the platform's exact weighted formula:
   30% Argument Quality + 20% Evidence Usage + 20% Logical Consistency +
   15% Rebuttal Effectiveness + 15% Communication Skills.

   Mapping used (since the five M2 criteria and M3's five weighted category
   names don't share identical labels):
     Argument Quality      -> relevance
     Evidence Usage        -> evidence_strength
     Logical Consistency   -> logical_consistency
     Rebuttal Effectiveness-> persuasiveness
     Communication Skills  -> clarity

Temperature is pinned to 0.0 so both extraction and scoring stay consistent
across repeated runs of the same argument.

Runs on Groq's free tier (no paid OpenAI credits required).
"""

from langchain_groq import ChatGroq

from schemas.scoring import ArgumentScore

SYSTEM_PROMPT = """You are an expert debate judge analyzing a single statement
from a live debate.

STEP 1 -- EXTRACTION:
- main_claim: state the single core claim or position being argued, in one clear sentence.
- evidence_offered: list any specific facts, data, examples, or concrete reasons the
  speaker actually gave to support the claim. If they only asserted an opinion with
  no support, return an empty list.
- evidence_present: true only if evidence_offered is non-empty and genuinely supports the claim.

STEP 2 -- SCORING (0-100 each):
- clarity: Is it clear and well-organized?
- relevance: Does it directly address the debate topic?
- evidence_strength: Is it backed by facts, data, or concrete examples (not just assertion)?
- logical_consistency: Is the reasoning internally consistent, free of contradictions or fallacies?
- persuasiveness: How compelling is it overall?
- reasoning_notes: one sentence on the quality of the reasoning process itself
  (e.g. "sound cause-and-effect reasoning" vs "relies on an unsupported leap").

STEP 3 -- COMPOSITE (the platform's official Performance Scoring formula):
Compute overall_score using this exact weighted formula:
  overall_score = round(
      0.30 * relevance +            # Argument Quality
      0.20 * evidence_strength +    # Evidence Usage
      0.20 * logical_consistency +  # Logical Consistency
      0.15 * persuasiveness +       # Rebuttal Effectiveness
      0.15 * clarity                # Communication Skills
  )

STEP 4 -- FEEDBACK:
One or two sentences of specific, constructive feedback on how to strengthen
this particular argument -- not generic advice.

Be a fair but demanding judge. A bare assertion with no support should score
low on evidence_strength even if it sounds confident. Short, sharp,
well-supported points can still score high even if brief.
"""

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)
        _llm = base.with_structured_output(ArgumentScore)
    return _llm


def score_argument(text: str) -> ArgumentScore:
    """Runs Argument Analysis (extraction + scoring) on a single debate statement."""
    llm = _get_structured_llm()
    result = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ]
    )
    if isinstance(result, ArgumentScore):
        return result
    return ArgumentScore(**result)