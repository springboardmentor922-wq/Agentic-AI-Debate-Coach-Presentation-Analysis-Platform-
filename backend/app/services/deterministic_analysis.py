"""
Deterministic, rule-based NLP analysis engine (Milestone 2 fix).

This module is the last line of defense: it is only used when EVERY
configured LLM provider (see app/services/llm_provider.py) has failed for a
given call. Its job is to guarantee that the platform NEVER returns empty
placeholders, "0/10" scores, or "not enough data" messages when a real
transcript exists — every score, list, and piece of feedback below is
computed directly from the actual text using simple, transparent heuristics
(keyword/pattern matching, sentence structure, lexical diversity, etc.).

None of this requires model training — it is intentionally simple so it is
fast, deterministic (same input -> same output), and easy to audit.
"""
from __future__ import annotations

import re
from collections import Counter

from app.schemas.fallacy import ArgumentAnalysis, FallacyReport, DebateFeedbackReport
from app.schemas.debate_simulation import PresentationScore, CounterargumentBundle, SpeechMetrics

# --------------------------------------------------------------------------
# Shared helpers
# --------------------------------------------------------------------------

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")

EVIDENCE_MARKERS = [
    "study", "studies", "research", "researchers", "data", "statistic", "statistics",
    "survey", "report", "according to", "evidence", "percent", "%", "found that",
    "shows that", "demonstrates", "expert", "experts", "source", "published",
    "peer-reviewed", "journal", "university", "professor", "dr.", "in fact",
]

CLAIM_MARKERS = [
    "i believe", "i think", "i argue", "we should", "must", "should", "clearly",
    "it is clear", "therefore", "thus", "this proves", "this shows", "in conclusion",
    "the fact is", "obviously", "undeniably", "we need to", "it follows that",
]

HEDGE_WORDS = ["maybe", "perhaps", "might", "could be", "possibly", "somewhat", "i guess"]

CONNECTOR_WORDS = [
    "because", "therefore", "thus", "since", "consequently", "as a result",
    "however", "although", "moreover", "furthermore", "in addition", "on the other hand",
]


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_SPLIT_RE.split(text.strip()) if s.strip()]


def _words(text: str) -> list[str]:
    return re.findall(r"\b[\w']+\b", text.lower())


def _count_markers(text_lower: str, markers: list[str]) -> int:
    return sum(text_lower.count(m) for m in markers)


def _clamp(value: float, lo: float = 0.0, hi: float = 10.0) -> float:
    return max(lo, min(hi, value))


# --------------------------------------------------------------------------
# Module 4 — Argument Analysis (deterministic fallback)
# --------------------------------------------------------------------------

