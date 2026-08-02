# Project Objectives and Workflows

## Objective

Build a debate coaching platform that helps learners improve argumentation, communication, critical thinking, and presentation skills. Milestone 1 focuses on the platform foundation: accounts, roles, profiles, skills, and debate session workflows.

## Primary Users

- Learner: practices debates, tracks skills, and reviews sessions.
- Debate Coach: supports learners and monitors debate preparation.
- Educator: oversees class-level progress and structured activities.
- Administrator: manages platform users and system-level visibility.

## Milestone 1 Workflows

### Authentication

1. User registers with name, email, password, and role.
2. Backend validates credentials and returns a session token.
3. Frontend stores the token and sends it with protected requests.
4. Backend authorizes actions according to the user's role.

### Profile and Skill Tracking

1. User opens the profile page.
2. User updates experience level, preferred topics, domains, learning goals, and coaching preferences.
3. User tracks skill scores for argument clarity, evidence usage, logic, rebuttals, and delivery.
4. Dashboard summarizes strengths and areas to improve.

### Debate Session Management

1. User creates a debate session with topic, format, position, opponent type, and date.
2. User views upcoming, active, and completed sessions.
3. User updates status as planning moves forward.
4. Coaches, educators, and administrators can see broader session data according to their role.

