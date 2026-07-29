# CHANGELOG — Milestone 2 Fix (Multi-Provider LLM + Deterministic Fallback)

This changelog documents every file added or modified to fix the OpenAI
quota-outage bug and bring Milestone 2 up to the full project specification:
multi-provider LLM support, a deterministic rule-based fallback engine so the
platform never returns empty/zero placeholders, complete scoring, and full
MongoDB/Dashboard/Reports/PDF integration.

---

## New files

### `backend/app/services/llm_provider.py`
Central LLM provider abstraction. Every AI service in the project now calls
through this module instead of instantiating `ChatOpenAI` directly.

- `get_structured_result(...)` — structured (Pydantic schema) output, used by
  argument analysis, fallacy detection, feedback reports, presentation
  scoring, learning plans, and counterargument generation.
- `get_text_result(...)` — plain text output, used by the AI opponent's
  rebuttal generation.
- `get_text_result_with_history(...)` — multi-turn conversational output,
  used by the AI Mentor.
- Tries `settings.LLM_PROVIDER` first (default `"openai"`). If it raises for
  any reason (quota, auth, network, timeout), automatically tries
  `settings.LLM_FALLBACK_PROVIDER` (default `"anthropic"`). If both fail (or
  neither is configured), raises `AllProvidersUnavailableError` so callers
  can drop down to deterministic analysis instead of returning empty output.
- Adding a new provider requires no architecture changes — just a new
  branch in `_build_chat_model` and a pip dependency.

### `backend/app/services/deterministic_analysis.py`
Rule-based NLP fallback engine, used only when every configured LLM provider
fails. Guarantees the platform never returns "0/10", "Not enough data", "No
recommendations yet", or empty lists when a real transcript exists.

- `analyze_argument_deterministic(text)` — extracts claims/evidence via
  linguistic markers; scores clarity, relevance, evidence strength, logical
  consistency, persuasiveness, and reasoning quality (0–10 each).
- `detect_fallacy_deterministic(text, argument_analysis)` — regex/pattern
  detection for Ad Hominem, Slippery Slope, False Dilemma, Hasty
  Generalization, Appeal to Authority, Circular Reasoning, Red Herring.
- `generate_feedback_report_deterministic(topic, turns)` — aggregates real
  per-turn scores into strengths, weaknesses, missing evidence, logical
  issues, recommended improvements, learning recommendations, and an overall
  rating (floored at 1.0, never 0, whenever turns exist).
- `score_presentation_deterministic(transcript, metrics)` — confidence,
  clarity, engagement, and pacing scores derived from filler-word ratio,
  sentence structure, and measured words-per-minute.
- `generate_counterarguments_deterministic(text, topic)` — counterarguments,
  alternative perspectives, opponent questions, missing evidence, weak
  claims, and improvement suggestions derived from the actual text.
- `generate_opponent_rebuttal_deterministic(...)` — template-based AI
  opponent rebuttal that still reacts to the user's actual claims and any
  detected fallacy.

---

## Modified files

### `backend/app/core/config.py`
Added multi-provider configuration:
- `LLM_PROVIDER: str = "openai"`
- `LLM_FALLBACK_PROVIDER: str = "anthropic"`
- `ANTHROPIC_API_KEY: str = ""`
- `ANTHROPIC_MODEL: str = "claude-sonnet-4-6"`

### `backend/app/schemas/fallacy.py`
`DebateFeedbackReport` extended with fields required by the AI Analysis page
that were previously missing from the schema entirely (not just from the
output — the fields didn't exist, so they could never have been populated
regardless of the AI backend):
- `learning_recommendations: list[str]` — broader curriculum/skill-building
  suggestions, distinct from the tactical `recommended_improvements`.
- `argument_quality: float` (0–10)
- `evidence_usage: float` (0–10)
- `logical_consistency: float` (0–10)
- `rebuttal_effectiveness: float` (0–10)
- `communication_skills: float` (0–10)

### `backend/app/services/fallacy_agent.py` (rewritten)
- `analyze_argument()` and `detect_fallacy()` now route through
  `llm_provider.get_structured_result`, falling back to
  `deterministic_analysis` on `AllProvidersUnavailableError` or any
  unexpected exception (previously: direct `ChatOpenAI` call with a bare
  `except` that returned an empty/zero placeholder object).
- `generate_feedback_report()` prompt updated to also request the 5 named
  sub-scores and `learning_recommendations`; deterministic fallback now
  computes and returns them too.

### `backend/app/agents/chatbot_engine.py` (rewritten)
`generate_opponent_rebuttal()` now routes through
`llm_provider.get_text_result`, falling back to
`deterministic_analysis.generate_opponent_rebuttal_deterministic` instead of
crashing or stalling the debate when the LLM is unavailable.

### `backend/app/services/presentation_service.py` (rewritten)
`score_presentation()` now routes through
`llm_provider.get_structured_result`, falling back to
`deterministic_analysis.score_presentation_deterministic` (confidence,
clarity, engagement, pacing all computed from real transcript + speech
metrics) instead of returning a pacing-only partial result.

