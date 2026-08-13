# Milestone 4 Architecture & Presentation Analytics Technical Documentation

## 1. Overview
Milestone 4 introduces the end-to-end **Presentation Analytics Engine** to the **Agentic AI Debate Coach Platform**. The engine enables learners to record live spoken presentations in the browser, upload audio binaries directly to MongoDB GridFS, execute Whisper speech-to-text transcription, compute deterministic speech/prosody metrics, and view rich performance reports.

---

## 2. Core Architecture & Workflow Pipeline

```
[Browser Microphone]
       │ MediaRecorder API (audio/webm)
       ▼
[FastAPI Upload API] (POST /api/v1/presentation/recordings/upload)
       │
       ├───> [MongoDB GridFS] (Stores raw audio binary in fs.files & fs.chunks)
       │
       └───> [PostgreSQL DB] (Creates presentation_analyses row, status = 'STORED')
               │
               ▼
[Background Task Execution]
       │
       ├── 1. [Speech-to-Text (Whisper)]
       │      • Retrieves binary audio stream from GridFS
       │      • Runs local Whisper base model
       │      • Stores transcript & duration in PostgreSQL
       │      • Status: 'TRANSCRIBED'
       │
       └── 2. [Presentation Analytics Engine]
              • Speech Pace (WPM vs. target range 130-160 WPM)
              • Filler Words Detection ('um', 'uh', 'like', 'actually', 'basically')
              • Clarity Assessment (Type-Token Ratio & sentence structure)
              • Prosody Analysis (Pitch variance, Energy variance, Pause count)
              • Estimated Confidence Score & Audience Engagement Score
              • Deterministic Overall Presentation Score (0-100)
              • Generates Strengths, Areas for Improvement & Recommendations
              • Persists full JSON report in MongoDB presentation_analysis collection
              • Status: 'COMPLETED'
```

---

## 3. Deterministic Scoring Model

| Metric Component | Formula & Calculation | Weight | Range |
| :--- | :--- | :--- | :--- |
| **Speech Pace (WPM)** | $\text{WPM} = \frac{\text{Word Count}}{\text{Duration in Minutes}}$. 100 points for 130–160 WPM, deducting 1.5 pts/WPM outside range. | **20%** | $0 - 100$ |
| **Filler Words Control** | Density = $\frac{\text{Filler Count}}{\text{Word Count}} \times 100$. Score = $\max(0, 100 - (\text{density} \times 15))$. | **25%** | $0 - 100$ |
| **Speech Clarity** | $\min(100, (\text{Type-Token Ratio} \times 65) + (\text{Sentence Structure Score} \times 0.35))$. | **20%** | $0 - 100$ |
| **Vocal Confidence** | $0.40 \cdot \text{Filler Score} + 0.30 \cdot \text{Pace Score} + 0.30 \cdot \text{Prosody Score}$. | **20%** | $0 - 100$ |
| **Audience Engagement** | $0.50 \cdot \text{Prosody Score} + 0.50 \cdot \text{Clarity Score}$. | **15%** | $0 - 100$ |
| **Overall Score** | **Weighted sum of all 5 components.** Completely deterministic. | **100%** | **$0 - 100$** |

---

## 4. API Endpoints

- `POST /api/v1/presentation/recordings/upload`: Uploads browser-recorded audio (multipart/form-data) to GridFS and creates DB record.
- `GET /api/v1/presentation/recordings`: Lists all presentation recordings for authenticated learner.
- `GET /api/v1/presentation/recordings/{id}`: Fetches presentation metadata.
- `GET /api/v1/presentation/recordings/{id}/status`: Polls processing status (`STORED`, `TRANSCRIBING`, `ANALYZING`, `COMPLETED`, `FAILED`).
- `GET /api/v1/presentation/recordings/{id}/report`: Retrieves complete performance report document from MongoDB.
- `GET /api/v1/presentation/recordings/{id}/audio`: Streams binary audio file from MongoDB GridFS for inline player playback.
- `GET /api/v1/coach/presentation-submissions`: Allows coaches to review assigned learners' presentation submissions.
- `GET /api/v1/educator/presentation-analytics`: Class-level presentation performance metrics for educators.

---

## 5. Local Setup & Docker Deployment

### Local Run:
1. Backend:
   ```bash
   cd backend
   .\venv\Scripts\activate
   pytest
   uvicorn app.main:app --reload
   ```
2. Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Production Docker Deployment:
```bash
docker-compose up -d --build
```

---

## 6. End-to-End Demonstration Guide for HR / Technical Presentation
1. **Login as Learner** (`learner1@example.com`).
2. Navigate to **Presentation Studio** in the sidebar.
3. Enter presentation topic title and click **Start Recording**.
4. Speak a 30-second presentation containing deliberate points and a couple of filler words ("um", "like").
5. Click **Stop Recording**, preview audio using the inline browser player, and click **Upload Recording**.
6. Observe status transitioning from `Uploading` $\rightarrow$ `Transcribing` $\rightarrow$ `Analyzing` $\rightarrow$ `Completed`.
7. Click **View Performance Report** to inspect:
   - Overall Score Circle & WPM Pace gauge.
   - Exact Filler Word breakdown count.
   - Recharts visual metric comparison chart.
   - Strengths and Actionable Recommendations.
   - Full Whisper audio transcript with Copy function.
8. Open the floating **AI Debate Coach Chatbot** and ask: *"Why was my filler score low and how can I improve my presentation?"*
9. Observe the AI Chatbot analyzing your real presentation scores and providing personalized coaching feedback.