def analyze_argument_deterministic(text: str) -> ArgumentAnalysis:
    text = (text or "").strip()
    if not text:
        return ArgumentAnalysis(
            claims=[], evidence=[], reasoning_quality="No text was provided to analyze.",
            clarity_score=0, relevance_score=0, evidence_strength_score=0,
            logical_consistency_score=0, persuasiveness_score=0, reasoning_quality_score=0,
            overall_argument_score=0, feedback="No text was provided for this turn.",
        )

    sentences = _sentences(text)
    words = _words(text)
    text_lower = text.lower()
    word_count = max(len(words), 1)

    # --- Claims: sentences containing a claim marker, or the longest
    # declarative sentences if no explicit markers are present ---
    claims = [s for s in sentences if any(m in s.lower() for m in CLAIM_MARKERS)]
    if not claims:
        claims = sorted(sentences, key=len, reverse=True)[: min(3, len(sentences))]

    # --- Evidence: sentences containing an evidence marker or a number ---
    evidence = [
        s for s in sentences
        if any(m in s.lower() for m in EVIDENCE_MARKERS) or re.search(r"\d", s)
    ]

    evidence_hits = _count_markers(text_lower, EVIDENCE_MARKERS)
    connector_hits = _count_markers(text_lower, CONNECTOR_WORDS)
    hedge_hits = _count_markers(text_lower, HEDGE_WORDS)
    unique_word_ratio = len(set(words)) / word_count

    # Clarity: rewards moderate sentence length and lexical variety, penalizes
    # run-on sentences and excessive repetition.
    avg_sentence_len = word_count / max(len(sentences), 1)
    clarity = 7.5 - abs(avg_sentence_len - 18) * 0.15 + unique_word_ratio * 2
    clarity = _clamp(clarity)

    # Relevance: proxy via how much of the text is made up of on-topic claim
    # sentences relative to total length.
    relevance = 5.0 + min(3.0, len(claims) * 0.8) - hedge_hits * 0.3
    relevance = _clamp(relevance)

    # Evidence strength: scales with density of evidence markers/sentences.
    evidence_strength = 2.5 + min(6.5, len(evidence) * 1.5 + evidence_hits * 0.5)
    evidence_strength = _clamp(evidence_strength)

    # Logical consistency: rewards explicit logical connectors, penalizes
    # heavy hedging (a proxy for an unclear/uncommitted line of reasoning).
    logical_consistency = 5.5 + min(3.5, connector_hits * 0.9) - hedge_hits * 0.4
    logical_consistency = _clamp(logical_consistency)

    # Persuasiveness: combination of evidence + claims + assertive language,
    # penalized by excessive hedging.
    persuasiveness = 4.0 + min(3.0, len(claims) * 0.6) + min(2.5, evidence_hits * 0.4) - hedge_hits * 0.3
    persuasiveness = _clamp(persuasiveness)

    # Reasoning quality: rewards presence of both a claim AND supporting
    # evidence together with connective logic tying them.
    has_claim_and_evidence = 1.0 if (claims and evidence) else 0.0
    reasoning_quality_score = 4.0 + has_claim_and_evidence * 2.5 + min(2.5, connector_hits * 0.6) - hedge_hits * 0.3
    reasoning_quality_score = _clamp(reasoning_quality_score)

    overall = round(
        (clarity + relevance + evidence_strength + logical_consistency + persuasiveness + reasoning_quality_score) / 6,
        1,
    )

    if evidence and connector_hits:
        reasoning_note = (
            "The reasoning chain connects stated evidence to the claim using explicit "
            "logical connectors, which supports a coherent argument."
        )
    elif evidence:
        reasoning_note = (
            "Evidence is present but isn't tied to the claim with explicit logical "
            "connectors (e.g. 'because', 'therefore') — the inferential link could be clearer."
        )
    elif claims:
        reasoning_note = (
            "A clear claim is made, but it isn't backed by specific evidence or data in this turn."
        )
    else:
        reasoning_note = (
            "No clearly stated claim or supporting evidence was detected in this turn."
        )

    feedback_bits = []
    if not evidence:
        feedback_bits.append("add concrete evidence (data, studies, or named sources) to support your claim")
    if hedge_hits > 1:
        feedback_bits.append("reduce hedging language to sound more confident and assertive")
    if connector_hits == 0:
        feedback_bits.append("use explicit logical connectors (e.g. 'because', 'therefore') to link evidence to your claim")
    if not feedback_bits:
        feedback_bits.append("keep reinforcing your claims with even more specific evidence to stay persuasive")
    feedback = "To strengthen this turn, " + "; ".join(feedback_bits) + "."

    return ArgumentAnalysis(
        claims=claims or [text[:160]],
        evidence=evidence,
        reasoning_quality=reasoning_note,
        clarity_score=round(clarity, 1),
        relevance_score=round(relevance, 1),
        evidence_strength_score=round(evidence_strength, 1),
        logical_consistency_score=round(logical_consistency, 1),
        persuasiveness_score=round(persuasiveness, 1),
        reasoning_quality_score=round(reasoning_quality_score, 1),
        overall_argument_score=overall,
        feedback=feedback,
    )


# --------------------------------------------------------------------------
# Module 5 — Logical Fallacy Detection (deterministic fallback)
# --------------------------------------------------------------------------

