"""
Milestone 4 — Achievement Engine & Certificate Engine schemas.

Both engines are rule-based and re-evaluated against real, persisted learner
data every time a debate completes (see services/achievement_engine.py and
services/certificate_engine.py). A record only ever appears here once its
unlock rule has genuinely been satisfied — nothing is seeded or hardcoded
per-user.
"""
from typing import Optional
from pydantic import BaseModel


class AchievementOut(BaseModel):
    id: str
    user_id: str
    key: str
    title: str
    description: str
    unlocked_at: str
    evidence_session_ids: list[str] = []


class CertificateOut(BaseModel):
    id: str
    user_id: str
    key: str
    title: str
    description: str
    criteria_summary: str
    issued_at: str
    evidence_session_ids: list[str] = []
