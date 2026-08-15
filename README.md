# 🎤 Agentic AI Debate Coach & Presentation Analysis Platform


## 📌 1. Project Overview

**Agentic AI Debate Coach & Presentation Analysis Platform** is an AI-powered web application that helps learners improve **debating, argumentation, logical reasoning, presentation skills, and communication abilities** through AI-driven analysis, coaching, simulations, and performance tracking.

The platform combines **LLMs, speech analysis, argument mining, and agentic AI workflows** to simulate real debate environments, detect logical fallacies, generate counterarguments, and deliver personalized coaching — built for students, debate clubs, educators, trainers, and professionals.

---

## 🎥 2. Video Demonstration

### Project Workflow Video

https://drive.google.com/file/d/1yH1wDAYbRUXZbxYiaKT_fkIh_2yCeq3_/view?usp=drive_link

---

## 🚀 3. Live Deployment Links

### Frontend Application

https://ai-debate-coach-1-n8j8.onrender.com/

### Backend API

https://ai-debate-coach-ss8t.onrender.com/

---

## ✨ 4. Key Features

### 🔐 Authentication & Access Control
- Email OTP Verification
- JWT Access Token & Refresh Token
- Role-Based Access Control (RBAC)
- Four Distinct Roles:
  - 🎓 Learner
  - 🧑‍🏫 Debate Coach
  - 👩‍🏫 Educator
  - 🛠️ Administrator

### 🧠 AI-Powered Debate & Presentation Tools
- Argument Analysis & Scoring Engine
- Logical Fallacy Detection (Ad Hominem, Straw Man, Slippery Slope, etc.)
- AI-Generated Counterarguments & Rebuttals
- AI Debate Opponent & Live Debate Simulation
- Speech-to-Text Transcription (Audio/Video Upload)
- Presentation & Confidence Analysis
- AI Debate Coach Chatbot
- Personalized Coaching & Learning Plans

### 📊 Analytics & Reporting
- Skill Gap Analysis
- Performance Tracking Dashboards
- PDF Report Generation
- Messaging & Notification System

---

## 🏁 5. Milestone-wise Implementation

### ✅ Milestone 1 — Foundation & Core Setup
- User Registration & Login
- Email OTP Verification
- JWT Authentication
- Role Management
- Profile Management
- Dashboard Setup
- Debate Session Management

### ✅ Milestone 2 — Argument Intelligence
- Argument Analysis Engine
- Logical Fallacy Detection
- AI Opponent
- Counterargument Generation
- Analysis History

### ✅ Milestone 3 — Simulation & Presentation Coaching
- AI Debate Simulation
- Live Debate Sessions
- Audio & Video Upload
- Speech Transcription
- Presentation Analysis
- Personalized Learning Plans
- AI Debate Coach Chatbot
- Coaching Plans

### ✅ Milestone 4 — Analytics, Reporting & Deployment
- PDF Report Generation
- Skill Gap Analysis
- Messaging System
- Notifications
- Analytics Dashboard
- Docker Deployment
- Performance Tracking

---

## 🛠️ 6. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | UI Development |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Axios | API Communication |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| Python | Core Language |
| FastAPI | REST API Framework |
| JWT Authentication | Secure Auth |
| MongoDB Atlas | Cloud Database |

### AI / LLM
| Technology | Purpose |
|------------|---------|
| OpenAI | Language Model Reasoning |
| Anthropic Claude | Language Model Reasoning |
| LangChain | Agentic AI Orchestration |
| Faster Whisper | Speech-to-Text |
| Rule-Based Fallback Engine | Reliability Backup |

### Deployment
| Technology | Purpose |
|------------|---------|
| Render | Cloud Hosting |
| Docker | Containerization |
| GitHub | Version Control |

---

## 🏗️ 7. System Architecture Overview

```
┌────────────────────┐        ┌────────────────────┐        ┌──────────────────────┐
│   React Frontend    │  <-->  │   FastAPI Backend   │  <-->  │   MongoDB Atlas DB    │
│ (Vite + Tailwind)    │        │  (JWT + REST APIs)   │        │  (Users, Sessions,    │
└────────────────────┘        └─────────┬──────────┘        │   Reports, Analysis)  │
                                          │                    └──────────────────────┘
                                          ▼
                        ┌──────────────────────────────────┐
                        │   Agentic AI Intelligence Layer   │
                        │  OpenAI • Claude • LangChain •    │
                        │  Faster Whisper • Fallback Engine │
                        └──────────────────────────────────┘
```

**Core Modules:**
- Authentication System
- User Management
- Debate Session Management
- Argument Analyzer
- Fallacy Detector
- Counterargument Generator
- AI Debate Simulation
- Presentation Analysis
- Coaching Plans
- Learning Plans
- Reports & Analytics
- Messaging System
- Notifications

---

## 📂 8. Project Structure

```
Agentic-AI-Debate-Coach/
│
├── backend/                # FastAPI backend, AI engines, APIs, DB models
├── frontend/                # React.js + Vite frontend application
├── docker-compose.yml        # Multi-service Docker orchestration
└── README.md                 # Project documentation
```

---

## ⚙️ 9. Installation Steps

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas account
- Docker (optional, for containerized deployment)

### 🔹 Clone the Repository
```bash
git clone <repository-url>
cd Agentic-AI-Debate-Coach
```

### 🔹 Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables (.env)
# MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.

uvicorn main:app --reload
```

### 🔹 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 🔹 Docker Setup (Optional)
```bash
docker-compose up --build
```

---

## 🔄 10. Usage Workflow

1. **Register/Login** using email OTP verification.
2. **Select your role** — Learner, Debate Coach, Educator, or Administrator.
3. **Create or join a debate session** based on chosen debate format.
4. **Submit arguments** via text, audio, or video for AI analysis.
5. **Receive AI feedback** — fallacy detection, argument scoring, and rebuttals.
6. **Practice with the AI Debate Opponent** in simulated debate rounds.
7. **Get presentation feedback** — confidence, clarity, pacing, and engagement.
8. **Follow personalized coaching & learning plans** generated by the AI Coach.
9. **Track progress** through analytics dashboards and downloadable PDF reports.

---

## 🔮 11. Future Enhancements

- 🌍 Multi-language debate support
- 🎯 Real-time multiplayer debate tournaments
- 📱 Dedicated mobile application
- 🧩 Advanced emotion & sentiment analysis in speech
- 🏆 Gamification with leaderboards and badges
- 🔗 LMS Integration for institutions

---

## 👨‍💻 12. Author Information

**Project:** Agentic AI Debate Coach & Presentation Analysis Platform
**Type:** Internship / Academic Final Submission Project
**Developed as an AI-powered communication and debate skill-building platform.**

---

## 🏁 13. Conclusion

The **Agentic AI Debate Coach & Presentation Analysis Platform** demonstrates the practical application of **Agentic AI, LLMs, and NLP** in the domain of education and skill development. By combining argument intelligence, speech analytics, and personalized coaching, the platform delivers a complete, end-to-end solution for improving debating and presentation abilities — built, tested, and deployed as a production-ready system.

---
