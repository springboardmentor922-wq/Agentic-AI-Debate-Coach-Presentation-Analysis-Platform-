# User Roles & Features

Four roles are defined in Milestone 1. Role-based access is enforced at the API layer
(`RoleChecker` dependency) and reflected in the frontend (`RoleGate`, sidebar navigation).

## 1. Learner
The primary end user practicing debate and presentation skills.
- Register / log in (email+password or Google OAuth2)
- Manage their profile: bio, institution, learning goals, preferred topics, experience level
- Browse debate topics/motions, filter by category and difficulty
- Start a debate session, choose a stance (For / Against), practice with a speaking timer
- View personal dashboard: session counts, upcoming/completed sessions
- View personal reports: sessions by status, stance distribution
- *(Later milestone)* Receive AI feedback, fallacy flags, and personalized recommendations

## 2. Debate Coach
Supports and reviews learners.
- Everything a Learner can do, plus:
- Create and publish debate topics
- Get assigned to learner sessions (`coach_id` on `DebateSession`)
- *(Later milestone)* Review AI-generated session reports and add manual feedback

## 3. Educator
Manages classes/cohorts of learners.
- Everything a Learner can do, plus:
- Create and publish debate topics for a class or curriculum
- *(Later milestone)* View aggregate class progress, assign topics to specific cohorts

## 4. Administrator
Owns platform configuration and user management.
- View all registered users
- Change any user's role
- Deactivate accounts
- *(Later milestone)* Platform-wide analytics, content moderation for AI-generated feedback

---

## Shared Milestone-1 modules (all roles)

| Module | Description |
|---|---|
| Authentication | Register, login, JWT access/refresh tokens, Google OAuth2 (scaffolded) |
| Profile | Bio, institution, learning goals, preferred topics, experience level |
| Debate Topics | Browse/search topics; Coach/Educator/Admin can publish new ones |
| Debate Sessions | Create a session against a topic + stance, run a timed practice round, track status lifecycle (`scheduled → in_progress → completed`) |
| Reports | Session counts, status breakdown, stance distribution (foundation for AI-driven analytics later) |