_FALLACY_PATTERNS: list[tuple[str, list[str], str]] = [
    (
        "Ad Hominem",
        [r"\byou'?re (?:just |only |too )*(stupid|dumb|ignorant|naive|foolish)\b",
         r"\byou are (?:just |only |too )*(stupid|dumb|ignorant|naive|foolish)\b",
         r"\byou (obviously|clearly) (don'?t|do not) know\b", r"\btypical (liberal|conservative|leftist|righty)\b"],
        "attacks the person or their character instead of addressing their argument",
    ),
    (
        "Straw Man",
        [r"\bso you'?re saying\b.*\b(should just|want to just|basically want)\b",
         r"\bwhat you'?re really saying is\b",
         r"\byou'?re basically (saying|arguing|claiming)\b.*\b(should|want|advocate)\b",
         r"\bso (basically|essentially) you (think|believe|want)\b.*\b(everyone|no one|nobody|everything)\b"],
        "misrepresents the opponent's actual position as a more extreme claim, then attacks that instead",
    ),
    (
        "False Dilemma",
        [r"\beither .+ or\b.*\bnothing\b", r"\bonly (two|2) (options|choices)\b",
         r"\byou'?re either .+ or\b"],
        "presents only two options when more possibilities actually exist",
    ),
    (
        "Slippery Slope",
        [r"\bwill (inevitably |eventually |completely )*(lead to|result in|cause|collapse|spiral into)\b",
         r"\bnext thing you know\b", r"\bif we allow .+ then .+ (eventually|inevitably)\b",
         r"\b(collapse|chaos|ruin|disaster)\b.*\bwithin a (decade|year|few years)\b"],
        "assumes one small step inevitably leads to an extreme outcome without justifying the chain of events",
    ),
    (
        "Appeal to Authority",
        [r"\b(trust me|believe me)\b.*\bi'?m (an? )?(expert|professional|doctor)\b",
         r"\bexperts (agree|say)\b.*\btherefore\b"],
        "relies on authority or expertise alone rather than the strength of the evidence itself",
    ),
    (
        "Circular Reasoning",
        [r"\bbecause (it|that'?s just|that is) (the way it is|how it works|true)\b"],
        "restates the claim as its own justification instead of offering independent support",
    ),
    (
        "Hasty Generalization",
        [r"\ball (\w+ )?(people|men|women|politicians|teenagers|students) (are|do|always|lie|cheat)\b",
         r"\b(all|every) (\w+ )?(politicians|people|men|women) always\b",
         r"\bevery (single )?(time|person|one)\b.*\balways\b",
         r"\bnever (works|happens|true)\b"],
        "draws a broad conclusion from limited or anecdotal examples",
    ),
    (
        "Red Herring",
        [r"\bwhat about\b.*\binstead\b", r"\bthat'?s not the (real|actual) issue\b"],
        "shifts attention away from the original point to an unrelated issue",
    ),
]


def detect_fallacy_deterministic(text: str, argument_analysis: ArgumentAnalysis | None = None) -> FallacyReport:
    text_lower = (text or "").lower()

    for fallacy_type, patterns, why in _FALLACY_PATTERNS:
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                offending = text[max(0, match.start() - 20): match.end() + 20].strip()
                severity = "medium"
                if argument_analysis and argument_analysis.evidence_strength_score < 3:
                    severity = "high"
                elif argument_analysis and argument_analysis.evidence_strength_score > 7:
                    severity = "low"
                return FallacyReport(
                    fallacy_detected=True,
                    fallacy_type=fallacy_type,
                    offending_text=offending or text[:80],
                    explanation=f"This statement {why}.",
                    severity=severity,
                    why_incorrect=f"The argument {why}, which breaks the logical link between evidence and conclusion.",
                    correction_suggestion=(
                        "Rephrase this point to directly address the evidence and reasoning, "
                        "rather than relying on the pattern flagged above."
                    ),
                    better_version=(
                        "Consider restating your point with specific supporting evidence and "
                        "without the flagged rhetorical pattern."
                    ),
                    credibility_assessment=(
                        "This weakens the credibility of the claim it supports until the "
                        "reasoning gap is addressed."
                    ),
                    confidence_score=0.62,
                )

    # No pattern matched — low-confidence "no fallacy" result (deterministic
    # keyword matching is inherently conservative/recall-limited, so we are
    # honest about that in the confidence score rather than claiming 0.0,
    # which would read as "could not check" instead of "checked, none found").
    return FallacyReport(
        fallacy_detected=False,
        explanation=(
            "No common logical fallacy patterns (ad hominem, false dilemma, slippery slope, "
            "appeal to authority, circular reasoning, hasty generalization, red herring) were "
            "detected in this text using rule-based pattern matching."
        ),
        confidence_score=0.55,
    )


