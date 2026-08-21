# Database Design

## Version

1.0

---

# Overview

The Agentic AI Debate Coach & Presentation Analysis Platform follows a hybrid database architecture using PostgreSQL and MongoDB.

- PostgreSQL stores structured and relational application data.
- MongoDB is reserved for AI-generated and semi-structured data that will be implemented in future milestones.

This architecture provides scalability and allows AI modules to be integrated without redesigning the database.

---

# Database Strategy

## Primary Database

**PostgreSQL**

Used for storing relational application data required for authentication, user management, profile management, debate management, and skill tracking.

## Secondary Database

**MongoDB**

Used for storing AI-generated data such as argument analysis, logical fallacy detection, presentation analysis, recommendations, reports, and notifications.

MongoDB collections will be implemented in future milestones.

---

# Milestone 1 Database Schema

The following database entities will be implemented during Milestone 1.

1. Roles
2. Users
3. User Profiles
4. Debate Topics
5. Debate Sessions
6. Skill Tracking

---

# Database Entities

## 1. Roles

### Purpose

Stores all user roles available in the platform.

### Examples

- Learner
- Debate Coach
- Educator
- Administrator

### Relationship

One Role can be assigned to many Users.

---

## 2. Users

### Purpose

Stores authentication and identity information for every registered user.

### Stores

- Full Name
- Email Address
- Password Hash
- Assigned Role
- Account Status

### Relationship

- One User belongs to one Role.
- One User has one User Profile.
- One User has one Skill Tracking record.
- One User can create multiple Debate Sessions.

---

## 3. User Profiles

### Purpose

Stores personal and learning information of users.

### Stores

- Bio
- Experience Level
- Learning Goals
- Preferred Debate Topics
- Presentation Domains
- Coaching Preferences

### Relationship

Each User Profile belongs to exactly one User.

---

## 4. Debate Topics

### Purpose

Stores debate topics available on the platform.

### Stores

- Topic Title
- Description
- Category
- Difficulty Level
- Status

### Relationship

One Debate Topic can be associated with multiple Debate Sessions.

---

## 5. Debate Sessions

### Purpose

Stores debate sessions created by users.

### Stores

- Debate Topic
- Debate Format
- Debate Position
- Scheduled Date & Time
- Session Status

### Relationship

- Each Debate Session belongs to one User.
- Each Debate Session is linked to one Debate Topic.

---

## 6. Skill Tracking

### Purpose

Tracks the learning progress and communication skills of every user.

### Stores

- Communication Score
- Critical Thinking Score
- Presentation Score
- Argument Score

### Relationship

Each Skill Tracking record belongs to exactly one User.

Future AI modules will automatically update these scores after debate analysis.

---

# Future MongoDB Collections

The following collections will be implemented in future milestones.

- argument_analysis
- logical_fallacies
- counter_arguments
- presentation_analysis
- recommendations
- reports
- notifications

These collections are outside the scope of Milestone 1.

---

# Entity Relationships

Roles

↓

Users

↓

User Profiles

↓

Skill Tracking

↓

Debate Sessions

↑

Debate Topics

---

# Database Normalization

The database follows normalization principles to reduce redundancy and maintain consistency.

- Authentication data is stored separately from profile information.
- Skill Tracking is maintained independently from user profiles.
- Debate Topics are reused across multiple Debate Sessions.
- Roles are maintained separately for Role-Based Access Control (RBAC).

---

# Milestone 1 Scope

The following database components will be implemented:

- Roles
- Users
- User Profiles
- Debate Topics
- Debate Sessions
- Skill Tracking

Future AI modules and MongoDB collections will be implemented in later milestones.

---

# Conclusion

The database design provides a structured and scalable foundation for the Agentic AI Debate Coach & Presentation Analysis Platform. It supports secure authentication, profile management, debate session management, and skill tracking while remaining extensible for future AI-powered modules.


# Entity Relationship Diagram

![ER Diagram](er_diagram.png)

# Roles Table

## Purpose
Stores all user roles used in the platform.

## Module
User Authentication & Role-Based Access

## Used By
- User Registration
- Login
- JWT Authentication
- Role Based Access Control

## Frontend Pages
- Register
- Login
- Admin Dashboard

## APIs
GET /roles

## Relationships
One Role → Many Users

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| name | VARCHAR(50) | Role Name |
| description | TEXT | Role Description |
| created_at | TIMESTAMP | Created Time |
| updated_at | TIMESTAMP | Updated Time |



# Users Table

