# Agentic AI Debate Coach & Presentation Analysis Platform

# Requirements Analysis Document

Version: 1.0

Milestone: 1 (Week 1 & Week 2)

---

# 1. Project Objective

The objective of this project is to build an AI-powered Debate Coach and Presentation Analysis Platform that helps users improve their debating, communication, critical thinking, and presentation skills.

The platform enables users to participate in debate sessions, track their learning progress, and receive AI-powered feedback in later milestones.

Milestone 1 focuses only on building the core platform infrastructure. AI modules such as argument analysis, logical fallacy detection, speech analysis, recommendation engine, and chatbot will be implemented in later milestones.

---

# 2. Project Scope

## In Scope (Milestone 1)

- User Registration
- User Login
- JWT Authentication
- Role-Based Access Control (RBAC)
- User Profile Management
- Skill Tracking
- Debate Topic Management
- Debate Session Management
- Dashboard Navigation
- Database Design
- Frontend & Backend Initialization

## Out of Scope (Milestone 1)

- AI Chatbot
- Argument Analysis
- Logical Fallacy Detection
- Counterargument Generation
- Speech Analysis
- Recommendation Engine
- Performance Analytics
- AI Debate Simulation

---

# 3. User Roles

The system supports four user roles. Each role has specific permissions and responsibilities within the platform.

---

## 3.1 Learner

### Description

The Learner is the primary user of the platform. Learners participate in debate sessions to improve their communication, presentation, critical thinking, and debating skills.

### Authentication

- Register Account
- Login
- Logout
- Forgot Password (Optional)

### Profile Management

- View Profile
- Edit Profile
- Update Learning Goals
- Update Experience Level
- Select Preferred Debate Topics
- Select Presentation Domains
- Update Coaching Preferences

### Debate Management

- View Debate Topics
- Create Debate Sessions
- View My Debate Sessions
- Update Scheduled Debate Sessions
- Cancel Debate Sessions

### Skill Tracking

- View Communication Skill Score
- View Critical Thinking Score
- View Presentation Score
- View Debate History
- View Learning Progress

### Dashboard

- Learner Dashboard

### Future Features

- AI Debate Simulation
- Argument Analysis
- Logical Fallacy Detection
- Personalized Coaching Recommendations
- Presentation Analysis

------------------------------------------------------------------------------

## 3.2 Debate Coach

### Description

The Debate Coach guides learners by monitoring debate sessions and tracking their overall learning progress.

### Authentication

- Register Account
- Login
- Logout

### Profile Management

- View Profile
- Edit Profile
- Update Coaching Expertise
- Update Bio

### Debate Management

- View Debate Topics
- Create Debate Sessions
- View Assigned Debate Sessions
- Manage Debate Sessions

### Learner Monitoring

- View Learner Profiles
- View Learner Skill Progress
- View Debate History

### Dashboard

- Debate Coach Dashboard

### Future Features

- Evaluate Debate Sessions
- AI Coaching Feedback
- Performance Reports
- Coaching Recommendations

--------------------------------------------------------------------------------

## 3.3 Educator

### Description

The Educator monitors student activities, debate sessions, and learning progress at an academic level.

### Authentication

- Register Account
- Login
- Logout

### Profile Management

- View Profile
- Edit Profile

### Debate Management

- View Debate Topics
- Create Debate Sessions
- View Debate Sessions

### Student Monitoring

- View Student Profiles
- View Student Progress
- View Debate Reports

### Dashboard

- Educator Dashboard

### Future Features

- Classroom Analytics
- Presentation Reports
- Student Ranking
- Performance Analytics

---------------------------------------------------------------------------------

## 3.4 Administrator

### Description

The Administrator manages the overall platform, users, roles, debate topics, and system configuration.

### Authentication

- Login
- Logout

> **Note:** Administrator accounts are created manually by the system and cannot register through the public registration page.

### User Management

- View Users
- Create Users
- Update Users
- Delete Users
- Activate or Deactivate User Accounts

### Role Management

- Assign User Roles
- Update User Roles

### Debate Management

- Create Debate Topics
- Update Debate Topics
- Delete Debate Topics
- View Debate Sessions

### Platform Management

- View Platform Statistics
- Manage System Settings

### Dashboard

- Administrator Dashboard

### Future Features

- AI Monitoring
- Platform Analytics
- Reports Management
- Notification Management

---

# 4. Role Permission Matrix

| Feature               | Learner |   Coach  | Educator |         Admin        |
| --------------------- | :-----: | :------: | :------: | :------------------: |
| Register              |    ✅    |     ✅    |     ✅    | ❌ (Created Manually) |
| Login                 |    ✅    |     ✅    |     ✅    |           ✅          |
| View Dashboard        |    ✅    |     ✅    |     ✅    |           ✅          |
| Manage Profile        |    ✅    |     ✅    |     ✅    |           ✅          |
| View Debate Topics    |    ✅    |     ✅    |     ✅    |           ✅          |
| Create Debate Session |    ✅    |     ✅    |     ✅    |           ✅          |
| View Debate Sessions  |   Own     | Assigned  |    All   |        All         |
| View Skill Tracking   |   Own     | Learners | Students |          All       |
| Manage Users          |    ❌    |     ❌    |     ❌    |           ✅          |
| Manage Roles          |    ❌    |     ❌    |     ❌    |           ✅          |
| Manage Debate Topics  |    ❌    |     ❌    |     ❌    |           ✅          |

# 4. Functional Requirements

## Authentication Module

- User Registration
- User Login
- JWT Authentication
- Password Encryption
- Role-Based Authorization

---

## User Profile Module

- Create Profile
- Update Profile
- Learning Goals
- Preferred Debate Topics
- Experience Level
- Coaching Preferences

---

## Skill Tracking Module

Maintain

- Communication Score
- Presentation Score
- Critical Thinking Score
- Argument Score

---

## Debate Topic Module

- Create Debate Topics
- View Debate Topics
- Categorize Topics
- Difficulty Level

---

## Debate Session Module

- Create Debate Session
- Schedule Debate
- Assign Position
- Manage Session Status
- View Debate History

---

# 5. Non-Functional Requirements

## Security

- JWT Authentication
- Password Hashing
- Secure APIs

---

## Scalability

The architecture should support future AI modules without requiring major changes.

---

## Performance

API response should be fast for authentication and database operations.

---

## Maintainability

The project should follow a modular architecture for easy maintenance and future expansion.

---

## Reliability

System should provide stable authentication and session management.

---

# 6. Technology Stack

## Frontend

- React.js
- React Router
- Axios
- Tailwind CSS

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

## Database

Primary Database

- PostgreSQL

Secondary Database

- MongoDB (Future Milestones)

## Authentication

- JWT
- OAuth2 (Optional)

## Version Control

- Git
- GitHub

---

# 7. Milestone 1 Deliverables

By the end of Milestone 1 the system should include:

- Working React Frontend
- Working FastAPI Backend
- PostgreSQL Database
- Authentication System
- Role-Based Access Control
- User Profile Module
- Skill Tracking Module
- Debate Session Module
- Basic Dashboard Navigation

---

# 8. Future Enhancements

The following modules will be developed in future milestones.

- Argument Analysis Engine
- Logical Fallacy Detection
- Counterargument Generation
- Presentation Analysis
- AI Debate Simulation
- Recommendation Engine
- Reports & Analytics
- Notifications
- Docker Deployment
- Cloud Deployment

---

Document Status

Version : 1.0

Prepared By : Manikanta Sai Anurudh

Project : Agentic AI Debate Coach & Presentation Analysis Platform