# --------------------------------------------------------------------------
# Debate Feedback Report (deterministic fallback) — aggregates real per-turn
# argument_analysis + fallacy_report data already stored for the session.
# --------------------------------------------------------------------------

def generate_feedback_report_deterministic(topic: str, turns: list[dict]) -> DebateFeedbackReport:
    if not turns:
        return DebateFeedbackReport(
            strengths=[], weaknesses=[], missing_evidence=[], logical_issues=[],
            recommended_improvements=["Complete at least one debate turn to generate a report."],
            final_summary="No turns were recorded for this session.",
            overall_rating=0,
        )

    analyses = [t.get("argument_analysis") for t in turns if t.get("argument_analysis")]
    fallacies = [t.get("fallacy_report") for t in turns if t.get("fallacy_report")]

    def _avg(key: str) -> float:
        vals = [a[key] for a in analyses if a and key in a and a[key] is not None]
        return sum(vals) / len(vals) if vals else 5.0

    clarity = _avg("clarity_score")
    relevance = _avg("relevance_score")
    evidence_strength = _avg("evidence_strength_score")
    logical_consistency = _avg("logical_consistency_score")
    persuasiveness = _avg("persuasiveness_score")
    reasoning_quality = _avg("reasoning_quality_score")
    overall_argument = _avg("overall_argument_score")

    detected_fallacies = [f for f in fallacies if f and f.get("fallacy_detected")]
    fallacy_types = Counter(f.get("fallacy_type") for f in detected_fallacies if f.get("fallacy_type"))

    strengths, weaknesses, missing_evidence, logical_issues, improvements = [], [], [], [], []

    if clarity >= 6.5:
        strengths.append("Your points were expressed clearly and were easy to follow.")
    else:
        weaknesses.append("Some turns were difficult to follow — aim for shorter, more direct sentences.")
        improvements.append("Practice stating one clear claim per sentence before adding supporting detail.")

    if evidence_strength >= 6.0:
        strengths.append("You consistently backed claims with concrete evidence.")
    else:
        weaknesses.append("Several claims lacked strong supporting evidence.")
        improvements.append("Add specific data, studies, or named sources to strengthen your claims.")

    if logical_consistency >= 6.5:
        strengths.append("Your reasoning stayed internally consistent across turns.")
    else:
        weaknesses.append("Some turns contained logical gaps between evidence and conclusions.")
        improvements.append("Use explicit connectors ('because', 'therefore') to link evidence directly to claims.")

    if persuasiveness >= 6.5:
        strengths.append("Your arguments were persuasive and confidently delivered.")
    else:
        improvements.append("Reduce hedging language and lead with your strongest point first.")

    if not detected_fallacies:
        strengths.append("No logical fallacies were detected across your turns — solid reasoning discipline.")
    else:
        for ftype, count in fallacy_types.most_common(5):
            logical_issues.append(f"{ftype} detected {count} time{'s' if count != 1 else ''} across your turns.")
        improvements.append("Review the flagged fallacy types and practice rebuilding those points without them.")

    # Missing evidence: claims recorded without matching evidence in the same turn.
    for a in analyses:
        if a and a.get("claims") and not a.get("evidence"):
            claim_preview = a["claims"][0][:100]
            missing_evidence.append(f'Claim without supporting evidence: "{claim_preview}"')
    missing_evidence = missing_evidence[:5]
    if not missing_evidence:
        missing_evidence.append("No unsupported claims detected — evidence was provided consistently.")

    if not strengths:
        strengths.append("You completed the full debate session, which builds valuable practice reps.")
    if not weaknesses:
        weaknesses.append("No major weaknesses stood out — keep refining evidence variety and delivery.")
    if not improvements:
        improvements.append("Keep practicing with more debate topics to build consistency across formats.")

    rebuttal_effectiveness = _clamp((persuasiveness + logical_consistency) / 2)
    communication_skills = _clamp((clarity + persuasiveness) / 2)

    # --- Broader, curriculum-style learning recommendations (distinct from
    # the tactical, this-debate-specific `improvements` above) ---
    learning_recommendations = []
    if evidence_strength < 6.0:
        learning_recommendations.append(
            "Work through evidence-based argumentation drills to build a habit of citing sources."
        )
    if detected_fallacies:
        top_fallacy = fallacy_types.most_common(1)[0][0]
        learning_recommendations.append(
            f"Review the '{top_fallacy}' module in the Learning Hub, since it recurred this session."
        )
    if logical_consistency < 6.5:
        learning_recommendations.append(
            "Practice structuring arguments as evidence -> logical connector -> conclusion to tighten reasoning chains."
        )
    if clarity < 6.5 or persuasiveness < 6.0:
        learning_recommendations.append(
            "Complete a presentation/delivery module focused on concise, confident phrasing."
        )
    if not learning_recommendations:
        learning_recommendations.append(
            "Explore advanced debate formats (e.g. Parliamentary or Policy) to keep building on this strong foundation."
        )

    overall_rating = round(
        (
            overall_argument * 0.30
            + evidence_strength * 0.20
            + logical_consistency * 0.20
            + rebuttal_effectiveness * 0.15
            + communication_skills * 0.15
        )
        / 10
        * 10,
        1,
    )
    # Small penalty for fallacies detected, floor at 1.0 so a real session
    # with recorded turns is never scored 0/10.
    overall_rating = _clamp(overall_rating - len(detected_fallacies) * 0.3, lo=1.0)

    final_summary = (
        f'Across {len(turns)} turn{"s" if len(turns) != 1 else ""} on "{topic}", this debater scored an average '
        f'argument quality of {round(overall_argument, 1)}/10 with '
        f'{"no" if not detected_fallacies else len(detected_fallacies)} logical fallac{"ies" if len(detected_fallacies) != 1 else "y"} detected. '
        f'{"Evidence use and logical consistency were particular strengths." if evidence_strength >= 6 and logical_consistency >= 6 else "The clearest path to improvement is strengthening evidence use and logical consistency."}'
    )

    return DebateFeedbackReport(
        strengths=strengths,
        weaknesses=weaknesses,
        missing_evidence=missing_evidence,
        logical_issues=logical_issues or ["No recurring logical issues detected across this session."],
        recommended_improvements=improvements,
        learning_recommendations=learning_recommendations,
        final_summary=final_summary,
        overall_rating=overall_rating,
        argument_quality=round(overall_argument, 1),
        evidence_usage=round(evidence_strength, 1),
        logical_consistency=round(logical_consistency, 1),
        rebuttal_effectiveness=round(rebuttal_effectiveness, 1),
        communication_skills=round(communication_skills, 1),
    )


