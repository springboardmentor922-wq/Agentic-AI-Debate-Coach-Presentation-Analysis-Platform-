from typing import List, Optional

from pydantic import BaseModel, Field


class ArgumentScore(BaseModel):
    """Structured output for the Argument Analysis Engine (Milestone 2, Module 4).

    Covers both the extraction side (main claim, evidence offered -- what the
    argument IS) and the evaluation side (the five scored criteria named in
    the spec -- how STRONG the argument is).
    """

    # --- Extraction: Argument extraction + Claim identification ---
    main_claim: str = Field(
        description="The single core claim or position being argued, in one clear sentence."
    )
    evidence_offered: List[str] = Field(
        default_factory=list,
        description=(
            "Specific facts, data, examples, or reasons the speaker actually gave to "
            "support the claim. Empty list if the statement is a bare assertion with "
            "no support offered."
        ),
    )
    evidence_present: bool = Field(
        description="True if any real evidence/reasoning was offered, false if it's a bare assertion."
    )

    # --- Evaluation: the five criteria named in the spec ---
    clarity: int = Field(ge=0, le=100, description="How clear and well-organized the statement is.")
    relevance: int = Field(ge=0, le=100, description="How directly the statement addresses the debate topic.")
    evidence_strength: int = Field(
        ge=0, le=100, description="How well the claim is backed by facts, data, or concrete examples."
    )
    logical_consistency: int = Field(
        ge=0, le=100, description="How internally consistent and free of contradictions the reasoning is."
    )
    persuasiveness: int = Field(ge=0, le=100, description="How compelling the overall argument is.")
    reasoning_notes: Optional[str] = Field(
        default=None,
        description="One sentence on the quality of the reasoning process itself (e.g. sound deduction vs weak inference).",
    )

    overall_score: int = Field(ge=0, le=100, description="Weighted composite of the five scored criteria above.")
    feedback: Optional[str] = Field(
        default=None,
        description="One or two sentences of constructive, specific feedback on how to strengthen this argument.",
    )