### `backend/app/services/learning_plan_service.py` (rewritten)
`generate_learning_plan()` now routes through
`llm_provider.get_structured_result`, with a clearly-labeled generic
4-week foundational plan as the last-resort fallback (previously: direct
`ChatOpenAI` call, no provider abstraction).

### `backend/app/services/counterargument_service.py` (rewritten)
`generate_counterarguments()` now routes through
`llm_provider.get_structured_result`, falling back to
`deterministic_analysis.generate_counterarguments_deterministic`.

### `backend/app/services/mentor_service.py` (rewritten)
**Bug found and fixed:** previously called `ChatOpenAI` directly with no
fallback at all — reproduced a real HTTP 500 during verification. Now
routes through `llm_provider.get_text_result_with_history`, falling back to
a deterministic, evidence-grounded answer (still reacts to the learner's
real recent weaknesses/fallacies and the topic of their question) if every
provider is unavailable.

### `backend/app/services/quiz_engine.py` (rewritten)
**Bug found and fixed:** same direct-`ChatOpenAI`-no-fallback pattern,
reproduced as a real HTTP 500 during verification. Now routes through
`llm_provider.get_structured_result`, falling back to a deterministic
8-topic × 5-question fallback bank so quiz generation never 500s or
returns an empty quiz.

### `backend/app/services/practice_engine.py` (rewritten)
**Bug found and fixed:** same pattern, reproduced as a real HTTP 500. Now
routes through `llm_provider.get_structured_result`, falling back to
deterministic exercises that still adapt difficulty to the learner's real
computed skill level and reference their real recorded weaknesses/fallacies.

### `backend/app/services/coaching_service.py` (rewritten)
**Bug found and fixed:** same pattern, reproduced as a real HTTP 500. Now
routes through `llm_provider.get_structured_result`, falling back to a
deterministic generator that reads the real evidence dict (argument scores,
fallacy types, presentation metrics) instead of generic filler advice.

### `backend/app/services/report_pdf_service.py`
PDF report generation updated to render the newly-added fields so the
exported PDF matches the AI Analysis page:
- Overall Rating heading
- A 5-column sub-score table (Argument Quality, Evidence Usage, Logical
  Consistency, Rebuttal Effectiveness, Communication Skills)
- A new "Learning Recommendations" section

### `backend/requirements.txt`
Added:
```
langchain-anthropic==0.1.23
anthropic==0.34.2
```

### `backend/.env.example`
Documented the new provider configuration variables (`LLM_PROVIDER`,
`LLM_FALLBACK_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`) with
inline comments explaining the fallback chain behavior.

### `frontend/src/pages/learner/AnalysisDetail.jsx`
AI Analysis page updated to actually display the data the backend now
provides:
- A "Score Breakdown" panel showing all 5 named sub-scores (Argument
  Quality, Evidence Usage, Logical Consistency, Rebuttal Effectiveness,
  Communication Skills) — previously not rendered anywhere in the UI even
  though the spec required it.
- A new "Learning Recommendations" section, distinct from the existing
  "Recommended Improvements" section.

---

## Files NOT modified (audited, confirmed already correct)
- `backend/app/services/whisper_service.py` — already had a working
  OpenAI → local `faster-whisper` fallback chain; no direct-API-with-no-
  fallback bug present.
- `backend/app/routers/debate_live.py` — only calls the services above; no
  changes needed once those services stopped returning empty placeholders.
- `backend/app/routers/dashboard.py` — derives all metrics from stored
  scores/sessions; needed no changes once the underlying data was fixed to
  never be zero/empty.

---

## Root cause summary
The original bug was not just "OpenAI ran out of quota" — every AI service
(`fallacy_agent.py`, `chatbot_engine.py`, `presentation_service.py`,
`learning_plan_service.py`, `counterargument_service.py`, and, discovered
during verification, `mentor_service.py`, `quiz_engine.py`,
`practice_engine.py`, `coaching_service.py`) called `ChatOpenAI` directly
with either a bare `except` returning an empty placeholder, or no
exception handling at all (causing HTTP 500s). This fix replaces all nine
call sites with a shared provider-abstraction + deterministic-fallback
pattern, so the platform is now resilient to any single LLM provider being
unavailable, and never degrades to empty/zero output when real transcript
data exists.

---

## Setup instructions (only step that changed)

1. `cd backend && pip install -r requirements.txt` (installs the two new
   packages: `langchain-anthropic`, `anthropic`)
2. Copy `.env.example` to `.env` and fill in your real values. At minimum:
   - `MONGO_URI`, `JWT_SECRET_KEY` (required, as before)
   - `OPENAI_API_KEY` (optional — if omitted/invalid, the app automatically
     falls back to Anthropic if configured, then to the deterministic
     engine; it will never crash for lack of an LLM key)
   - `ANTHROPIC_API_KEY` (optional, new — only needed if you want the
     fallback provider to actually be a second LLM rather than the
     deterministic engine)
   - `LLM_PROVIDER` / `LLM_FALLBACK_PROVIDER` — leave at their defaults
     (`openai` / `anthropic`) unless you want to reorder or disable a
     provider (set `LLM_FALLBACK_PROVIDER=` empty to disable it entirely)
3. No frontend setup changes — `cd frontend && npm install && npm run dev`
   as before.
