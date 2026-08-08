# 🎙️ Agentic AI Debate Coach & Presentation Analysis Platform

An AI-powered web platform designed to help users evaluate and improve their argumentation, presentation, and public speaking skills.

This project features a **Python FastAPI backend** (for AI orchestration, session management, NLP logical fallacy detection, and scoring) and a **React + Vite frontend** (featuring a premium dark-mode dashboard, real-time microphone speech analysis with interactive visual waveforms, and multi-turn debate simulations).

---

## 🚀 Key Features

* **🗣️ Live Speech Studio**: Record presentations in real-time. Features browser-native Speech-to-Text via the Web Speech API, a live frequency-domain canvas visualizer via the Web Audio API, real-time pace monitoring (words per minute), and filler-word detection (e.g., "um", "like", "basically").
* **🤖 AI Debate Room**: Engage in multi-turn debate simulations against simulated AI personalities (e.g., *Socrates* - probing/analytical, *The Pragmatist* - fact-focused, *The Aggressor* - direct/assertive) with automated timers and real-time fallacy tracking.
* **🧠 NLP Fallacy Detector**: Automatically analyzes speeches and debate turns to flag logical fallacies (e.g., Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority).
* **📊 Premium Analytics Dashboard**: View skill growth charts (radar plots for communication, logic, and delivery), session history, and role-specific views (Learner, Coach, Educator, Admin).
* **📑 Report Exports**: Download detailed performance summary reports in PDF or Excel formats.

---

## 🛠️ Tech Stack

### Backend
* **Framework**: FastAPI
* **Database**: SQLite (default setup) with PostgreSQL compatibility built-in
* **ORM**: SQLAlchemy
* **Analytics & Reports**: Pandas, ReportLab, OpenPyXL
* **Task Runner**: Uvicorn

### Frontend
* **Build System**: Vite (React)
* **Styling**: Vanilla CSS with custom utility variables, deep card shadows, responsive layouts, and glassmorphic designs
* **APIs**: Web Speech API (`SpeechRecognition`), Web Audio API (`AudioContext`)

---

## 📁 Repository Structure

```
/ (workspace root)
├── backend/
│   ├── app/
│   │   ├── core/           # Security, configuration, JWT auth
│   │   ├── database/       # DB connection (SQLite/PostgreSQL setup)
│   │   ├── models/         # SQLAlchemy DB models (User, Profile, DebateSession, etc.)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── routers/        # FastAPI route controllers (auth, debate, presentation, coaching, admin)
│   │   ├── services/       # Core NLP logic, AI debate simulator, and exports
│   │   └── main.py         # App entrypoint
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Audio waveforms, charts, modals, card layouts
│   │   ├── contexts/       # React contexts (auth, active debate)
│   │   ├── pages/          # Dashboard, SpeechStudio, DebateRoom, ProfileSettings
│   │   └── index.css       # Core typography, dark-mode variables, glassmorphism
│   ├── package.json        # Frontend scripts and dependencies
│   └── Dockerfile
├── docker-compose.yml      # Multi-container orchestration config
└── SETUP.md                # Comprehensive installation & plan details
```

---

## 💻 How to Run the Project

### Method 1: Using Docker Compose (Recommended)
If you have Docker installed, you can spin up the entire application stack (Frontend + Backend + DB) with a single command from the workspace root:

```bash
docker-compose up --build
```
* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend:** [http://localhost:8000](http://localhost:8000)

---

### Method 2: Running Locally (Development Mode)

#### 1. Backend Server Setup
From the workspace root directory:
1. Activate the Python virtual environment:
   ```powershell
   venv\Scripts\activate
   ```
2. Install Python requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the FastAPI application:
   ```bash
   python -m backend.app.main
   ```
   *The backend will be running at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

#### 2. Frontend App Setup
In a separate terminal, from the workspace root:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
   *The frontend dev server will be running at [http://localhost:5173](http://localhost:5173).*

---

## 🔗 Key Project Code Links
* **Entrypoint**: [backend/app/main.py](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/backend/app/main.py)
* **Fallacy Engine**: [fallacy.py](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/backend/app/services/fallacy.py)
* **AI Debate Agent**: [debate_ai.py](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/backend/app/services/debate_ai.py)
* **Speech Evaluator**: [speech.py](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/backend/app/services/speech.py)
* **Live Speech Studio Component**: [SpeechStudio.jsx](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/frontend/src/pages/SpeechStudio.jsx)
* **Debate Room UI**: [DebateRoom.jsx](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/frontend/src/pages/DebateRoom.jsx)
* **Unified Dashboard UI**: [Dashboard.jsx](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/frontend/src/pages/Dashboard.jsx)
* **Detailed Setup Document**: [SETUP.md](file:///c:/Users/Debarshi%20Chatterjee/OneDrive/Desktop/AI%20Project/SETUP.md)
