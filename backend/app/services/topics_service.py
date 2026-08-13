"""
Debate Topic curation (Milestone 3, Part 1).

Topics live in MongoDB (`debate_topics` collection), never as hardcoded
in-memory arrays returned to the client. `ensure_seeded()` is idempotent —
it only inserts the curated seed set the first time the collection is
empty, so once an admin/coach edits or adds topics through the database,
those changes persist across restarts.
"""
import random
from datetime import datetime, timezone

from app.core.database import debate_topics_collection

# One-time seed content. This is *only* used to populate MongoDB on first
# boot (see ensure_seeded) — every read in the app goes through Mongo.
def _bucket(*titles: str) -> list[dict]:
    """Build a curated-topic bucket from plain title strings, assigning a
    descending popularity so `pick_random_topic` / `list_topics` sorting
    still works without hand-maintaining a score per title."""
    return [
        {"title": t, "category": "General", "difficulty": "Intermediate", "popularity": 100 - i}
        for i, t in enumerate(titles)
    ]


# Curated topic set — sourced verbatim from the platform's approved topic
# list (Milestone 6). Exactly these 8 formats/buckets are supported; no
# other format keys should exist in the DB or the frontend format picker.
_SEED_TOPICS: dict[str, list[dict]] = {
    "oxford": _bucket(
        "AI should replace traditional teachers.",
        "Social media does more harm than good.",
        "Universal Basic Income should be implemented.",
        "Four-day work weeks should become the norm.",
        "Space exploration deserves more funding than ocean exploration.",
        "School uniforms should be mandatory.",
        "Climate change is humanity's greatest threat.",
        "College degrees are becoming less valuable.",
        "Governments should regulate AI.",
        "Online education is better than classroom education.",
        "Cash should be completely eliminated.",
        "The voting age should be lowered to 16.",
        "Homework should be banned.",
        "Smartphones should not be allowed in schools.",
        "Billionaires should pay higher taxes.",
    ),
    "ai_simulation": _bucket(
        "Debate Elon Musk on Mars colonization.",
        "Debate an AI doctor on universal healthcare.",
        "Convince an AI investor to fund your startup.",
        "Debate an AI judge about freedom of speech.",
        "Debate an AI climate scientist.",
        "Convince an AI CEO to adopt a four-day work week.",
        "Debate an AI politician on immigration.",
        "Debate an AI historian on whether history repeats itself.",
        "Debate an AI ethics expert on autonomous weapons.",
        "Debate an AI professor on replacing exams with projects.",
    ),
    "popularity": _bucket(
        "Is TikTok beneficial for students?",
        "Should influencers be considered celebrities?",
        "Is remote work better than office work?",
        "Is electric mobility the future?",
        "Should AI-generated art win competitions?",
        "Is gaming a professional career?",
        "Should YouTube replace television?",
        "Is cryptocurrency the future of finance?",
        "Should celebrities influence politics?",
        "Is online shopping better than traditional shopping?",
    ),
    "one_on_one": _bucket(
        "AI will create more jobs than it destroys.",
        "Is nuclear energy the best clean energy source?",
        "Should animals be used for scientific research?",
        "Are exams the best way to measure intelligence?",
        "Should voting be compulsory?",
        "Should governments ban facial recognition?",
        "Can AI be truly creative?",
        "Should schools teach financial literacy?",
        "Is privacy more important than national security?",
        "Should autonomous vehicles replace human drivers?",
    ),
    "group_debate": _bucket(
        "How should governments regulate artificial intelligence?",
        "Is social media responsible for misinformation?",
        "The future of work in an AI-driven world.",
        "Can renewable energy replace fossil fuels?",
        "Should the Olympics include esports?",
        "How can cities become smarter?",
        "Should countries adopt digital currencies?",
        "Is globalization helping developing nations?",
        "How should countries tackle climate change?",
        "Should internet access be a basic human right?",
    ),
    "public_forum": _bucket(
        "Should governments regulate deepfake technology?",
        "Should AI-generated content require labels?",
        "Is social media harmful to democracy?",
        "Should smartphones be banned in classrooms?",
        "Is universal healthcare a human right?",
        "Should public transport be free?",
        "Should governments limit screen time for children?",
        "Should online privacy laws be strengthened?",
        "Should voting be done online?",
        "Should cashless economies become mandatory?",
    ),
    "parliamentary": _bucket(
        "This House would ban autonomous weapons.",
        "This House believes AI should be open source.",
        "This House supports a global carbon tax.",
        "This House would make higher education free.",
        "This House regrets the rise of influencer culture.",
        "This House would legalize assisted dying.",
        "This House supports universal basic income.",
        "This House believes space tourism should be regulated.",
        "This House would prohibit facial recognition in public spaces.",
        "This House believes democracy is superior to technocracy.",
    ),
    "policy": _bucket(
        "National AI governance policy.",
        "Universal Basic Income policy.",
        "Climate adaptation policy.",
        "Renewable energy transition policy.",
        "National cybersecurity policy.",
        "Digital privacy legislation.",
        "Water conservation policy.",
        "Plastic waste reduction policy.",
        "Public transportation improvement policy.",
        "Healthcare reform policy.",
        "Education curriculum reform policy.",
        "Food security policy.",
        "AI ethics regulation.",
        "Data protection policy.",
        "Smart city development policy.",
    ),
}


async def ensure_seeded() -> None:
    """Keep `debate_topics` in sync with the approved curated list.

    Only the 8 approved formats may exist, and each must contain exactly
    the curated titles above. Any format not in `_SEED_TOPICS` (e.g. a
    retired format like "lincoln_douglas") is dropped entirely, and each
    approved format's titles are reconciled against the curated set:
    missing curated titles are inserted, and any stray title that isn't
    part of the curated list is removed. Existing docs whose title *is*
    curated are left untouched (so popularity/order edits made elsewhere
    aren't clobbered on every restart)."""
    now = datetime.now(timezone.utc).isoformat()
    allowed_formats = set(_SEED_TOPICS.keys())

    # Drop any format that is no longer part of the approved set.
    await debate_topics_collection.delete_many({"debate_format": {"$nin": list(allowed_formats)}})

    for debate_format, topics in _SEED_TOPICS.items():
        curated_titles = {t["title"] for t in topics}

        # Remove any non-curated stray topic left over in this format.
        await debate_topics_collection.delete_many({
            "debate_format": debate_format,
            "title": {"$nin": list(curated_titles)},
        })

        existing_titles = {
            doc["title"]
            async for doc in debate_topics_collection.find(
                {"debate_format": debate_format}, {"title": 1}
            )
        }
        missing = [t for t in topics if t["title"] not in existing_titles]
        docs = [{**t, "debate_format": debate_format, "created_at": now} for t in missing]
        if docs:
            await debate_topics_collection.insert_many(docs)


async def list_topics(debate_format: str | None = None, limit: int = 50) -> list[dict]:
    query = {"debate_format": debate_format} if debate_format else {}
    cursor = debate_topics_collection.find(query).sort("popularity", -1).limit(limit)
    return [doc async for doc in cursor]


async def pick_random_topic(debate_format: str) -> dict | None:
    topics = await list_topics(debate_format=debate_format, limit=100)
    if not topics:
        return None
    return random.choice(topics)
