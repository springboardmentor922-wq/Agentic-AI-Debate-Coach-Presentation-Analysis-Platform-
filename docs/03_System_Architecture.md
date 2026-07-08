# System Architecture

## Technology Stack

### Frontend

* React.js

### Backend

* FastAPI (Python)

### Authentication

* JWT Authentication
* OAuth2 (Optional)

### Databases

* PostgreSQL
* MongoDB

---

## System Architecture Flow

User
↓
Frontend (React.js)
↓
Backend API Layer (FastAPI)
↓
Authentication Layer (JWT/OAuth2)
↓
Database Layer
(PostgreSQL + MongoDB)

---

## Module Architecture

### Frontend Modules

* Login Page
* Registration Page
* Dashboard
* User Profile
* Debate Topic Selection
* Debate Room
* Reports Dashboard

### Backend Modules

* Authentication API
* User Profile API
* Debate Session API
* Reports API

### Database Modules

* User Management
* Debate Management
* Skill Tracking
* Session Storage

---

## Scalability

The architecture is designed using modular components, allowing future integration of AI features such as:

* LLM-based Debate Coach
* Presentation Analysis
* Speech Evaluation
* Recommendation Engine
