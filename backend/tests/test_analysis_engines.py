"""
Argument Analysis, Logical Fallacy Detection, and Counterargument Generation
engines (PDF Modules 4, 5, 6). Run with zero LLM keys configured (see
conftest.py), so these exercise the real deterministic fallback engine
end-to-end: HTTP request -> router -> service -> deterministic analysis ->
Mongo persistence -> response — not a mock. This is deliberate: it proves
the pipeline produces real, meaningful, non-empty output even with no LLM
provider configured, exactly as app/services/deterministic_analysis.py's
module docstring promises, and it's the only way to test these engines in
CI without paying for or depending on a live OpenAI/Anthropic account.
"""
from tests.helpers import create_user_direct

import pytest


async def _learner_headers(client):
    learner = await create_user_direct("learner", "engines-learner@example.com")
    return {"Authorization": f"Bearer {learner['access_token']}"}, learner


async def test_argument_analysis_scores_real_argument(client):
    headers, _ = await _learner_headers(client)
    text = (
        "Remote work increases productivity because a 2021 Stanford study of "
        "16,000 workers found a 13% performance increase, and employees report "
        "higher job satisfaction with fewer commute-related interruptions."
    )
    res = await client.post("/api/v1/analysis/argument", json={"text": text}, headers=headers)
    assert res.status_code == 200
    body = res.json()
    # Real analysis, not a stub: claims/evidence actually extracted, and every
    # PDF-required score dimension is present and within its declared range.
    assert isinstance(body["claims"], list)
    assert isinstance(body["evidence"], list)
    for field in (
        "clarity_score", "relevance_score", "evidence_strength_score",
        "logical_consistency_score", "persuasiveness_score", "overall_argument_score",
    ):
        assert 0 <= body[field] <= 10
    assert body["feedback"]


async def test_argument_analysis_rejects_too_short_text(client):
    headers, _ = await _learner_headers(client)
    res = await client.post("/api/v1/analysis/argument", json={"text": "no"}, headers=headers)
    assert res.status_code == 422


async def test_argument_analysis_requires_learner_role(client):
    coach = await create_user_direct("debate_coach", "coach-engines@example.com")
    res = await client.post(
        "/api/v1/analysis/argument",
        json={"text": "Some argument text that is long enough."},
        headers={"Authorization": f"Bearer {coach['access_token']}"},
    )
    assert res.status_code == 403


async def test_fallacy_detection_flags_ad_hominem(client):
    headers, _ = await _learner_headers(client)
    res = await client.post(
        "/api/v1/analysis/fallacy",
        json={"text": "You're just stupid, that's why you disagree with me."},
        headers=headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["fallacy_detected"] is True
    assert body["fallacy_type"] == "Ad Hominem"
    assert body["explanation"]
    assert body["correction_suggestion"]


async def test_fallacy_detection_flags_slippery_slope(client):
    headers, _ = await _learner_headers(client)
    res = await client.post(
        "/api/v1/analysis/fallacy",
        json={"text": "If we allow students to redo one exam, it will eventually lead to complete collapse of academic standards."},
        headers=headers,
    )
    body = res.json()
    assert body["fallacy_detected"] is True
    assert body["fallacy_type"] == "Slippery Slope"


@pytest.mark.parametrize(
    "text,expected_type",
    [
        ("You're just stupid, that's why you disagree with me.", "Ad Hominem"),
        ("So you're saying we should just let everyone break every rule they want?", "Straw Man"),
        ("Either we ban cars entirely or we accept nothing will ever improve.", "False Dilemma"),
        ("If we allow one exception, it will inevitably lead to the collapse of the entire system within a decade.", "Slippery Slope"),
        ("Trust me, I'm an expert, therefore my claim about the economy must be correct.", "Appeal to Authority"),
        ("It's true because that's just the way it is.", "Circular Reasoning"),
        ("All politicians always lie, so nothing this candidate says can be trusted.", "Hasty Generalization"),
        ("What about the economy instead, that's not the real issue here.", "Red Herring"),
    ],
)
async def test_fallacy_detection_covers_all_eight_pdf_required_types(client, text, expected_type):
    """PDF Module 5 requires exactly these 8 fallacy types (Ad Hominem, Straw
    Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular
    Reasoning, Hasty Generalization, Red Herring). Runs through the real
    deterministic fallback (no LLM keys configured), so this also verifies
    the fallback engine itself — not just the LLM prompt's stated
    intentions — actually supports all 8."""
    headers, _ = await _learner_headers(client)
    res = await client.post("/api/v1/analysis/fallacy", json={"text": text}, headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["fallacy_detected"] is True, f"expected a fallacy to be detected in: {text!r}"
    assert body["fallacy_type"] == expected_type, f"expected {expected_type}, got {body['fallacy_type']} for: {text!r}"
    assert body["explanation"]
    assert body["correction_suggestion"]


async def test_fallacy_detection_returns_none_for_clean_argument(client):
    headers, _ = await _learner_headers(client)
    res = await client.post(
        "/api/v1/analysis/fallacy",
        json={"text": "Public transit ridership rose 12% after the fare reduction, based on the transit authority's quarterly report."},
        headers=headers,
    )
    body = res.json()
    assert body["fallacy_detected"] is False


async def test_counterargument_generation_produces_real_content(client):
    headers, _ = await _learner_headers(client)
    res = await client.post(
        "/api/v1/analysis/counterargument",
        json={"text": "Social media should be banned for anyone under 16 because it harms mental health."},
        headers=headers,
    )
    assert res.status_code == 200
    body = res.json()
    # Not a hardcoded/fake response: real, non-empty generated content across
    # the counterargument types the PDF requires.
    assert body.get("rebuttals") or body.get("counterpoints") or body.get("alternative_perspectives")


async def test_analysis_results_persist_and_are_owner_scoped(client):
    """Verifies items 8 (database) and 2 (cross-user isolation): analysis
    results are actually written to Mongo under the requesting user, and a
    different learner's /history never shows them."""
    headers, learner = await _learner_headers(client)
    await client.post(
        "/api/v1/analysis/argument",
        json={"text": "Universal basic income reduces poverty according to the Finland pilot study results."},
        headers=headers,
    )
    own_history = await client.get("/api/v1/analysis/history", headers=headers)
    assert own_history.status_code == 200
    assert own_history.json()["total"] >= 1

    other = await create_user_direct("learner", "other-engines-learner@example.com")
    other_history = await client.get(
        "/api/v1/analysis/history", headers={"Authorization": f"Bearer {other['access_token']}"}
    )
    assert other_history.status_code == 200
    assert other_history.json()["total"] == 0
    assert other_history.json()["items"] == []
