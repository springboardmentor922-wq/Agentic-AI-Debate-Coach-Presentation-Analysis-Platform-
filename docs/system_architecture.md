# System Architecture

## Project Architecture Overview

The Agentic AI Debate Coach & Presentation Analysis Platform follows a modular and scalable architecture designed to support both the core application and future AI-powered modules.

The architecture separates the frontend, backend, databases, authentication system, AI services, and external integrations into independent layers. This modular approach allows the platform to be easily extended in future milestones without requiring major architectural changes.

The overall system architecture provided in the project specification document is adopted as the reference architecture for this project.

---

# Architecture Diagram

![System Architecture](../diagrams/system_architecture.png)

---

# Architecture Layers

The platform consists of the following layers.

## 1. Presentation Layer

The Presentation Layer provides the user interface through which users interact with the application.

Responsibilities

- User Registration
- User Login
- Dashboard
- User Profile
- Debate Topic Selection
- Debate Room
- Reports Dashboard

Technology

- React.js
- HTML5
- CSS3
- JavaScript
- Tailwind CSS

---

## 2. Backend Layer

The Backend Layer handles all business logic and API processing.

Responsibilities

- Authentication
- User Management
- Profile Management
- Skill Tracking
- Debate Session Management
- API Processing
- Request Validation

Technology

- Python
- FastAPI
- SQLAlchemy
- Pydantic

---

## 3. Authentication Layer

The Authentication Layer secures the platform and controls access to protected resources.

Responsibilities

- User Registration
- User Login
- JWT Authentication
- OAuth2 Integration (Optional)
- Role-Based Access Control (RBAC)

Technology

- JWT
- OAuth2
- Password Hashing

---

## 4. Database Layer

The Database Layer stores both structured application data and AI-generated data.

### PostgreSQL

Stores relational data.

Tables

- Roles
- Users
- User Profiles
- User Skills
- Debate Topics
- Debate Sessions
- Performance Scores

### MongoDB

Stores AI-generated and semi-structured data.

Collections

- Argument Analysis
- Logical Fallacies
- Counter Arguments
- Presentation Analysis
- Recommendations
- Reports
- Notifications

---

## 5. AI Intelligence Layer

The AI Intelligence Layer will be implemented in future milestones.

Modules

- Argument Analysis Engine
- Logical Fallacy Detection
- Counterargument Generation
- Presentation Analysis
- AI Debate Simulation
- Recommendation Engine

Milestone 1 does not include implementation of these modules.

---

## 6. External Services Layer

The platform integrates with external services.

Services

- OpenAI API
- Hugging Face Models
- Whisper Speech Recognition
- Email Services
- Vector Database
- Cloud Storage

These integrations will be implemented in future milestones.

---

# Technology Stack

| Layer                | Technology |
|---------             |------------|
| Frontend             | React.js   |
| Backend              | FastAPI    |
| Programming Language | Python     |
| Primary Database     | PostgreSQL |
| Secondary Database   | MongoDB    |
| Authentication       | JWT        |
| Authorization        | Role-Based Access Control (RBAC) |
| Authentication       | OAuth2     |
| Version Control      | Git & GitHub |
| API Testing          | Postman     |

---

# Milestone 1 Architecture Scope

Milestone 1 focuses on building the core foundation of the platform.

The following modules will be implemented.

- User Authentication & Role-Based Access
- User Profile & Skill Management
- Debate Session Management

The following modules are reserved for future milestones.

- Argument Analysis Engine
- Logical Fallacy Detection
- Counterargument Generation
- Presentation Analysis
- AI Debate Simulation
- Recommendation Engine
- Reports & Analytics
- Notification System

---

# Architectural Advantages

The selected architecture provides the following benefits.

- Modular Design
- High Scalability
- Secure Authentication
- Easy Maintenance
- Separation of Concerns
- Future AI Integration
- Cloud Deployment Ready
- Microservice-Friendly Design

---

# Conclusion

The Agentic AI Debate Coach & Presentation Analysis Platform follows a modular architecture that enables secure authentication, structured data management, scalable backend services, and seamless integration of AI modules in future milestones. During Milestone 1, only the foundational components are implemented, providing a stable base for the remaining phases of the project.