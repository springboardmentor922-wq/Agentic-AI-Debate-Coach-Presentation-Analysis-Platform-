# API Integration Contract Specification v1.0
## Agentic AI Debate Coach & Presentation Analysis Platform

---

## 1. Architecture Overview

This API contract governs the communications between the **React Frontend**, **FastAPI Backend Gateway**, **AI/NLP Services**, and the **Database Layer**.

```
React Frontend (Service Layer) 
     │
     ▼ (HTTP / JSON + JWT)
FastAPI Router Gateway (`backend/app/routers/`)
     │
     ▼ (Python In-Memory Function Calls)
Core AI & Business Logic Services (`backend/app/services/`)
     │
     ▼ (SQLAlchemy ORM)
Database Layer (`sql_app.db` / PostgreSQL)
```

---

## 2. Authentication & Authorization Endpoints

### 2.1 Register User
- **POST** `/api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "learner@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "role": "LEARNER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "email": "learner@example.com",
    "full_name": "John Doe",
    "role": "LEARNER",
    "created_at": "2026-08-13T12:00:00Z"
  }
  ```

### 2.2 User Login
- **POST** `/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "username": "learner@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "learner@example.com",
      "full_name": "John Doe",
      "role": "LEARNER"
    }
  }
  ```

---

## 3. User Profile & Skill Endpoints

### 3.1 Get Profile
- **GET** `/api/v1/profile/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "user_id": 1,
    "experience_level": "INTERMEDIATE",
    "target_domains": ["Technology", "Public Speaking"],
    "goals": "Reduce filler words and eliminate straw man fallacies.",
    "skills": {
      "communication_score": 78.5,
      "logic_score": 82.0,
      "delivery_score": 74.0
    }
  }
  ```

---

## 4. Speech Studio Endpoints

### 4.1 Analyze Speech Recording
- **POST** `/api/v1/speech/analyze`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "transcript": "I think we should implement this feature because everyone is doing it, basically.",
    "duration_seconds": 45.0,
    "word_count": 14
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "words_per_minute": 18.6,
    "filler_word_count": 1,
    "filler_words_detected": ["basically"],
    "fallacies_detected": [
      {
        "type": "Bandwagon Fallacy / Appeal to Popularity",
        "snippet": "because everyone is doing it",
        "explanation": "Claiming a proposition is true because many people believe or do it."
      }
    ],
    "scores": {
      "communication": 75.0,
      "logic": 70.0,
      "delivery": 80.0
    }
  }
  ```

---

## 5. AI Debate Room Endpoints

### 5.1 Start Debate Session
- **POST** `/api/v1/debate/sessions`
- **Request Body**:
  ```json
  {
    "topic_id": 3,
    "persona": "Socrates",
    "target_rounds": 4
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "session_id": 42,
    "topic": "Should Artificial Intelligence regulate human speech?",
    "persona": "Socrates",
    "status": "ACTIVE",
    "initial_prompt": "Welcome. I am Socrates. Present your opening argument, and let us examine its truth."
  }
  ```

### 5.2 Submit Debate Turn
- **POST** `/api/v1/debate/sessions/{session_id}/turn`
- **Request Body**:
  ```json
  {
    "user_argument": "AI regulation is essential because unregulated speech leads to chaos."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "turn_id": 105,
    "ai_rebuttal": "Is it not true that defining 'chaos' is subjective? How do you ensure regulators do not abuse power?",
    "fallacies": [
      {
        "name": "False Dilemma",
        "text": "unregulated speech leads to chaos"
      }
    ],
    "turn_score": {
      "clarity": 85,
      "logic": 65,
      "delivery": 80
    }
  }
  ```

---

## 6. Reports & Analytics Endpoints

### 6.1 Download PDF Executive Summary
- **GET** `/api/v1/reports/pdf/{session_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Binary PDF file (`Content-Type: application/pdf`).

### 6.2 Export Session Worksheets to Excel
- **GET** `/api/v1/reports/excel/{session_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Binary XLSX file (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
