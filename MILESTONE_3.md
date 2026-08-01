# Milestone 3 — Implementation Notes

Existing Milestone 1 & 2 code (auth, roles, profiles, session CRUD, argument
analysis, fallacy detection) was **not modified** except for two small,
additive changes needed for integration:

- `agents/chatbot_engine.py`: added `ai_personality` parameter + prompt
  rules (backward compatible — defaults to "intermediate").
- `core/database.py` / `core/config.py`: added new collections/settings only.

## New backend modules

- `services/topics_service.py` — curated topics seeded into MongoDB (`debate_topics`)
- `services/whisper_service.py` — OpenAI Whisper transcription
- `services/media_service.py` — upload validation + ffmpeg video→audio extraction
- `services/presentation_service.py` — real speech metrics (WPM, filler words) + LLM delivery scoring
- `services/counterargument_service.py` — full counterargument bundle (Part 6)
- `services/coaching_service.py` — dynamic, evidence-grounded coaching (Part 7)
- `services/learning_plan_service.py` — 4-week personalized plan generator (Part 8)
- `routers/debate_live.py` — `/api/v1/debate/{topics,start,live,transcribe,upload-audio,upload-video,finish,presentation-analysis}`
- `routers/learning_plan.py` — `/api/v1/learning-plan*`, `/api/v1/coaching*`
- `routers/notifications.py` — `/api/v1/notifications*`
- `routers/aliases.py` — thin wrappers so the exact spec paths
  (`/api/v1/recommendations`, `/api/v1/leaderboard`, `/api/v1/analysis/:id`,
  `/api/v1/debate/:id`, `/api/v1/debate/history`) exist without duplicating logic.
  **Registered last in `main.py`** so its catch-all `/debate/{session_id}` never
  shadows the more specific literal routes in `debate_live.py`.

## New frontend

- `pages/learner/Sessions.jsx` — AI personality selector, MediaRecorder mic
  capture (record/pause/resume/stop → `/debate/transcribe` → `/debate/live`),
  Finish Debate button (`/debate/finish`).
- `pages/learner/Presentation.jsx` — real Upload Audio / Upload Video tabs
  (`/debate/upload-audio`, `/debate/upload-video`) + Past Reports history.
- `pages/learner/Topics.jsx` — fetches curated topics from `/debate/topics`
  instead of a hardcoded array.
- `pages/learner/Learning.jsx` — added Personalized Learning Plan panel
  (`/learning-plan`) with per-task progress tracking, and AI Coaching panel
  (`/coaching/*`); "Recommended For You" now pulled from `/recommendations`.
- `components/NotificationBell.jsx` — real notification dropdown with unread
  count, wired into `TopNav.jsx` for every role.

## Requires configuration to run live

- `OPENAI_API_KEY` in `backend/.env` — required for Whisper transcription,
  AI opponent turns, counterargument/coaching/learning-plan generation, and
  presentation scoring. Without it these endpoints return a clear 503
  rather than fabricated output.
- `ffmpeg` installed on the backend host/container — required only for the
  video upload pipeline (audio extraction). Add to the backend Dockerfile:
  `RUN apt-get update && apt-get install -y ffmpeg`.

## Not yet wired to real data (unchanged from before, out of Milestone 3 scope)

- `data/mockLearner.js` practice exercises, quizzes, and learning materials
  lists on the Learning Hub page remain illustrative content — the spec's
  Part 8 (Personalized Learning Plan) and Part 7 (Coaching) are the two
  learning-hub features it required to be dynamic, and both are now real.