# --------------------------------------------------------------------------
# Presentation scoring (deterministic fallback) — extends the pacing-only
# fallback with confidence/clarity/engagement heuristics from the transcript.
# --------------------------------------------------------------------------

def score_presentation_deterministic(transcript: str, metrics: SpeechMetrics) -> PresentationScore:
    text_lower = (transcript or "").lower()
    words = _words(transcript)
    word_count = max(len(words), 1)
    sentences = _sentences(transcript)

    filler_ratio = metrics.filler_word_count / word_count
    hedge_hits = _count_markers(text_lower, HEDGE_WORDS)

    confidence = 85 - filler_ratio * 400 - hedge_hits * 3
    confidence = max(0.0, min(100.0, confidence))

    unique_ratio = len(set(words)) / word_count
    avg_sentence_len = word_count / max(len(sentences), 1)
    clarity = 80 - abs(avg_sentence_len - 16) * 1.2 + unique_ratio * 20
    clarity = max(0.0, min(100.0, clarity))

    connector_hits = _count_markers(text_lower, CONNECTOR_WORDS)
    engagement = 70 + min(20.0, connector_hits * 3) - filler_ratio * 200
    engagement = max(0.0, min(100.0, engagement))

    pacing = max(0.0, 100.0 - abs(metrics.words_per_minute - 145) * 1.2)

    overall = round((confidence + clarity + engagement + pacing) / 4, 1)

    feedback_bits = []
    if filler_ratio > 0.03:
        feedback_bits.append("cut down on filler words ('um', 'like', 'you know') to sound more confident")
    if metrics.words_per_minute < 110:
        feedback_bits.append("pick up your pace slightly — you're speaking slower than the ideal 130-160 wpm range")
    elif metrics.words_per_minute > 175:
        feedback_bits.append("slow down slightly — you're speaking faster than the ideal 130-160 wpm range")
    if not feedback_bits:
        feedback_bits.append("keep up the strong pacing and clarity you demonstrated in this turn")
    feedback = "Based on your measured delivery metrics, " + "; ".join(feedback_bits) + "."

    # Fluency: penalize fillers and very short/choppy sentences (repetition/false-start proxy).
    fluency = 90 - filler_ratio * 350 - max(0, (12 - avg_sentence_len)) * 1.5
    fluency = max(0.0, min(100.0, fluency))

    # Pronunciation: no audio-level phonetic analysis is available in the deterministic
    # path, so this is a conservative, transcript-only proxy (word complexity/flow) —
    # deliberately capped below 90 so it never overstates confidence in a number this path can't truly measure.
    long_word_ratio = sum(1 for w in words if len(w) > 8) / word_count
    pronunciation = min(88.0, 65 + long_word_ratio * 60 - filler_ratio * 100)
    pronunciation = max(0.0, pronunciation)

    # Grammar: crude proxy from sentence structure variety and length consistency.
    grammar = 75 + unique_ratio * 15 - abs(avg_sentence_len - 16) * 0.8
    grammar = max(0.0, min(100.0, grammar))

    # Persuasion: rewards connector/transition usage and evidence-like structure, same
    # signal already used for engagement but weighted toward argumentative structure.
    persuasion = 65 + min(25.0, connector_hits * 4) - filler_ratio * 150
    persuasion = max(0.0, min(100.0, persuasion))

    strengths = []
    weaknesses = []
    suggestions = []
    if filler_ratio <= 0.02:
        strengths.append("Minimal filler word usage — delivery reads as polished")
    else:
        weaknesses.append("Frequent filler words reduce perceived confidence")
        suggestions.append("Practice pausing silently instead of using filler words like 'um' or 'like'")
    if 130 <= metrics.words_per_minute <= 160:
        strengths.append("Speaking pace is in the ideal range for audience comprehension")
    else:
        weaknesses.append("Speaking pace is outside the ideal 130-160 wpm range")
        suggestions.append("Record yourself and compare your pace against the 130-160 wpm target")
    if connector_hits >= 2:
        strengths.append("Good use of logical connectors to structure the argument")
    else:
        weaknesses.append("Argument structure could be clearer with more transition phrases")
        suggestions.append("Use connectors like 'furthermore', 'however', and 'therefore' to link ideas")
    if not strengths:
        strengths.append("Completed the full turn without major disruptions")
    if not suggestions:
        suggestions.append("Keep reinforcing the strong habits already shown in this turn")

    return PresentationScore(
        confidence_score=round(confidence, 1),
        clarity_score=round(clarity, 1),
        engagement_score=round(engagement, 1),
        pacing_score=round(pacing, 1),
        fluency_score=round(fluency, 1),
        pronunciation_score=round(pronunciation, 1),
        grammar_score=round(grammar, 1),
        persuasion_score=round(persuasion, 1),
        overall_score=overall,
        strengths=strengths,
        weaknesses=weaknesses,
        improvement_suggestions=suggestions,
        feedback=feedback,
    )


