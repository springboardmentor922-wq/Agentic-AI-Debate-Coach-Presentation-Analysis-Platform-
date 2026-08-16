# Agentic AI Debate Coach & Presentation Analysis Platform

An AI-assisted workspace for practising debates, analysing arguments, and improving presentation delivery.

## Project Demo

[Watch the screen recording](https://drive.google.com/file/d/15LqGuDEE7i2_hnmFg84qjLkdZUGtD2sz/view?usp=drive_web)

## Features

- Role-based learner, educator, coach, and administrator dashboards.
- Argument analysis: logical-fallacy detection, counterarguments, scoring, and feedback.
- Presentation analysis: transcript-based clarity, structure, pacing, and confidence metrics.
- Shareable session reports with score breakdowns, coaching recommendations, and activity visualizations.

## Architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React + Vite | Dashboards, analysis workspace, reports, visualizations |
| Backend | FastAPI + SQLAlchemy | Authentication, analysis APIs, stored debate history |
| Analysis | Rule-based engine + AI agents | Explainable presentation metrics and debate feedback |

## Run locally

1. Start the backend:

   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload
   ```

2. In a second terminal, start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`.

## Presentation analysis API

`POST /analysis/presentation`

```json
{
  "transcript": "First, I will explain our proposal. However, the evidence shows it needs investment. In conclusion, we should act now.",
  "duration_seconds": 45
}
```

The API validates transcript length and duration, then returns an overall score, four delivery metrics, filler-word count, pace, and targeted recommendations.

## Validation and tests

The presentation endpoint rejects transcripts shorter than 20 characters or durations outside 15 seconds to 4 hours. Run the unit tests from `backend`:

```powershell
python -m unittest discover -s tests -v
```

For the frontend production check:

```powershell
npm run build
```

## Presentation outline

1. Problem: learners need timely, specific debate and presentation feedback.
2. Solution: AI debate practice plus explainable presentation analysis.
3. Demo: create a session, submit a transcript, and review the generated report.
4. Impact: scores and recommendations turn practice into measurable improvement.
