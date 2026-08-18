🎙️ AI Debate Coach & Presentation Analysis Platform

A full-stack, role-based web application for practicing, coaching, and evaluating debates. Learners debate live against an AI opponent while the platform automatically detects logical fallacies, scores arguments, analyzes spoken delivery, and generates coaching feedback — with dedicated workflows for coaches, educators, and administrators.

🎥 Screen Recording

[View the project screen recording](https://drive.google.com/file/d/1x8pQeyRau94WCB1JfJ4yiQKgJOXM8zEr/view?usp=sharing)

📄 Full technical documentation (architecture, database schema, API flow, AI agents, role permissions, and file-by-file breakdown) lives in [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md).

✨ Features

👨‍🎓 Learner
- Start live debates against an AI opponent in multiple formats: One-on-One, Parliamentary, Oxford, Policy, Public Forum, and AI Debate Simulation.
- Submit debate turns as audio (recorded and auto-transcribed) or typed text.
- Get instant, per-turn AI feedback: logical fallacy detection, argument scoring, and (for spoken turns) delivery analysis.
- Practice with a selectable AI opponent difficulty: Novice, Advanced, Master.
- Track skills over time (Argument Clarity, Evidence Usage, Logical Consistency, Rebuttal Effectiveness, Communication Delivery), computed live from debate performance.
- Get a standing, personalized coaching recommendation built from full debate history, not just one session.
- Receive feedback and assigned practice tasks from a coach.
- Choose or be assigned a coach.
- Use standalone AI tools outside of a debate: Argument Analyzer, Fallacy Detector, Counterargument Generator, Presentation Analyzer.
- Export a completed session's summary as PDF or Excel.

🎯 Debate Coach
- View assigned learners and their sessions.
- Leave written feedback on individual debate sessions.
- Assign and track practice tasks for learners.
- View skill-gap analytics across assigned learners.
- See top-performing learners and pending-feedback sessions.
- Use a dedicated full-page AI Debate Coach chat.

📚 Educator
- View all learners ("students") and their sessions platform-wide.
- View skill-gap analytics across all learners.
- Leave feedback and assign tasks, same as a coach.
- See top-performing learners.

🛡️ Admin
- Manage users: view all accounts, change roles, delete users.
- Assign a coach to a learner.
- View platform-wide analytics: role distribution, session status breakdown, platform average score, recent activity feed.
- Check system health (AI service / email service configuration).
- Export a platform-wide report as Excel.

🤖 AI Agents
- **Auditor** — detects logical fallacies (Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring).
- **Scorer** — extracts the claim/evidence and scores Clarity, Relevance, Evidence Strength, Logical Consistency, and Persuasiveness into a weighted overall score.
- **Opponent** — generates a structured, format- and difficulty-aware rebuttal, a challenge question, and a strategy tip.
- **Presentation Analyzer** — deterministic filler-word detection plus AI-scored confidence, clarity, and engagement for spoken turns.
- **Session Summary** — a short, punchy end-of-session coaching report.
- **Recommendation Engine** — a standing, full-history-based coaching recommendation, with a cold-start default for new learners.
- **Assistant** — a friendly floating chatbot available on every page.
- All orchestrated turn-by-turn with **LangGraph** and running on **Groq** (`llama-3.3-70b-versatile` + hosted Whisper for transcription).

🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, HTML, CSS (no framework, no build step) |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite |
| AI / Orchestration | Groq API (`llama-3.3-70b-versatile`, Whisper `whisper-large-v3`), LangChain (`langchain-groq`), LangGraph |
| Reports | openpyxl (Excel), ReportLab (PDF) |

📋 Prerequisites
- Python 3.10+
- A free [Groq API key](https://console.groq.com/)

🚀 Getting Started

1. Clone the Repository
```bash
git clone https://github.com/Siri974/AI-Debate-Coach.git
cd AI-Debate-Coach
```

2. Install Backend Dependencies
```bash
pip install fastapi uvicorn[standard] python-dotenv pydantic[email] \
            langchain-groq langgraph groq openpyxl reportlab
```

3. Configure Environment Variables

Create a `.env` file inside `backend/`:
```env
GROQ_API_KEY=your_groq_api_key_here

# Optional — enables real OTP emails. Without these, OTP codes are
# printed to the server console during login instead.
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=you@example.com
```

4. Run the Backend
```bash
cd backend
python main.py
```
Backend API & Frontend: http://localhost:8000

The frontend is served directly by the FastAPI backend — no separate frontend server or build step is required. The SQLite database (`backend/debate_coach.db`) and a `recordings/` folder are created automatically on first run, along with demo accounts.

🔐 Authentication

The application uses a signed session-token flow with two-step login:
1. Email + password is verified.
2. A one-time passcode (OTP) is emailed to the account (or printed to the server console if SMTP isn't configured).
3. Entering the correct OTP returns a signed session token, stored client-side and sent as `Authorization: Bearer <token>` on every request.

Registration is open to Learner, Debate Coach, and Educator roles. Administrator accounts are created via seed data only.

🧪 Demo Accounts

The app creates these users automatically on first run:

| Role | Email | Password |
|---|---|---|
| Learner | learner@example.com | password123 |
| Debate Coach | coach@example.com | password123 |
| Educator | educator@example.com | password123 |
| Administrator | admin@example.com | password123 |

Logging in with these still requires completing the OTP step above.

🎨 UI Design

The application uses a clean, single-page interface featuring:
- Role-specific dashboards and navigation
- A live Debate Room with in-browser audio recording
- A persistent floating AI assistant available on every page
- An in-app notifications panel
- Interactive skill and performance views

📁 Project Structure

```
AI-Debate-Coach/
│
├── backend/
│   ├── main.py               # Active FastAPI application (run this)
│   ├── server.py              # Legacy Milestone-1 backend (superseded)
│   ├── database.py            # SQLite schema, migrations, seed data, queries
│   ├── auth.py                 # Password hashing, session tokens, OTP login
│   ├── agents/
│   │   └── chatbot_engine.py   # LangGraph orchestrator for a debate turn
│   ├── services/                # One file per AI agent / export / speech service
│   └── schemas/                  # Pydantic schemas for structured AI outputs
│
├── frontend/
│   ├── index.html
│   ├── app.js                    # Full client app: routing, rendering, API calls
│   └── styles.css
│
├── docs/
│   └── PROJECT_DOCUMENTATION.md    # Full technical reference
│
└── README.md
```

📌 Current Status & Future Enhancements

Implemented: live AI-opponent debates, logical fallacy detection, argument and delivery scoring, speech-to-text, session summaries, standing recommendations, coach/educator/admin workflows, and PDF/Excel export.

Not yet implemented:
- Automated tests and CI
- A production database (e.g. PostgreSQL) in place of SQLite
- Docker packaging and cloud deployment configuration
- Real-time (WebSocket) updates
- A checked-in dependency manifest (`requirements.txt`)

See [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md) for the complete breakdown of completed, partial, and missing features.

📄 License

See [`LICENSE`](LICENSE).
