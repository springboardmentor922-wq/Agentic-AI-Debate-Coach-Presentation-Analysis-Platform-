Final Folder Architecture
frontend/
│
├── src/
│
├── assets/
│
├── components/
│   │
│   ├── aiCoach/
│   │
│   ├── cards/
│   │
│   ├── common/
│   │
│   ├── debateRoom/
│   │
│   ├── debateSessions/
│   │
│   ├── debateTopics/
│   │
│   ├── reports/                 ← NEW
│   │
│   ├── performance/             ← NEW
│   │
│   ├── recommendations/         ← NEW
│   │
│   ├── learningPath/            ← NEW
│   │
│   ├── coachReview/             ← NEW
│   │
│   ├── educator/                ← NEW
│   │
│   ├── admin/                   ← NEW
│   │
│   ├── notifications/           ← NEW
│   │
│   └── sharedCharts/            ← NEW
│
├── forms/
│
├── layout/
│
├── context/
│
├── hooks/
│
├── pages/
│
├── services/
│
├── utils/
│
└── routes/
No existing folders will be removed.

Components Folder
Keep reusable UI only.
components/

Button

Modal

Cards

Charts

Filters

Tables

Widgets

Progress

Badges

Avatar

Timeline

AI Coach

Session Components

Topic Components
No API calls here.

Pages Folder
Every page corresponds to one route.
pages/

auth/

dashboards/

debateTopics/

debateSessions/

debateRoom/

profile/

reports/

analysis/

Dashboard Pages
pages/dashboards/

LearnerDashboard

CoachDashboard

EducatorDashboard

AdminDashboard
Exactly as mentor screenshots.

Dashboard Composition
Example
LearnerDashboard

↓

WelcomeCard

↓

StatsCards

↓

PerformanceChart

↓

UpcomingSessions

↓

SkillRadar

↓

RecentActivity

↓

Goals

↓

Recommendations

↓

Floating AI Coach
Dashboard contains zero business logic.
Everything comes from services.

Debate Topics
Current implementation
Keep.
Only add
Recommended Topics

↓

Trending Topics

↓

Weak Skill Topics

↓

Coach Assigned Topics

↓

Recently Practiced
No redesign.

Debate Sessions
Keep
Current Session Cards.
Only extend.
Session Card

↓

Status

↓

Participants

↓

Coach Assigned

↓

AI Opponent

↓

Recording Status

↓

Evaluation Status

Debate Room
Already exists.
Need to add
Speech

↓

Realtime AI Suggestions

↓

Counterarguments

↓

Live Score

↓

Fallacies

↓

Coach Notes

↓

Transcript

↓

Timeline

↓

Timer
Exactly matching Milestone 3.

AI Coach Widget
Current widget remains.
Upgrade only.
Floating Button

↓

Context Detection

↓

Current Page

↓

Load Prompt

↓

Chat

↓

Context-aware AI
Exactly like mentor screenshot.

Shared Layout
Navbar

Sidebar

Breadcrumb

Page Header

Floating Chat

Notification

Footer
Never duplicated.

State Management
Keep
Context API
Add
Auth Context

↓

Theme Context

↓

AI Context

↓

Notification Context
Do NOT introduce Redux.

API Layer
One service per backend module.
Exactly.
services/

authService

profileService

topicService

sessionService

analysisService

chatService

recommendationService

performanceService

coachService

educatorService

adminService

reportService

notificationService
No API inside components.

Page → Service Mapping
Dashboard
Dashboard

↓

DashboardService

↓

4 APIs

↓

Merge

↓

Render

Debate Topics
Topics Page

↓

topicService

↓

Topic APIs

↓

Cards

Debate Session
Session

↓

sessionService

↓

Session APIs

↓

Cards

Debate Room
Room

↓

chatService

↓

LangGraph

↓

Streaming

↓

Realtime UI

Reports
Reports

↓

reportService

↓

Charts

↓

Tables

↓

Download PDF

Route Architecture
/

login

register

dashboard

profile

topics

topics/:id

sessions

sessions/:id

debate-room/:id

analysis

reports

performance

Coach
/coach/dashboard

/coach/learners

/coach/reviews

/coach/reports

/coach/plans

Educator
/educator/dashboard

/classes

/resources

/evaluation

/reports

Admin
/admin/dashboard

/users

/roles

/system

/services

/reports

/security

AI Context Awareness
One chatbot.
Different brains.
Current Page
AI Mode
Dashboard
Learning Assistant
Debate Room
Live Debate Coach
Argument Analyzer
Argument Expert
Fallacy Detector
Logic Expert
Counterargument
Debate Opponent
Reports
Performance Coach
Educator Dashboard
Class Assistant
Coach Dashboard
Coaching Assistant
Admin Dashboard
System Assistant

Exactly matching the mentor guidance.

Charts
Shared components only.
PerformanceChart

RadarChart

PieChart

BarChart

ProgressChart

TimelineChart
Never create charts inside pages.

Reports
Milestone 3
Prepare UI.
Milestone 4
PDF Export.

Notifications
Global.
Navbar only.
Not page specific.

Theme
Locked.
Blue

Purple

White

Rounded Cards

Soft Shadow

Border Radius

Gradient Header
Exactly like mentor design.

UI Principles (LOCKED)
Keep your existing layout.
Do not rebuild pages that already work.
Remove all remaining mock data.
Every visible value comes from a real backend API.
Every AI interaction goes through the LangGraph orchestrator.
Use reusable components; avoid duplicate JSX across Learner, Coach, Educator, and Admin dashboards.

Final Frontend Lock
With this document, the frontend architecture is now aligned with the previously locked Master System Architecture v1.0.
At this point, you have:
✅ Master System Architecture Specification (overall platform)
✅ Frontend Architecture Specification (React structure and UI organization)
The only remaining design document before implementation is the API Integration Contract, which maps each frontend page and component to the exact backend endpoints and LangGraph workflows. Once that is prepared, Codex (backend) and GitHub Copilot (frontend) can work against a fixed architecture without requiring structural changes during Milestone 3.