# --------------------------------------------------------------------------
# Counterargument generation (deterministic fallback)
# --------------------------------------------------------------------------

def generate_counterarguments_deterministic(text: str, topic: str | None = None) -> CounterargumentBundle:
    analysis = analyze_argument_deterministic(text)
    claims = analysis.claims[:3] or [text[:120]]
    has_evidence = bool(analysis.evidence)

    counterarguments = [
        f'One could challenge the claim "{c[:90]}" by asking whether the underlying assumption always holds.'
        for c in claims
    ]
    alternative_perspectives = [
        f"An opposing framing of {topic or 'this topic'} could weigh the trade-offs differently, "
        "prioritizing a different stakeholder group's interests.",
        "Consider how this argument would hold up under a purely cost-benefit analysis versus a rights-based one.",
    ]
    opponent_questions = [
        f'What specific evidence supports the claim "{c[:80]}"?' for c in claims[:2]
    ] or ["What is the strongest evidence behind your main claim?"]

    missing_evidence = (
        ["No specific data, studies, or sources were cited to support the main claim(s)."]
        if not has_evidence
        else []
    )
    weak_claims = [c for c in claims if len(c.split()) < 8] or (
        [] if has_evidence else ["The main claim is asserted without qualification or supporting detail."]
    )

    improvement_suggestions = [
        "Strengthen the argument with a named source, statistic, or concrete example.",
        "Anticipate the opponent's strongest counterpoint and address it preemptively.",
    ]
    logical_improvements = [
        "Make the link between evidence and conclusion explicit using connectors like 'because' or 'therefore'.",
    ]
    evidence_recommendations = [
        "Cite a specific study, statistic, or expert source relevant to the claim.",
        "Use a concrete real-world example to illustrate the abstract point.",
    ]
    practical_suggestions = [
        "Lead with your strongest point rather than burying it mid-argument.",
        "Pause briefly after key claims to let them land with the audience/judge.",
    ]

    return CounterargumentBundle(
        counterarguments=counterarguments,
        alternative_perspectives=alternative_perspectives,
        opponent_questions=opponent_questions,
        missing_evidence=missing_evidence or ["Evidence was present, but consider adding more variety of sources."],
        weak_claims=weak_claims or ["No especially weak claims detected — keep reinforcing with evidence."],
        improvement_suggestions=improvement_suggestions,
        logical_improvements=logical_improvements,
        evidence_recommendations=evidence_recommendations,
        practical_suggestions=practical_suggestions,
    )


