from datetime import datetime, timezone

from app.db.mongodb import coaching_nudges_collection
from app.schemas.presentation import PresentationMetrics


def _build_nudge_text(metrics: PresentationMetrics) -> str | None:
    if metrics.wpm > 180:
        return "You're speaking quickly — try slowing down for clarity."
    if 0 < metrics.wpm < 100:
        return "Your pace is a bit slow — bring more energy to your delivery."
    if metrics.filler_density > 0.05:
        return f"Watch filler words — {metrics.filler_count} detected in that turn."
    return None


async def push_coaching_nudge(session_id: int, user_id: int, metrics: PresentationMetrics):
    """Fire-and-forget: called via asyncio.create_task so it never blocks
    the opponent's reply or the turn response going back to the user."""
    nudge_text = _build_nudge_text(metrics)
    if not nudge_text:
        return
    await coaching_nudges_collection.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "text": nudge_text,
        "metrics": metrics.model_dump(),
        "created_at": datetime.now(timezone.utc),
        "seen": False,
    })