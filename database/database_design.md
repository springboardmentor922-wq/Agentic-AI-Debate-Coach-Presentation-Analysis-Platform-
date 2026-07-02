# Database Design

## Database Strategy

The project uses two databases:

### PostgreSQL (Primary Database)

Stores structured and relational data.

Tables:

- roles
- users
- user_profiles
- user_skills
- debate_topics
- debate_sessions
- performance_scores

### MongoDB (Secondary Database)

Stores AI-generated and flexible document data.

Collections:

- argument_analysis
- logical_fallacies
- counter_arguments
- presentation_analysis
- recommendations
- reports
- notifications

---

# Milestone 1 Tables

Only the following PostgreSQL tables will be implemented during Milestone 1:

- roles
- users
- user_profiles
- user_skills
- debate_topics
- debate_sessions

---

# Table Relationships

Roles
↓

Users
↓

User Profile
↓

User Skills

Users
↓

Debate Sessions

Debate Topics
↓

Debate Sessions