# --------------------------------------------------------------------------
# AI opponent rebuttal (deterministic fallback) — template-based, but still
# reacts to the user's actual text (claims extracted, fallacy flag, format).
# --------------------------------------------------------------------------

def generate_opponent_rebuttal_deterministic(
    topic: str,
    debate_format: str,
    user_text: str,
    fallacy_flag: dict | None = None,
    ai_personality: str | None = None,
) -> str:
    analysis = analyze_argument_deterministic(user_text)
    claim = (analysis.claims[0] if analysis.claims else user_text)[:100]

    opener = {
        "oxford": "The opposition rises to respond.",
        "parliamentary": "The Honorable Member's point, while spirited, invites scrutiny.",
        "policy": "That framing overlooks a key flaw in the proposed plan.",
        "public_forum": "That's an interesting point, but consider the other side.",
        "popularity": "I hear you — but here's why the audience should think twice.",
        "group_debate": "Building on my team's case, I'd push back on that point.",
    }.get(debate_format, "I see your point, but I'd push back on it.")

    fallacy_note = ""
    if fallacy_flag and fallacy_flag.get("fallacy_detected"):
        fallacy_note = (
            f" I'd also note that framing leans on a {fallacy_flag.get('fallacy_type', 'logical')} pattern, "
            "which weakens the case somewhat."
        )

    evidence_challenge = (
        "What specific evidence backs that up?"
        if not analysis.evidence
        else "Even with that evidence, the conclusion doesn't necessarily follow — have you considered the alternative explanation?"
    )

    return (
        f"{opener} Regarding \"{claim}\" on the topic of {topic}: {evidence_challenge}{fallacy_note} "
        "(This response was generated by the deterministic fallback opponent because AI providers "
        "were temporarily unavailable — your turn has been recorded normally.)"
    )
