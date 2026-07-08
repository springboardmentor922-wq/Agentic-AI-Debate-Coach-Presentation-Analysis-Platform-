# Database Design

## Database Technologies

* PostgreSQL (Structured Data)
* MongoDB (Unstructured Data)

---

## Tables

### Roles

| Field     | Type    |
| --------- | ------- |
| role_id   | Integer |
| role_name | String  |

---

### Users

| Field      | Type     |
| ---------- | -------- |
| user_id    | Integer  |
| name       | String   |
| email      | String   |
| password   | String   |
| role_id    | Integer  |
| created_at | DateTime |

---

### User Profiles

| Field            | Type    |
| ---------------- | ------- |
| profile_id       | Integer |
| user_id          | Integer |
| learning_goals   | Text    |
| preferred_topics | Text    |
| experience_level | String  |

---

### Debate Topics

| Field      | Type    |
| ---------- | ------- |
| topic_id   | Integer |
| topic_name | String  |
| category   | String  |

---

### Debate Sessions

| Field          | Type     |
| -------------- | -------- |
| session_id     | Integer  |
| user_id        | Integer  |
| topic_id       | Integer  |
| session_date   | DateTime |
| session_status | String   |

---

### Skill Tracking

| Field                   | Type    |
| ----------------------- | ------- |
| skill_id                | Integer |
| user_id                 | Integer |
| communication_score     | Float   |
| critical_thinking_score | Float   |
| confidence_score        | Float   |
