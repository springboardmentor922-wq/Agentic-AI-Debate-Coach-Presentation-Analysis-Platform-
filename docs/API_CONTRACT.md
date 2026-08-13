API Integration Contract v1.0 (LOCKED)
Project: Agentic AI Debate Coach & Presentation Analysis Platform
Version: 1.0
Status: Final for Milestone 3
This document defines the contract between:
React Frontend
        ↓
FastAPI APIs
        ↓
LangGraph Orchestrator
        ↓
AI Agents
        ↓
PostgreSQL / MongoDB / FAISS

1. API Architecture
Frontend

↓

React Service Layer

↓

FastAPI Router

↓

Business Service

↓

Repository

↓

Database

↓

LangGraph

↓

AI Agents

↓

Mongo

↓

Return JSON

↓

Frontend
No React component directly calls AI.
Everything goes through Services.

2. Current Backend Modules (Keep)
Auth

Profile

User Skills

Debate Topics

Debate Sessions

AI Chat

AI Analysis

Speech

Debate Processing

Reports
Already implemented.
We extend them.

3. Backend API Structure
api/

auth.py

profile.py

debate_topic.py

debate_session.py

user_skill.py

chat.py

ai_analysis.py

speech.py

reports.py

coach.py                 ← NEW

educator.py             ← NEW

admin.py                ← NEW

recommendation.py       ← NEW

performance.py          ← NEW

notification.py         ← NEW

4. Service Layer
services/

auth_service

profile_service

debate_topic_service

debate_session_service

chat_service

analysis_service

performance_service

recommendation_service

coach_service

educator_service

admin_service

report_service

notification_service

5. Frontend Services
Exactly matching backend.
services/

authService.js

profileService.js

topicService.js

sessionService.js

chatService.js

analysisService.js

performanceService.js

recommendationService.js

coachService.js

educatorService.js

adminService.js

reportService.js

notificationService.js
Never mix APIs.

6. Authentication Flow
Login Page

↓

POST /auth/login

↓

JWT

↓

Store Token

↓

Protected Route

↓

Dashboard

7. Learner Dashboard
Page
LearnerDashboard
Calls
GET Profile

GET Dashboard Summary

GET Recommendations

GET Performance

GET Upcoming Sessions

GET Notifications
Returns
Stats

Charts

Cards

Activities

Recommendations

8. Debate Topics Page
Calls
GET Debate Topics

GET Recommended Topics

GET User Topics

POST Create Topic

PUT Update Topic

DELETE Topic

Select Topic
↓
POST Select Topic

↓

Navigate

↓

Debate Sessions

9. Debate Sessions
Calls
GET Sessions

GET Session Details

POST Join Session

POST Create Session

PUT Update Session

Join
↓
Debate Room

10. Debate Room
This is the biggest integration.
Page
DebateRoom
Calls
GET Session

↓

POST AI Chat

↓

POST Analyze

↓

POST Counterargument

↓

POST Debate Simulation

↓

POST Judge

↓

Save Mongo

↓

Update UI

Realtime Flow
Speech

↓

Transcript

↓

LangGraph

↓

Argument Agent

↓

Fallacy

↓

Counter

↓

Judge

↓

Coach

↓

Recommendations

↓

Frontend

11. AI Chat Widget
Available globally.
Page-aware.
When opened
Detect Current Route

↓

Send Route

↓

Load Context

↓

Load Session

↓

Load User

↓

Generate Prompt

↓

LLM

↓

Answer

Examples
Dashboard
↓
Learning Assistant
Debate Room
↓
Realtime Coach
Coach Dashboard
↓
Evaluation Assistant
Admin
↓
System Assistant

12. AI Analysis
Current
POST

/analyze
becomes
Argument

↓

Fallacy

↓

Counter

↓

Judge

↓

Coach

↓

Recommendations

↓

Learning

↓

JSON
Single API.
Multiple agents.

13. Counterargument
Frontend
CounterargumentGenerator.jsx
↓
POST

/api/v1/counterargument
↓
LangGraph
↓
Counter Agent
↓
Return
Logical

Evidence

Ethical

Practical

Questions


14. Debate Simulation
Page
DebateSimulation.jsx
↓
POST

/api/v1/debate/simulate
↓
Opponent Agent
↓
Judge
↓
Score
↓
Mongo
↓
UI

15. Performance
Page
Performance Dashboard
↓
GET

/performance
↓
Charts
↓
Radar
↓
Timeline
↓
Score History
↓
Skill Trends

16. Coach Dashboard
Calls
GET Assigned Learners

GET Pending Reviews

GET Reports

GET Sessions

POST Evaluate

POST Feedback

POST Coaching Plan

Coach evaluates
↓
Feedback
↓
Mongo
↓
Learner Dashboard updates

17. Educator Dashboard
Calls
GET Classes

GET Learners

GET Reports

GET Assignments

POST Assign Debate

POST Publish Feedback

18. Admin Dashboard
Calls
GET Users

GET Roles

GET Analytics

GET AI Usage

GET Reports

GET Services

PUT Configuration

19. Reports
Milestone 3
GET Reports

↓

Tables

↓

Charts

↓

Filters
Milestone 4
PDF

Excel

Download

20. Notification Flow
Action

↓

Mongo

↓

Notification

↓

Navbar

↓

Toast

↓

Page

21. LangGraph Integration
Every AI request
React

↓

chatService

↓

FastAPI

↓

LangGraph

↓

Load Memory

↓

Run Graph

↓

Save Mongo

↓

Return JSON

22. Database Mapping
PostgreSQL
Stores
Users

Profiles

Topics

Sessions

Participants

Skills

Roles

Mongo
Stores
Arguments

Fallacies

Counterarguments

AI Chat

Transcript

Recommendations

Learning History

Performance

Reports

FAISS
Stores
Embeddings

Evidence

Knowledge

Resources

23. Error Contract
Every API
Returns
success

message

data

errors

timestamp
Never raw exceptions.

24. Frontend Data Flow
User Click

↓

React

↓

Service

↓

Axios

↓

FastAPI

↓

Business Service

↓

Repository

↓

LangGraph

↓

Database

↓

Response

↓

React

↓

UI Update

25. Streaming Flow (Milestone 3)
Speech

↓

Transcript

↓

Streaming API

↓

AI

↓

Incremental Response

↓

UI

26. Dynamic UI Rule (LOCKED)
From this point onward:
❌ No mock data.
❌ No hardcoded dashboard values.
❌ No static charts.
❌ No fake progress bars.
Everything displayed in the frontend must come from backend APIs or AI-generated data stored in MongoDB/PostgreSQL.

27. Milestone 3 Completion Matrix
Area
Status
Backend Architecture
✅ Locked
Frontend Architecture
✅ Locked
API Contract
✅ Locked
Database Mapping
✅ Locked
LangGraph Integration
✅ Locked
AI Agent Mapping
✅ Locked
Dashboard Mapping
✅ Locked
Role Workflow Mapping
✅ Locked


What happens next
At this point, the project design is effectively frozen for Milestone 3.
You now have three "source of truth" documents:
✅ Master System Architecture Specification v1.0
✅ Frontend Architecture Specification v1.0
✅ API Integration Contract v1.0

