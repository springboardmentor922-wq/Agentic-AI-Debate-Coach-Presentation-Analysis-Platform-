# Debate Coach & Presentation Analysis Platform

Milestone 1 implementation for an AI-powered debate coaching and presentation analysis platform.

## What is included

- Project objective, architecture, schema, and workflow notes in `docs/`
- Local backend API with authentication, role-based access, profiles, skill tracking, and debate sessions
- SQLite database auto-created on first run
- Static frontend for registration/login, dashboards, profile skills, and debate session management

## Run locally

```powershell
python backend/server.py
```

Then open:

```text
http://localhost:8000
```

## Demo accounts

The app creates these users automatically:

| Role | Email | Password |
| --- | --- | --- |
| Learner | learner@example.com | password123 |
| Debate Coach | coach@example.com | password123 |
| Educator | educator@example.com | password123 |
| Administrator | admin@example.com | password123 |

## Milestone 1 scope

- Authentication and session tokens
- Role-based navigation and protected endpoints
- User profile and learning goal management
- Debate skill tracking
- Debate session creation, listing, status updates, and deletion
- Architecture and database planning documents

