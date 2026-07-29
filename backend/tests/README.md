# Backend Tests

Real integration tests against the actual FastAPI app and its real routers/
services — not hand-rolled fakes. The only thing mocked is the database
(an in-memory MongoDB via `mongomock-motor`, so no real Mongo instance is
needed) and, in the upload-pipeline tests, the Whisper transcription call
(since neither OpenAI nor a local model download is available in a sandboxed
CI environment — everything downstream of that one call, including the
deterministic LLM fallback path, runs for real).

## Running

```bash
cd backend
python -m venv venv && source venv/bin/activate   # if you don't already have one
pip install -r requirements-dev.txt
pytest
```

No `.env` file, real MongoDB, or OpenAI/Anthropic API key is required to run
this suite. Tests intentionally run with zero LLM keys configured so the
deterministic fallback code paths (see `services/deterministic_analysis.py`,
`services/coaching_plan_service.py`, etc.) are exercised for real rather
than mocked away — this is also what CI should run without needing secrets.

## What's covered

- `test_auth.py` — registration → OTP verification → login → `/auth/me`,
  including the security regression test that a signup request can't
  self-provision a privileged role
- `test_coaching_plans.py` — plan generation (deterministic fallback),
  progress tracking, and role-based access control (owner-only, coach
  roster-only)
- `test_skill_gap.py` — the shared skill-gap service's filtering
  (learner/department scoping, including that a department filter can't
  reach outside a coach's roster) and computed averages/strengths/
  weaknesses/recommendations
- `test_upload_pipeline.py` — the async job pipeline end-to-end: upload
  returns `202` with a job id immediately, background processing runs and
  updates job status, polling reaches `done` with a real persisted result;
  plus ownership checks and upload validation

## What's not covered yet

This is a starting suite, not exhaustive coverage. Not yet tested: the
chatbot orchestrator's context-gathering, PDF report field content
(only smoke-tested manually, see the PR notes), messaging, notifications,
and most admin endpoints. Frontend has no automated tests yet either.
