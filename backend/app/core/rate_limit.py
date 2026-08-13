"""
Rate limiting (item 12 — Security: "Implement rate limiting where missing,
especially for expensive LLM/chat endpoints and authentication-sensitive
endpoints").

Uses slowapi (a Flask-limiter-style wrapper around FastAPI) with an
in-memory store. In-memory is deliberate for now: this app runs as a single
uvicorn worker per container (see Dockerfile's `--workers 1` — faster-
whisper's model is loaded once per process and is memory-heavy, so scaling
is via replicas, not workers), and each replica getting its own limiter
bucket is an acceptable, simple default. If this is horizontally scaled
behind a load balancer, swap `storage_uri` below for a shared Redis
instance (slowapi supports this out of the box via the same `Limiter(...)`
call) so limits are enforced across all replicas, not per-replica.

Limits are intentionally two-tier:
  - `auth_limit`   — tight, for brute-force-sensitive endpoints (login,
    register, OTP, OAuth callbacks): a legitimate user retries a handful of
    times at most; an attacker needs hundreds/thousands of attempts.
  - `llm_limit`    — looser but still real, for expensive LLM-backed
    endpoints (chatbot, analysis, coaching generation): protects the
    OpenAI/Anthropic bill and prevents one user from starving others, while
    still allowing a normal back-and-forth conversation.
Keyed by client IP (get_remote_address) rather than user id: this also
throttles unauthenticated abuse of the login/register endpoints themselves,
before a user identity even exists.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Applied via @limiter.limit(...) decorators on individual routes.
AUTH_RATE_LIMIT = "10/minute"
LLM_RATE_LIMIT = "30/minute"
