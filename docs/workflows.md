# Workflow Diagrams

## 1. Registration → Dashboard (all roles)

```mermaid
flowchart TD
    A[Visit Podium] --> B{Have an account?}
    B -- No --> C[Register: name, email, password, role]
    C --> D[Account created + empty profile shell]
    D --> E[Auto login: JWT access + refresh tokens issued]
    B -- Yes --> F[Login: email + password]
    F --> E
    E --> G[Redirect to role-aware Dashboard]
```

## 2. Starting a debate session (Learner)

```mermaid
flowchart TD
    A[Dashboard] --> B[Browse Debate Topics]
    B --> C[Search / filter by category, difficulty]
    C --> D[Select a motion]
    D --> E{Choose stance}
    E -- For --> F[Create session: topic + stance]
    E -- Against --> F
    F --> G[Session status: scheduled]
    G --> H[Enter Debate Room]
    H --> I[Start speaking → status: in_progress, timer runs]
    I --> J{Timer ends or user ends manually}
    J --> K[Status: completed]
    K --> L[View Reports Dashboard]
```

## 3. Topic publishing (Debate Coach / Educator / Administrator)

```mermaid
flowchart TD
    A[Debate Topics page] --> B[Click 'New topic']
    B --> C[Fill title, category, description, difficulty]
    C --> D[Publish]
    D --> E[Topic stored in PostgreSQL debate_topics]
    E --> F[Immediately visible to all Learners]
```

## 4. Role-based access control (all requests)

```mermaid
flowchart TD
    A[Client sends request with Bearer JWT] --> B[FastAPI decodes token]
    B --> C{Valid & not expired?}
    C -- No --> D[401 Unauthorized]
    C -- Yes --> E[Load user from PostgreSQL]
    E --> F{Route requires specific role?}
    F -- No --> G[Proceed to handler]
    F -- Yes --> H{User role in allowed list?}
    H -- No --> I[403 Forbidden]
    H -- Yes --> G
```

## 5. Administrator user management

```mermaid
flowchart TD
    A[Admin panel] --> B[List all users]
    B --> C{Action}
    C -- Change role --> D[PATCH /admin/users/id/role]
    C -- Deactivate --> E[PATCH /admin/users/id/deactivate]
    D --> F[User table updated, role reflected immediately on next login/token refresh]
    E --> G[is_active = false → user blocked from login]
```
