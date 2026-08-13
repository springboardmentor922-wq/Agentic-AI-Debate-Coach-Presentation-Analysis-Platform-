# Software Requirements Specification (SRS)
## Agentic AI Debate Coach & Presentation Analysis Platform

---

## 1. Introduction

### 1.1 Purpose
This document specifies the Functional Requirements (FRs) and Non-Functional Requirements (NFRs) for the **Agentic AI Debate Coach & Presentation Analysis Platform**.

### 1.2 System Scope
The platform provides real-time speech analytics, multi-turn AI debate simulations, automated logical fallacy detection, role-based dashboards, and executive PDF/Excel report exports.

---

## 2. Functional Requirements (FRs)

### 2.1 User Authentication & Security
- **FR-1**: The system MUST allow users to register with full name, email, password, and role.
- **FR-2**: The system MUST hash user passwords using Bcrypt with a salt factor of at least 12.
- **FR-3**: The system MUST authenticate users via JSON Web Tokens (JWT) using HS256 algorithm.
- **FR-4**: The system MUST support Role-Based Access Control (RBAC) for four roles: `LEARNER`, `COACH`, `EDUCATOR`, `ADMIN`.

### 2.2 User Profile & Personalization
- **FR-5**: Users MUST be able to view and update their profile details, experience level, and debate preferences.
- **FR-6**: The system MUST track baseline skill metrics (Communication, Logic, Delivery) for each user.

### 2.3 Live Speech Studio
- **FR-7**: The studio MUST record microphone audio using Web Speech API and Web Audio API.
- **FR-8**: The studio MUST render a real-time FFT frequency waveform on an HTML5 canvas at 60 FPS.
- **FR-9**: The studio MUST calculate speech pace in Words Per Minute (WPM).
- **FR-10**: The studio MUST flag filler words ("um", "like", "basically", "you know") in real time.

### 2.4 AI Debate Simulation Room
- **FR-11**: The system MUST allow users to select from a repository of debate topics.
- **FR-12**: The system MUST support multiple AI debate personas (*Socrates*, *The Pragmatist*, *The Aggressor*).
- **FR-13**: The system MUST support multi-turn debate exchanges with round timers.
- **FR-14**: The system MUST generate contextually relevant AI rebuttals for each turn.

### 2.5 NLP Logical Fallacy Detection
- **FR-15**: The NLP engine MUST automatically analyze speech and debate transcripts for fallacies.
- **FR-16**: The engine MUST identify *Ad Hominem*, *Straw Man*, *False Dilemma*, *Slippery Slope*, and *Appeal to Authority*.
- **FR-17**: Flagged fallacies MUST be displayed as color-coded badges with explanations.

### 2.6 Analytics & Reporting
- **FR-18**: The system MUST display user skill growth via interactive Radar plots.
- **FR-19**: The system MUST export PDF summary reports using ReportLab.
- **FR-20**: The system MUST export Excel detailed session workbooks using OpenPyXL.

### 2.7 Educator & Admin Features
- **FR-21**: Educators MUST be able to view cohort performance metrics and fallacy statistics.
- **FR-22**: Admins MUST be able to manage user accounts, system logs, and global topic configurations.

---

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance
- **NFR-1**: API endpoint response time MUST be less than 200ms for standard database CRUD operations.
- **NFR-2**: NLP fallacy analysis MUST return results within 1.5 seconds per turn.
- **NFR-3**: Real-time audio waveform canvas MUST render smoothly at 60 FPS without UI jank.

### 3.2 Security & Compliance
- **NFR-4**: All network traffic MUST be transacted over HTTPS/TLS in production.
- **NFR-5**: JWT tokens MUST expire after 24 hours of inactivity.
- **NFR-6**: Database connections MUST use parametrized queries to prevent SQL injection.

### 3.3 Scalability & Compatibility
- **NFR-7**: The FastAPI backend MUST support stateless containerized deployment via Docker and Docker Compose.
- **NFR-8**: The React frontend MUST be fully responsive on Desktop (1920x1080, 1366x768) and Tablet viewports.
- **NFR-9**: The database ORM MUST support seamless migration from SQLite to PostgreSQL.
