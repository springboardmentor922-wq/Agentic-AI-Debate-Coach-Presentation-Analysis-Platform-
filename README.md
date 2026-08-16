# Agentic AI Debate Coach & Presentation Analysis Platform

A modular, AI-powered platform for debate coaching, argument evaluation, presentation analytics, and personalized communication improvement.

---

## 🎥 Project Demonstration

**Watch the complete project demonstration:** [▶️ Watch Demo](VIDEO_LINK_HERE)

> The demonstration video covers the major implemented workflows, role-based dashboards, AI debate analysis, presentation analysis, reports/export functionality, and Dockerized execution.

*Note: The demonstration video link will be updated after final recording.*

---

## 🏷️ Project Badges

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20RBAC-black?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Application Workflow](#-application-workflow)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Running Without Docker](#-running-without-docker)
- [Running with Docker](#-running-with-docker)
- [IPv4 Networking Detail](#-ipv4-networking-detail)
- [Application URLs](#-application-urls)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Database Architecture](#-database-architecture)
- [AI & Agentic Architecture](#-ai--agentic-architecture)
- [Presentation Analytics](#-presentation-analytics)
- [Reports & Export](#-reports--export)
- [Testing & Verification](#-testing--verification)
- [Dockerization](#-dockerization)
- [Deployment Status](#-deployment-status)
- [Milestone Completion](#-milestone-completion)
- [Screenshots & Diagrams](#-screenshots--diagrams)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [Resources](#-resources)
- [Author](#-author)
- [License](#-license)

---

## 🎯 Project Overview

### Problem Statement
Traditional debate instruction and public speaking coaching face significant obstacles:
- **Cost & Accessibility**: Certified debate coaches and speech mentors are expensive and scarce.
- **Subjective Evaluation**: Feedback often lacks consistent quantitative benchmarks for argument strength, evidence usage, or speaking cadence.
- **Limited Practice Environments**: Solo learners lack interactive opponents to practice counterargument interjection and structured speech pacing.
- **Unstructured AI Chatbots**: Generic chatbots return basic text without structured argument claim evaluation, fallacy taxonomies, or prosody analytics.

### Purpose of the Platform
The **Agentic AI Debate Coach & Presentation Analysis Platform** addresses these challenges by delivering an interactive, data-driven environment for learners, debate coaches, educators, and administrators. Users can engage in turn-based debate simulations, record oral presentations, receive automated AI feedback, track skill progression, and export detailed progress reports.

### Target Users
- **Learners**: Practice debate rounds, record oral speeches, receive AI coaching, and track skill progression.
- **Debate Coaches**: Review assigned student sessions, evaluate debate submissions, and provide human-in-the-loop feedback.
- **Educators**: Manage student class cohorts, assign practice topics, and review aggregate performance analytics.
- **Administrators**: Manage user accounts, enforce platform permissions, configure debate topics, and monitor system health.

---

## ✨ Key Features

| Category | Implemented Feature | Description |
| :--- | :--- | :--- |
| **Authentication & Authorization** | Registration & Login | Secure account creation and login using bcrypt password hashing. |
| | JWT Authentication | Stateless authentication using PyJWT access tokens. |
| | Role-Based Access Control (RBAC) | Strict route protection enforcing 4 distinct platform roles. |
| **User & Profile Management** | Profile Preferences | Custom goals, experience levels, topic choices, presentation domains, and coaching settings. |
| | User Management | Admins can create, update, activate/deactivate accounts, and update assigned roles. |
| **Debate Management** | Topic Library | Categorized debate topic catalog with difficulty levels. |
| | Session Scheduling & Workflow | Create debate sessions, assign positions (Affirmative/Negative), and manage debate turns. |
| **AI Debate Analysis** | Claim & Evidence Scoring | Evaluates argument structure, evidence relevance, clarity, and persuasiveness. |
| | Logical Fallacy Detection | Identifies fallacies (Ad Hominem, Straw Man, Slippery Slope, etc.), explains errors, and suggests fixes. |
| | Counterargument Generation | Produces logical, ethical, policy, and empirical rebuttals alongside challenge questions. |
| | AI Opponent Simulation | Persona-based turn counterarguments tailored to format and difficulty level. |
| | Deterministic Scoring | 0–100 score synthesized from argument quality, evidence, logic, rebuttal, and communication. |
| **Presentation Analysis** | Audio Recording | Browser-based audio capture using the MediaRecorder API (`audio/webm`). |
| | MongoDB GridFS Storage | Direct binary audio upload and streaming via MongoDB GridFS. |
| | Local Whisper Transcription | Background speech-to-text transcription using local OpenAI Whisper. |
| | WPM Pace Analysis | Computes speaking pace against the recommended benchmark (130–160 WPM). |
| | Filler Word Analytics | Scans disfluency counts ('um', 'uh', 'like', 'actually', 'basically') and computes density. |
| | Deterministic Speech Score | 0–100 score combining Pace (20%), Filler Control (25%), Clarity (20%), Confidence (20%), and Engagement (15%). |
| **Skill Tracking** | Multi-Dimensional Analytics | Tracks Communication, Presentation, Critical Thinking, and Argumentation skill vectors. |
| | Trend Visualizations | Interactive score evolution charts rendered with Recharts. |
| **Role Dashboards** | Customized Dashboards | Specific dashboards tailored for Learner, Coach, Educator, and Administrator workflows. |
| **Notifications** | In-App System Alerts | System notification list for session updates, assignments, and review feedback. |
| **Reports & Export** | Client-Side CSV/Excel Export | Export filtered report datasets directly to CSV/Excel spreadsheet format. |
| | Browser Print / Save as PDF | Standard browser print stylesheet workflow for clean PDF export via `window.print()`. |

---

## 🏗️ System Architecture

The platform uses a modular, decoupled architecture separating the user interface, backend REST API gateway, storage systems, and AI processing engines:

```mermaid
graph TD
    User([User Browser]) -->|HTTP / REST| Frontend[React + Vite Frontend / Nginx Container]
    Frontend -->|API Requests / JWT| Gateway[FastAPI Backend Gateway]

    subgraph Security Layer
        Gateway --> Auth[JWT Authentication & RBAC Engine]
    end

    subgraph Relational Persistence
        Gateway -->|SQLAlchemy ORM| Postgres[(PostgreSQL 15 DB)]
    end

    subgraph Document & Media Storage
        Gateway -->|GridFS Audio Binaries| Mongo[(MongoDB 6 GridFS)]
        Gateway -->|JSON Reports & Logs| MongoDocs[(MongoDB Collections)]
    end

    subgraph AI & Analytics Engine
        Gateway -->|Invoke Graph| LangGraph[LangGraph Agentic Orchestrator]
        LangGraph --> ArgumentAgent[Argument Analysis Agent]
        LangGraph --> FallacyAgent[Fallacy Detection Agent]
        LangGraph --> CounterAgent[Counterargument Agent]
        LangGraph --> OpponentAgent[AI Debate Opponent Agent]
        LangGraph --> ScoringAgent[Judge & Scoring Engine]

        LangGraph -->|LLM Inference| LLMProvider{LLM Provider}
        LLMProvider -->|Cloud LLM| Groq[Groq API / Llama-3.1-8b]
        LLMProvider -->|Local Fallback| Ollama[Ollama / Llama-3.1-8b]

        LangGraph -->|Vector RAG| FAISS[(FAISS Vector Store)]

        Gateway -->|Background Processing| SpeechEngine[Whisper STT & Presentation Analytics Engine]
        SpeechEngine -->|Read Binary Audio| Mongo
        SpeechEngine -->|Write Metrics| Postgres
        SpeechEngine -->|Write JSON Report| MongoDocs
    end
```

---

## 🔄 Application Workflow

```
[User Login / Auth] ➔ [Role Dashboard] ➔ [Select Debate Topic / Presentation Studio]
                                                   │
          ┌────────────────────────────────────────┴────────────────────────────────────────┐
          ▼                                                                                 ▼
[AI Debate Simulation]                                                           [Presentation Studio]
  • Enter Argument Statement                                                       • Record Audio via MediaRecorder API
  • Trigger LangGraph Orchestrator                                                 • Upload Binary to MongoDB GridFS
  • Run Fallacy & Claim Analysis                                                   • Run Background Whisper STT
  • Generate Opponent Rebuttal                                                     • Compute WPM, Fillers & Prosody
          │                                                                                 │
          └────────────────────────────────────────┬────────────────────────────────────────┘
                                                   ▼
                                     [AI Report & Scoring Engine]
                                                   │
                                                   ▼
                                     [Skill Score Vector Update]
                                                   │
                                                   ▼
                                     [Reports Page / CSV & PDF Export]
```

### 1. Debate Session Workflow
1. Learner selects a debate topic, difficulty level, and position (Affirmative or Negative).
2. Learner submits an argument statement.
3. FastAPI passes the input to the **LangGraph Orchestrator**.
4. LLM agents extract claims, score evidence, identify logical fallacies, and generate counterarguments.
5. AI opponent generates a structured rebuttal turn.
6. Scores and feedback are saved to MongoDB and PostgreSQL to update user skill scores.

### 2. Presentation Analysis Workflow
1. Learner captures an oral speech in the browser using the MediaRecorder API.
2. The audio binary (`audio/webm`) is uploaded to FastAPI and stored in **MongoDB GridFS**.
3. A background task invokes local **OpenAI Whisper** to transcribe the speech.
4. The Presentation Engine computes speaking pace (WPM), filler word density, clarity, and vocal confidence.
5. The full report payload is saved to MongoDB, and overall scores are rendered on the frontend.

---

## 👥 User Roles

| Role Name | Primary Responsibility | Core Capabilities |
| :--- | :--- | :--- |
| **Learner** | Practice debate and public speaking. | Join debate sessions, submit arguments, record presentations, view personal AI analysis reports, export CSV/PDF reports, and track skill progress. |
| **Debate Coach** | Guide and evaluate assigned learners. | View assigned learners, review debate and presentation reports, evaluate submissions, and provide coaching feedback. |
| **Educator** | Manage student class cohorts. | Create classes, enroll learners, assign practice topics, review class-wide performance analytics, and access the resource library. |
| **Administrator** | Manage platform configuration and users. | Create, edit, and deactivate user accounts, update user roles, manage debate topics, monitor AI executions, and inspect system logs. |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance asynchronous Python REST API gateway. |
| **Frontend Framework** | [React](https://react.dev/) | Component-driven single-page user interface. |
| **Frontend Build Tool** | [Vite](https://vite.dev/) | Development server and frontend application bundler. |
| **Primary Relational DB** | [PostgreSQL](https://www.postgresql.org/) | Persistence for users, roles, profiles, topics, sessions, and skill scores. |
| **Document Store & GridFS** | [MongoDB](https://www.mongodb.com/docs/) | Persistence for unstructured AI reports, execution logs, and binary presentation audio. |
| **AI Orchestration** | [LangGraph](https://langchain-ai.github.io/langgraph/) & [LangChain](https://python.langchain.com/) | State graph execution pipeline for multi-agent debate reasoning. |
| **Cloud LLM Provider** | [Groq](https://groq.com/) | Cloud LLM inference (`llama-3.1-8b-instant`). |
| **Local LLM Fallback** | [Ollama](https://ollama.com/) | Local LLM host gateway integration (`llama3.1:8b`). |
| **Speech Recognition** | [OpenAI Whisper](https://github.com/openai/whisper) | Local speech-to-text transcription engine for audio uploads. |
| **Vector Store / RAG** | [FAISS](https://github.com/facebookresearch/faiss) | Vector database storing evidence embeddings for grounded rebuttals. |
| **Containerization** | [Docker](https://docs.docker.com/) | Multi-container isolation, deployment, and service orchestration. |
| **Web Server** | [Nginx](https://nginx.org/) | Serves compiled React static SPA assets inside frontend container. |
| **Data Visualization** | [Recharts](https://recharts.org/) | Data visualization charts for score trends and metric distributions. |

---

## 📁 Project Structure

```text
Agentic-Ai-Debate-Coach/
├── [backend/](backend/)
│   ├── app/
│   │   ├── ai/                        # LangGraph orchestrator, LLM agents, prompts, RAG & scoring
│   │   ├── api/                       # FastAPI routes (auth, profile, debate, presentation, coach, admin)
│   │   ├── core/                      # Configuration, security & JWT settings
│   │   ├── db/                        # Database connection & init_db seeding script
│   │   ├── debate/                    # Debate domain schemas, services & report routes
│   │   ├── models/                    # SQLAlchemy ORM database models
│   │   ├── mongodb/                   # MongoDB connector, GridFS & debate repository
│   │   ├── presentation/              # Presentation analytics engine
│   │   └── speech/                    # Whisper speech-to-text engine
│   ├── Dockerfile                     # Backend container build specification
│   └── requirements.txt               # Python backend dependencies
├── [frontend/](frontend/)
│   ├── src/
│   │   ├── components/                # Reusable UI elements, navigation & chart shells
│   │   ├── context/                   # AuthContext provider
│   │   ├── pages/                     # Role dashboards, debate room, presentation studio & reports
│   │   ├── routes/                    # AppRoutes, ProtectedRoute & RoleRedirect
│   │   └── services/                  # Axios API clients
│   ├── Dockerfile                     # Nginx multi-stage frontend Dockerfile
│   └── package.json                   # Node.js dependencies
├── [database/](database/)
│   ├── [schema.sql](database/schema.sql)  # Baseline PostgreSQL schema
│   └── migration_*.sql                # Database migration scripts
├── [diagrams/](diagrams/)                 # High-resolution architecture & workflow diagrams
├── [docs/](docs/)                         # Project specifications & API documentation
├── [docker-compose.yml](docker-compose.yml) # Multi-container Docker Compose configuration
├── [.env.example](.env.example)           # Environment configuration template
├── [LICENSE](LICENSE)                     # MIT License file
└── README.md                              # Repository documentation
```

---

## 💻 Prerequisites

### Recommended (Docker Setup)
- **Docker Desktop**: [Docker Desktop](https://docs.docker.com/desktop/) (v20.10+) or Docker Engine with Docker Compose v2.

### For Non-Docker Development
- **Python**: [Python 3.10+](https://www.python.org/downloads/)
- **Node.js & npm**: [Node.js v18+](https://nodejs.org/) & npm v9+
- **PostgreSQL**: [PostgreSQL 15+](https://www.postgresql.org/download/)
- **MongoDB**: [MongoDB 6.0+](https://www.mongodb.com/try/download/community)

---

## ⚙️ Environment Configuration

1. Copy [.env.example](.env.example) to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables in `.env`:
   ```ini
   VITE_API_BASE_URL=http://127.0.0.1:8000

   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_postgres_password
   POSTGRES_DB=debate_coach_db
   DATABASE_URL=postgresql://postgres:your_secure_postgres_password@postgres:5432/debate_coach_db

   MONGODB_URL=mongodb://mongodb:27017
   MONGODB_DATABASE=agentic_ai_debate_coach

   SECRET_KEY=replace_with_a_secure_random_32_character_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   LLM_PROVIDER=groq
   GROQ_API_KEY=your_actual_groq_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant

   OLLAMA_BASE_URL=http://host.docker.internal:11434
   OLLAMA_MODEL=llama3.1:8b

   FAISS_INDEX_PATH=data/faiss
   ```

> [!CAUTION]
> Never commit real secrets, API keys, or production passwords to repository tracking.

---

## 💻 Running Without Docker

Follow these step-by-step instructions to run the application components manually on your local development machine:

### 1. Database Setup
1. Ensure PostgreSQL (port `5432`) and MongoDB (port `27017`) are installed and active.
2. Initialize the PostgreSQL database by running the baseline schema script:
   Execute [database/schema.sql](database/schema.sql) on your PostgreSQL server for database `debate_coach_db`.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows**:
     ```powershell
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Ensure `backend/.env` exists (copy from root `.env` or [.env.example](.env.example)).
6. Start the FastAPI ASGI server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
7. Verify backend service availability:
   - **Base API URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 3. Frontend Setup
1. Open a separate terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js package dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the frontend application:
   - **Default Frontend URL**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
   - *Note: Vite normally defaults to port 5173. If port 5173 is occupied, Vite will automatically select port 5174 or 5175. Use the exact URL printed in your terminal.*

---

## 🐳 Running with Docker

The project provides a multi-container setup configured via [docker-compose.yml](docker-compose.yml).

### Step-by-Step Launch Instructions:

1. **Clone Repository & Prepare Environment**:
   ```bash
   git clone https://github.com/springboardmentor922-wq/Agentic-AI-Debate-Coach-Presentation-Analysis-Platform-.git
   cd Agentic-Ai-Debate-Coach

   # Linux / macOS:
   cp .env.example .env
   cp .env.example backend/.env

   # Windows PowerShell:
   Copy-Item .env.example .env
   Copy-Item .env.example backend\.env
   ```

2. **Build and Launch Containers**:
   ```bash
   docker compose build
   docker compose up -d
   ```

3. **Check Container Status**:
   ```bash
   docker compose ps
   ```

4. **Inspect Application Logs**:
   ```bash
   docker compose logs -f
   ```

5. **Stop Container Environment**:
   ```bash
   docker compose down
   ```

### Docker Services Architecture:

| Service | Container Name | Host Port | Purpose |
| :--- | :--- | :--- | :--- |
| `frontend` | `debate_coach_frontend` | `5173:80` | Serves compiled static React SPA assets via Nginx. |
| `backend` | `debate_coach_backend` | `8000:8000` | Runs FastAPI gateway, Uvicorn ASGI, AI Graph & Speech engines. |
| `postgres` | `debate_coach_postgres` | `5432:5432` | Relational database storing core application data. |
| `mongodb` | `debate_coach_mongodb` | `27017:27017` | Document store for AI reports & GridFS binary audio files. |

---

## 🌐 IPv4 Networking Detail

The verified Docker Compose setup uses explicit IPv4 loopback (`127.0.0.1`) for API configuration (`VITE_API_BASE_URL=http://127.0.0.1:8000`). Using explicit `127.0.0.1` prevents IPv6 resolution mismatches on local development machines.

---

## 🔗 Application URLs

When running under the verified Docker Compose setup or local development:

- **Frontend Application**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Backend API Gateway**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Schema**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 🔐 Demo Credentials

> [!NOTE]
> The database initialization script (`init_db`) automatically seeds demonstration accounts for testing.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Learner** | `learner.demo@example.com` | `Demo@Learner2026` |
| **Debate Coach** | `coach.demo@example.com` | `Demo@Coach2026` |
| **Educator** | `educator.demo@example.com` | `Demo@Educator2026` |
| **Administrator** | `admin.demo@example.com` | `Demo@Admin2026` |

*These accounts are provided only for demonstration and testing purposes and must NOT be used as production credentials.*

---

## 📚 API Documentation

FastAPI automatically generates interactive OpenAPI documentation endpoints:
- [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI)
- [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) (ReDoc Viewer)

### Core Implemented API Summary:

| Module | Method | Route Endpoint | Purpose | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register new user account | Public |
| | `POST` | `/auth/login` | Authenticate & issue JWT token | Public |
| | `GET` | `/auth/me` | Fetch authenticated user details | Logged-in |
| **Profile** | `GET` / `PUT` | `/profile/me` | Read or update profile preferences | Logged-in |
| **Debate Topics** | `GET` | `/debate-topics` | List debate topics | Logged-in |
| | `POST` | `/debate-topics` | Create new debate topic | Admin / Coach / Educator |
| **Debate Sessions**| `GET` / `POST` | `/debate-sessions` | Retrieve or schedule sessions | Logged-in |
| **AI Simulation** | `POST` | `/api/v1/debate/analyze` | Run full LangGraph debate graph | Logged-in |
| | `POST` | `/api/v1/ai-simulation/turn` | Process turn & generate AI rebuttal | Logged-in |
| **Presentation** | `POST` | `/api/v1/presentation/recordings/upload` | Upload audio to GridFS & start STT | Learner |
| | `GET` | `/api/v1/presentation/recordings/{id}/report` | Fetch presentation analytics report | Learner / Coach |
| | `GET` | `/api/v1/presentation/recordings/{id}/audio` | Stream binary audio from GridFS | Learner / Coach |
| **Reports** | `GET` | `/api/v1/debate/reports` | Get role-scoped reports | Role-Scoped |
| **Admin** | `GET` / `POST` | `/api/v1/admin/users` | Manage platform accounts | Administrator |

---

## 🗄️ Database Architecture

The platform uses a dual-database design:

| Engine | Component / Collection | Schema Coverage | Purpose |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 15** | Relational Database ([database/](database/)) | `users`, `roles`, `user_profiles`, `user_skills`, `debate_topics`, `debate_sessions`, `session_rounds`, `session_participants`, `presentation_analyses`, `educator_classes`, `coach_assignments`, `notifications` | Primary transactional store for accounts, RBAC, session metadata, skill tracking vectors, and presentation status tracking. |
| **MongoDB 6** | Document Store | `presentation_analysis`, `debate_analysis`, `conversation_memory`, `ai_executions` | Secondary document store for unstructured AI analysis JSON payloads, Whisper transcripts, turn history, and execution trace logs. |
| **MongoDB GridFS** | Binary Store (`fs.files`, `fs.chunks`) | Audio Binaries (`audio/webm`) | Storage bucket for raw presentation audio files uploaded from the browser. |

---

## 🧠 AI & Agentic Architecture

AI debate reasoning is orchestrated through a multi-node **LangGraph** state graph:

```
[START] ➔ [Load Context & Memory] ➔ [Argument Analysis] ➔ [Logical Fallacy Detection]
                                                                  │
[END] ◄─ [Persist Results & Update Skills] ◄─ [Coaching & Learning Path] ◄─ [Judge Scoring] ◄─ [AI Opponent Turn] ◄─ [Counterarguments]
```

### Deterministic Performance Scoring Matrix:
- **Argument Quality**: 30%
- **Evidence Usage**: 20%
- **Logical Consistency**: 20%
- **Rebuttal Effectiveness**: 15%
- **Communication Skills**: 15%

---

## 🎙️ Presentation Analytics

1. **Audio Capture**: Captured via browser MediaRecorder API (`audio/webm`).
2. **GridFS Storage**: Streamed to FastAPI `/recordings/upload` and saved directly to MongoDB GridFS.
3. **Background STT**: Local OpenAI Whisper transcribes speech to text.
4. **Speech Metrics**:
   - **Speaking Pace**: WPM calculated against the 130–160 WPM ideal benchmark.
   - **Filler Word Detection**: Identifies filler words (*'um'*, *'uh'*, *'like'*, *'actually'*, *'basically'*).
   - **Clarity & Confidence**: Evaluated based on sentence structures, pace, and disfluency density.
5. **Deterministic Overall Score**: Weighted calculation combining Pace (20%), Filler Control (25%), Clarity (20%), Confidence (20%), and Engagement (15%).

---

## 📊 Reports & Export

- **Interactive UI Reports**: Detailed metric breakdowns, WPM pace gauges, filler word counts, and Recharts visualization charts.
- **Client-Side CSV / Excel Export**: Implemented in `Reports.jsx` to generate downloadable CSV spreadsheets.
- **Browser Print / Save as PDF**: PDF report generation is handled via standard browser print stylesheets (`window.print()`) using the browser's *Print → Save as PDF* workflow.

---

## 🧪 Testing & Verification

Project features were verified through local testing and health checks:
- **FastAPI Endpoint & Suite Testing**: 35 automated tests passing 100% cleanly across 8 test modules (`test_auth_rbac.py`, `test_chatbot_routing.py`, `test_coach_workflow.py`, `test_debate_topic_service.py`, `test_educator_isolation.py`, `test_presentation_analysis.py`, `test_presentation_storage.py`, `test_scoring_engine.py`) verifying endpoint routing, authentication tokens, RBAC rules, audio uploads, Whisper STT, and scoring.
- **Container Health Checks**: Health status checks configured in [docker-compose.yml](docker-compose.yml) (`pg_isready`, `mongosh ping`, `/health`).
- **Workflow Verification**: Verified registration, login, role dashboard navigation, debate graph executions, audio uploads, Whisper STT transcript generation, CSV export, and browser PDF printing.

---

## 📦 Dockerization

Docker Compose provides local multi-container execution for:
- **React Frontend**: Compiled static SPA served via Nginx.
- **FastAPI Backend**: ASGI server handling REST routes, LangGraph AI orchestration, and Whisper STT.
- **PostgreSQL Database**: Relational database for core transactional persistence.
- **MongoDB Database**: Document database and GridFS binary audio bucket.

---

## 🔒 Security

- **JWT Authentication**: Stateless token authorization using PyJWT with configurable expiration timeouts.
- **Role-Based Authorization**: API route protection enforcing RBAC checks.
- **Password Protection**: Industry-standard bcrypt hashing via passlib.
- **Environment Isolation**: Secret keys stored in `.env` files excluded via `.gitignore` and `.dockerignore`.

---

## 🚀 Deployment Status

| Deployment Target | Status |
| :--- | :--- |
| **Local Docker Compose** | ✅ Implemented & Verified |
| **Local Development** | ✅ Supported |
| **Cloud Deployment** | 🔮 Future Enhancement |

*Cloud deployment is not part of the current implemented scope. The project is containerized and verified for local execution.*

---

## 🗺️ Milestone Completion

| Milestone | Target Requirements | Status |
| :--- | :--- | :--- |
| **Milestone 1** | Foundation architecture, PostgreSQL schema, React UI, JWT Auth, RBAC, Profiles, Debate Sessions | **Completed** |
| **Milestone 2** | Argument analysis engine, claims extraction, fallacy detection taxonomy, initial scoring | **Completed** |
| **Milestone 3** | Counterargument engine, AI debate simulation, LangGraph orchestrator, Judge Agent, Coach & Recommendation agents, Recharts dashboards | **Completed** |
| **Milestone 4** | Media capture, MongoDB GridFS storage, Whisper STT transcription, Presentation Analytics Engine (WPM, Fillers, Prosody), Reports export, Dockerization | **Completed** |

---

## 🖼️ Screenshots & Diagrams

### System Architecture Diagram
![System Architecture](diagrams/system_architecture.png)

### Overall Application Workflow
![Overall Workflow](diagrams/overall_workflow.png)

### Database ER Diagram
![ER Diagram](database/er_diagram.png)

### Authentication & RBAC Workflow
![Authentication Workflow](diagrams/authentication_workflow.png)

### Application User Interface Screenshots

> Add project screenshots below:

#### Login Page
<!-- Add Login Screenshot Here -->

#### Learner Dashboard
<!-- Add Learner Dashboard Screenshot Here -->

#### AI Debate Simulation Room
<!-- Add AI Debate Simulation Screenshot Here -->

#### Presentation Analytics Studio & Report
<!-- Add Presentation Analytics Screenshot Here -->

#### Reports & Export Center
<!-- Add Reports Page Screenshot Here -->

---

## ⚠️ Known Limitations

- **Local Docker Scope**: Configured and verified for local execution via Docker Compose rather than cloud clusters.
- **PDF Export Workflow**: PDF export relies on browser-native *Print / Save as PDF* (`window.print()`) rather than a backend PDF renderer.
- **LLM Inference Requirement**: Requires a Groq API key or an active local Ollama instance for LLM inference.
- **Whisper Hardware Dependency**: Local speech transcription speed depends on host CPU/GPU hardware capabilities.

---

## 🔮 Future Improvements

- **Cloud Deployment**: Automated CI/CD pipeline deploying Docker containers to AWS ECS or Azure Container Apps.
- **Real-Time WebSockets Prosody**: Streaming speech analysis providing instant audio feedback during recording.
- **Video Stance Analysis**: Incorporating computer vision models for posture and facial stance evaluation.
- **Advanced RAG Knowledge Sources**: Expanding vector embeddings to pull from academic debate research databases.

---

## 🔗 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [OpenAI Whisper Repository](https://github.com/openai/whisper)
- [FAISS Repository](https://github.com/facebookresearch/faiss)

---

## 👨‍💻 Author

**Chilakala Manikanta Sai Anurudh**

GitHub Repository: [Agentic-AI-Debate-Coach-Presentation-Analysis-Platform-](https://github.com/springboardmentor922-wq/Agentic-AI-Debate-Coach-Presentation-Analysis-Platform-.git)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
