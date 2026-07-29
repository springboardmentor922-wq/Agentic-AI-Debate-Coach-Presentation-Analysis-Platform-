# Agentic AI Debate Coach & Presentation Analysis Platform

Full-stack platform covering Milestones 1-4 of the internship specification:
Auth & Role-Based Access, Argument Analysis + Fallacy Detection, AI Debate
Simulation + Presentation Analysis + Coaching, and Reports/Skill Gap
Analysis/Messaging/Docker deployment. See [`MILESTONE_3.md`](MILESTONE_3.md)
and this file's [Status](#status--what-is-actually-implemented) section
below for exactly what's real vs. still in progress — this README is kept
in sync with the actual code, not aspirational.

## Stack
- **Backend:** Python, FastAPI, MongoDB (Motor async driver), JWT auth,
  LangChain + OpenAI/Anthropic with a deterministic rule-based fallback,
  faster-whisper (local) + OpenAI Whisper for transcription, ReportLab for
  PDF generation, ffmpeg for video→audio extraction
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Deployment:** Docker + docker-compose (backend, frontend, MongoDB)

## Status — what is actually implemented

The platform is AI-first with a hard safety net: every AI-backed feature
(argument analysis, fallacy detection, presentation scoring, coaching plans,
learning plans, the chatbot) runs through a provider chain — OpenAI, then
Anthropic, then a deterministic rule-based engine — so the platform produces
real, non-empty, evidence-grounded output even with zero API keys
configured. This is true throughout, not just for a demo path.

### Milestone 1 — Auth & Platform Foundation
User registration with email OTP verification, JWT access+refresh tokens,
4 roles (`learner`, `debate_coach`, `educator`, `administrator`) each with
their own dashboard, server-side role enforcement (`require_roles`
dependency, not just hidden UI), profile management, debate session CRUD.

### Milestone 2 — Argument Analysis & Fallacy Detection
Argument Analysis Engine (claims/evidence/clarity/relevance/logical
consistency scoring), Logical Fallacy Detection Engine (8 fallacy types with
explanation + correction), an AI Opponent that generates rebuttals routed by
debate format, all LLM-backed with strict Pydantic-schema structured output.

### Milestone 3 — AI Debate Simulation, Presentation Analysis, Coaching
- Live AI debate sessions (multi-turn, per-format opponent behavior)
- Audio/video upload pipeline: **asynchronous** — upload returns a job id
  immediately (`202`), a background task runs transcription → argument
  analysis → fallacy detection → counterargument generation → delivery
  scoring → persistence, and the frontend polls `/api/v1/jobs/{id}` for
  real stage-by-stage progress (not a faked client-side sequence)
- Transcription: OpenAI Whisper with automatic local (faster-whisper)
  fallback, plus retry-with-backoff at the job level
- **Coaching Plans**: a real, trackable entity distinct from the Learning
  Plan — 4 weeks, measurable objectives, exercises with computed deadlines
  and completion tracking, generated from AI evidence and automatically
  regenerated whenever a coach or educator submits a review
- Personalized Learning Plans, AI Debate Chatbot (7-agent orchestrator,
  grounded in the authenticated learner's own analysis/fallacy/presentation/
  coaching-plan/learning-plan/review history)
- Chatbot session lifecycle: a fresh conversation starts on every login;
  logout clears client-side chat state while preserving full history in
  the database

### Milestone 4 — Reports, Skill Gap Analysis, Messaging, Deployment
- **Reports**: PDF generation (ReportLab) including learner name/email,
  coach/educator names, session ID, per-scorer score breakdown (AI/coach/
  educator), all 5 argument sub-scores, detected fallacies, presentation
  delivery scores, counterarguments, transcript excerpt, audio link, and
  branding — downloadable by the learner, their assigned coach, any
  educator, or an admin
- **Skill Gap Analysis**: filterable by learner or department, with
  historical trend charting, ranked strengths/weaknesses, improvement %,
  and frequency-ranked recommendations — shared logic between the Coach and
  Educator views
- Messaging (REST, conversation history, role-based permissions) and
  Notifications (unread counts, mark-read)
- Docker: `backend/Dockerfile`, `frontend/Dockerfile` (nginx), root
  `docker-compose.yml` wiring Mongo + backend + frontend
- Test suite: `backend/tests/` (pytest, in-memory Mongo via
  `mongomock-motor`, no external services required — see
  `backend/tests/README.md`)

### Known gaps (being tracked, not hidden)
- Messaging is REST/polling, not WebSocket — no live push yet
- No frontend automated tests yet
- Docker images are written but **not yet verified against a real Docker
  daemon** in this environment — please build/test before relying on them
- Admin has API-level access to coaching plans and reports but no dedicated
  drill-down UI yet

## Project layout
```
backend/
  app/
    core/        # config, db, security, auth deps
    schemas/     # Pydantic models
    services/    # AI services, job/coaching-plan/skill-gap logic, PDF generation
    agents/      # chatbot orchestrator, opponent engine
    routers/     # auth, users, debate_sessions, analysis, debate_live,
                 # coaching_plans, jobs, reports, messages, coach_review,
                 # educator_analytics, admin, notifications, media, ...
    main.py
  tests/         # pytest suite — see tests/README.md
  Dockerfile
  requirements.txt / requirements-dev.txt
  .env.example
frontend/
  src/
    pages/       # Landing, Login, Register, 4 role areas (learner/coach/educator/admin)
    components/  # TopNav, GlobalChatbot, ProtectedRoute, PlatformStats, charts/
    context/     # AuthContext, ThemeContext
    api/axios.js
  Dockerfile
  nginx.conf
  .env.example
docker-compose.yml
```

## Running locally

### Option A — Docker (recommended for a full demo)
```bash
cp backend/.env.example backend/.env   # fill in real keys if you have them —
                                        # the platform still works with none, via the deterministic fallback
docker compose up --build
```
Frontend: http://localhost:5173 · Backend docs: http://localhost:8000/docs

### Option B — Run each service directly

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET_KEY, OPENAI_API_KEY
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL if different
npm run dev
```

### Running tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```
No real MongoDB or API keys required — see `backend/tests/README.md`.

## Security notes
- No secrets are committed. `.env` is gitignored in both apps; only
  `.env.example` ships.
- Passwords hashed with bcrypt; JWT access (short-lived) + refresh tokens.
- Role checks enforced server-side via FastAPI dependencies, not just
  hidden in the UI. Data visibility follows the platform-wide rule:
  learners see only their own data; coaches see their assigned roster;
  educators/admins see everything.