## Purpose

Stores authentication and identity information for every registered user.

## Module

User Authentication & Role-Based Access

## Used By

- User Registration
- User Login
- JWT Authentication
- User Profile Module
- Debate Session Module

## Frontend Pages

- Registration Page
- Login Page
- User Dashboard

## APIs

- POST /auth/register
- POST /auth/login
- GET /users/{id}

## Relationships

- Many Users → One Role
- One User → One User Profile
- One User → One Skill Tracking Record
- One User → Many Debate Sessions

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| full_name | VARCHAR(100) | User's full name |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Hashed password |
| role_id | INTEGER | References Roles table |
| is_active | BOOLEAN | Active/Inactive status |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |




------------------------------------------
# User Profiles Table

## Purpose

Stores detailed profile information for each registered user. This information helps personalize the learning experience and supports future AI-powered coaching modules.

## Module

User Profile & Skill Management

## Used By

- Profile Creation
- Profile Update
- Learning Goal Management
- Debate Topic Preferences
- Presentation Domain Preferences
- Coaching Preferences

## Frontend Pages

- User Profile
- Dashboard

## APIs

- GET /profile
- POST /profile
- PUT /profile

## Relationships

One User → One User Profile

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INTEGER | References Users table |
| bio | TEXT | Short user biography |
| experience_level | VARCHAR(50) | Beginner, Intermediate, Advanced |
| learning_goals | TEXT | User learning objectives |
| preferred_debate_topics | TEXT | Preferred debate topics |
| presentation_domains | TEXT | Preferred presentation domains |
| coaching_preferences | TEXT | Coaching preferences |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

---------------------------------------------

# User Skills Table

## Purpose

Stores the skill tracking information for each registered user. This table maintains the user's performance scores in different skill areas and serves as the foundation for future AI-based performance analysis.

## Module

Skill Tracking

## Used By

- Skill Tracking Dashboard
- User Dashboard
- Performance Monitoring
- Future AI Recommendation Engine

## Frontend Pages

- Dashboard
- Reports Dashboard

## APIs

- GET /skills
- GET /skills/{user_id}
- PUT /skills/{user_id}

## Relationships

One User → One Skill Record

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INTEGER | References Users table |
| communication_score | DECIMAL(5,2) | Communication skill score |
| critical_thinking_score | DECIMAL(5,2) | Critical thinking score |
| presentation_score | DECIMAL(5,2) | Presentation skill score |
| argument_score | DECIMAL(5,2) | Argument building score |
| updated_at | TIMESTAMP | Last updated time |


# Debate Topics Table

## Purpose

Stores all debate topics available on the platform. Users can browse and select these topics while creating debate sessions.

## Module

Debate Session Management

## Used By

- Debate Topic Selection
- Debate Session Creation
- Debate Room

## Frontend Pages

- Debate Topic Selection
- Debate Room

## APIs

- GET /debate-topics
- GET /debate-topics/{id}
- POST /debate-topics
- PUT /debate-topics/{id}
- DELETE /debate-topics/{id}

## Relationships

One Debate Topic → Many Debate Sessions

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| title | VARCHAR(255) | Debate topic title |
| description | TEXT | Topic description |
| category | VARCHAR(100) | Topic category |
| difficulty_level | VARCHAR(30) | Easy, Medium, Hard |
| is_active | BOOLEAN | Topic availability |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last updated time |


------------------------------------------
# Debate Sessions Table

## Purpose

Stores all debate sessions created by users. Each session is associated with a user and a debate topic and contains scheduling and session management information.

## Module

Debate Session Management

## Used By

- Debate Session Creation
- Debate Room
- Debate History
- Session Management

## Frontend Pages

- Debate Topic Selection
- Debate Room
- Dashboard

## APIs

- GET /debate-sessions
- GET /debate-sessions/{id}
- POST /debate-sessions
- PUT /debate-sessions/{id}
- DELETE /debate-sessions/{id}

## Relationships

Many Debate Sessions → One User

Many Debate Sessions → One Debate Topic

## Columns

| Column | Type | Description |
|---------|------|-------------|
| id | SERIAL | Primary Key |
| user_id | INTEGER | References Users table |
| topic_id | INTEGER | References Debate Topics table |
| debate_format | VARCHAR(50) | Debate format |
| debate_position | VARCHAR(20) | For / Against |
| scheduled_at | TIMESTAMP | Scheduled date & time |
| session_status | VARCHAR(30) | Scheduled, Ongoing, Completed, Cancelled |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |