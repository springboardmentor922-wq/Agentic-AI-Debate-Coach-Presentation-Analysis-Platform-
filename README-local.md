# Podium — AI Debate Coach & Presentation Analysis Platform

**Milestone 1: Project Initialization, Design Process & Core Setup**

This milestone builds the complete, scalable foundation of the platform — architecture, database, UI, authentication, and core modules — with **no AI features yet**. The chatbot, argument analysis, fallacy detection, speech analysis, and recommendation engine are intentionally left as extension points for later milestones.

---

## 1. What's in this milestone

| Area | Status |
|---|---|
| Requirement analysis & 4 user roles | ✅ Documented in `docs/roles-and-features.md` |
| Workflow design & diagrams | ✅ `docs/workflows.md` (Mermaid diagrams) |
| System architecture | ✅ `docs/architecture.md` |
| Database schema (PostgreSQL + MongoDB) | ✅ `docs/database-schema.md` + working models |
| UI/UX wireframes | ✅ `docs/wireframes.md` (described) + fully built pages |
| Frontend setup (React + Tailwind) | ✅ `frontend/` |
| Backend setup (FastAPI) | ✅ `backend/` |
| JWT auth + role-based access | ✅ working |
| Google OAuth2 | ⚙️ scaffolded, disabled until credentials are supplied |
| User profile module | ✅ working |
| Debate session module | ✅ working (no AI grading yet) |

---

## 2. Tech stack

- **Frontend:** React 19 + Vite, React Router, Tailwind CSS, Recharts, lucide-react
- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic v2
- **Databases:**
  - **PostgreSQL** — relational core: roles, users, profiles, topics, sessions
  - **MongoDB** — flexible/append-only data: skill tracking, session activity logs (structure ready for AI-generated data in later milestones)
- **Auth:** JWT (access + refresh tokens), OAuth2 password flow, role-based access control, Google OAuth2 scaffold

---

## 3. Project structure

```
debate-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, router registration, startup seeding
│   │   ├── core/                  # settings, security (hashing + JWT)
│   │   ├── db/                    # Postgres engine/session, Mongo client, seed data
│   │   ├── models/                # SQLAlchemy models (Role, User, UserProfile, DebateTopic, DebateSession)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   └── api/routes/            # auth, users, topics, sessions, admin
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Login, Register, Dashboard, Profile, TopicSelection, DebateRoom, Reports, Admin
│   │   ├── components/            # AppShell, MotionCard, TimerRing, RoleBadge, StatCard, route guards
│   │   ├── context/AuthContext.jsx
│   │   └── api/                   # axios instance + endpoint groupings
│   └── .env.example
└── docs/
    ├── roles-and-features.md
    ├── workflows.md
    ├── architecture.md
    ├── database-schema.md
    └── wireframes.md
```

---

## 4. Running it locally

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit DB credentials
# Make sure PostgreSQL and MongoDB are running locally (or update the URIs in .env)
uvicorn app.main:app --reload
```

On startup, the backend automatically creates all PostgreSQL tables and seeds the four roles
(`learner`, `debate_coach`, `educator`, `administrator`). API docs are available at
`http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # set VITE_API_BASE_URL if different from localhost:8000
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 5. What's intentionally NOT built yet

Per the milestone scope, these are stubbed or absent, and are reserved for later milestones:
- AI chatbot / conversational debate partner
- Argument strength / logical fallacy detection
- Speech-to-text and delivery (pace, filler words, tone) analysis
- Personalized recommendation engine
- Real-time multi-user debate rooms (current Debate Room is single-user practice with a timer)

The database and API are shaped so these can be added without breaking changes — e.g. `session_logs`
and `skill_tracking` MongoDB collections are already wired for write access, ready to receive
AI-generated analysis in later milestones.
