# Database Design

## PostgreSQL — relational core

```mermaid
erDiagram
    ROLES ||--o{ USERS : has
    USERS ||--|| USER_PROFILES : has
    USERS ||--o{ DEBATE_SESSIONS : creates
    USERS ||--o{ DEBATE_TOPICS : "publishes (optional)"
    DEBATE_TOPICS ||--o{ DEBATE_SESSIONS : "used in"
    USERS ||--o{ DEBATE_SESSIONS : "coaches (optional)"

    ROLES {
        int id PK
        string name "learner | debate_coach | educator | administrator"
        string description
    }

    USERS {
        int id PK
        string full_name
        string email UK
        string hashed_password "nullable for OAuth-only"
        int role_id FK
        bool is_active
        bool is_verified
        string auth_provider "local | google"
        datetime created_at
        datetime updated_at
    }

    USER_PROFILES {
        int id PK
        int user_id FK "unique"
        text bio
        string avatar_url
        string institution
        text learning_goals
        text preferred_topics
        enum experience_level "beginner | intermediate | advanced"
    }

    DEBATE_TOPICS {
        int id PK
        string title
        string category
        text description
        enum difficulty "easy | medium | hard"
        int created_by_id FK "nullable"
        datetime created_at
    }

    DEBATE_SESSIONS {
        int id PK
        int user_id FK
        int topic_id FK
        int coach_id FK "nullable"
        enum stance "for | against | not_set"
        enum status "scheduled | in_progress | completed | cancelled"
        int duration_minutes
        datetime scheduled_at
        datetime started_at
        datetime ended_at
        datetime created_at
    }
```

## MongoDB — flexible / append-only data

Used for data that is naturally document-shaped, high-write, or expected to evolve in structure
once AI modules land in later milestones.

### `skill_tracking`
Reserved for per-learner skill metrics (argument strength trend, fallacy frequency, delivery
scores). Structure only in Milestone 1 — no AI writes yet.

```json
{
  "user_id": 12,
  "skill": "rebuttal_speed",
  "history": [
    { "session_id": 42, "score": null, "recorded_at": "2026-07-10T10:00:00Z" }
  ]
}
```

### `session_logs`
Append-only activity log per debate session — already wired to receive writes in Milestone 1
(session created, status transitions), ready for AI event types like `fallacy_detected` later.

```json
{
  "session_id": 42,
  "user_id": 12,
  "event": "status_changed_to_in_progress",
  "timestamp": "2026-07-10T10:05:00Z"
}
```

## Why two databases

| Concern | Store | Reason |
|---|---|---|
| Identity, roles, relationships | PostgreSQL | Strong consistency, foreign keys, transactions |
| Structured profile & session state | PostgreSQL | Predictable schema, needs joins/filters |
| Skill metrics & activity logs | MongoDB | High write volume, schema will evolve as AI features are added, no need for joins |
