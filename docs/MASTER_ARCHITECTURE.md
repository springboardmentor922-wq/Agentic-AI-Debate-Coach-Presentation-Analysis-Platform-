Master Architecture Specification v1.0
Agentic AI Debate Coach & Presentation Analysis Platform
Version: 1.0 (LOCKED)
Status: Final for Milestone 3
Scope
✅ Milestone 1
✅ Milestone 2
✅ Milestone 3
⏸ Milestone 4 placeholders only

1. Overall Project Vision
The platform is an Agentic AI Debate Coach that helps learners improve debating, reasoning, communication and public speaking by combining multiple AI engines instead of a single chatbot.
The system must support four roles:
Learner
Debate Coach
Educator
Administrator
Each role receives different dashboards, permissions and AI-assisted workflows.

2. Final System Architecture
                    React Frontend
                           │
───────────────────────────┼────────────────────────────
                           │
                    FastAPI API Gateway
                           │
───────────────────────────┼────────────────────────────
                           │
                  Authentication (JWT/OAuth)
                           │
───────────────────────────┼────────────────────────────
                           │
              LangGraph Orchestrator (Brain)
                           │
 ┌──────────────┬──────────────┬──────────────┐
 │              │              │              │
Argument     Fallacy      Counter       Debate
Agent        Agent        Agent         Simulation
 │              │              │              │
 └──────────────┴──────────────┴──────────────┘
                           │
                   Judge / Scoring Agent
                           │
                   Coaching Agent
                           │
              Recommendation Agent
                           │
                 Learning Path Agent
                           │
───────────────────────────┼────────────────────────────
                           │
             PostgreSQL + MongoDB + FAISS
                           │
───────────────────────────┼────────────────────────────
                           │
                     React Dashboards

3. AI Philosophy
The project must not become a chatbot.
The chatbot is only one interface.
The real system consists of specialized AI engines.
Exactly matching the project document:
Argument Analysis Engine
Logical Fallacy Detection Engine
Counterargument Generation Engine
AI Debate Simulation Engine
Performance Scoring Engine
Recommendation Engine
Coaching Engine
Learning Path Engine

4. Backend Folder Architecture (LOCKED)
backend/app/

ai/
│
├── orchestrator/
│      debate_graph.py
│      graph_nodes.py
│      graph_state.py
│
├── agents/
│      argument_agent.py
│      fallacy_agent.py
│      counterargument_agent.py
│      debate_agent.py
│      judge_agent.py
│      coaching_agent.py
│      recommendation_agent.py
│      learning_path_agent.py
│
├── prompts/
│      *.py
│
├── schemas/
│      *.py
│
├── memory/
│      conversation_memory.py
│      summary_memory.py
│
├── rag/
│      embeddings.py
│      retriever.py
│      vector_store.py
│
├── scoring/
│      scoring_engine.py
│
├── guardrails/
│      validators.py
│      safety.py
│
└── utils/

api/

services/

repositories/

models/

core/

tests/
This extends your current backend instead of replacing it.

5. LangGraph Orchestrator
The LangGraph graph becomes the platform's AI brain.
START

↓

Load User Context

↓

Argument Analysis

↓

Fallacy Detection

↓

Counterargument Generation

↓

AI Opponent

↓

Judge

↓

Performance Score

↓

Coach

↓

Recommendation

↓

Learning Path

↓

Save

↓

END
Every AI request flows through this graph.

6. AI Agents (Final)
Agent 1
Argument Analysis
Already completed.
Responsibilities
Claims
Evidence
Relevance
Clarity
Persuasiveness

Agent 2
Logical Fallacy
Already completed.
Responsibilities
Detect fallacies
Explain
Suggest corrections

Agent 3
Counterargument Agent
Milestone 3
Produces
Logical rebuttal
Ethical rebuttal
Evidence rebuttal
Policy rebuttal
Practical rebuttal
Challenge questions
Debate strategies

Agent 4
AI Debate Simulation Agent
Milestone 3
Responsibilities
Maintain
debate state
turns
memory
opponent persona
debate format
Supports
Oxford
Policy
Public Forum
Parliamentary
One-to-One

Agent 5
Judge Agent
Responsibilities
Evaluates
Argument
↓
Evidence
↓
Logic
↓
Rebuttal
↓
Communication
↓
Overall score

Agent 6
Coaching Agent
Produces
strengths
weaknesses
rewrite suggestions
practice advice
next actions

Agent 7
Recommendation Agent
Produces
debate topics
exercises
articles
videos
practice plans

Agent 8
Learning Path Agent
Tracks
history
improvement
weak skills
milestones
personalized roadmap

7. Memory Architecture
Exactly matching the Milestone 3 guidance.
Conversation Memory

Recent 3 Turns

+

Running Summary

+

Current Debate

+

User Profile

+

Previous Scores

+

Goals
Never send the entire transcript to the LLM. Keep recent turns plus a running summary.

8. RAG Architecture
Topic

↓

Embedding

↓

FAISS

↓

Retriever

↓

Evidence

↓

LLM
Purpose:
Prevent hallucinated facts in evidence-based rebuttals by grounding responses in retrieved content.

9. Guardrails
Every AI response follows:
User Input

↓

Input Validation

↓

Prompt Templates

↓

LLM

↓

Pydantic Schema

↓

Output Validation

↓

API Response
No free-form LLM responses.
Every agent returns structured JSON using Pydantic/Instructor.

10. Performance Scoring Engine (LOCKED)
The score is deterministic.
Argument Quality        30%

Evidence Usage          20%

Logical Consistency     20%

Rebuttal Effectiveness  15%

Communication Skills    15%
Overall Score
Overall

=

30%

+

20%

+

20%

+

15%

+

15%
Exactly matching the project specification.

11. Debate State Machine
Created

↓

Scheduled

↓

Ready

↓

Running

↓

User Turn

↓

AI Turn

↓

Judge

↓

Feedback

↓

Completed

↓

Archived

12. Difficulty Levels
Exactly from Milestone 3.
Beginner
Intermediate
Advanced
Master
Changes
AI aggression
logical depth
rebuttal complexity
challenge frequency

13. Role Workflows
Learner
Join debate
Practice
AI simulation
Argument analysis
Fallacy detection
Counterarguments
Coaching
Learning path
Performance dashboard
Debate Coach
Review learner submissions
AI-assisted evaluation
Add coaching feedback
Track learner progress
Assign coaching plans
Educator
Manage classes
Review class analytics
Monitor rankings
Assign debate topics
Review reports
Administrator
User management
AI service monitoring
Platform analytics
Prompt monitoring
Reports
System configuration
These responsibilities align with the module descriptions and dashboard expectations in the project specification.

14. Dashboard Architecture
We will implement the dashboards you shared as the visual target, but every card will be backed by real APIs rather than mock data.
Learner
Dashboard
My Debates
AI Debate Simulation
Practice Topics
Argument Analyzer
Fallacy Detector
Counterargument Generator
Feedback & Coaching
Learning Resources
Notifications
Coach
Dashboard
Learners
Assigned Debates
AI Evaluation Queue
Argument Reviews
Coaching Plans
Analytics
Messages
Educator
Dashboard
Classes
Learners
Debate Sessions
Evaluation Queue
Reports
Practice Topics
Resource Library
Admin
Dashboard
User Management
Roles
AI Services
Analytics
Reports
Security
Integrations

15. Tech Stack (LOCKED)
Backend
FastAPI
PostgreSQL
MongoDB
LangChain
LangGraph
Pydantic
Instructor
FAISS
Sentence Transformers
AI
OpenAI / Anthropic compatible LLM
CrewAI (reserved for future multi-agent expansion if needed)
AutoGen (reserved if required by future simulations)
Frontend
React
Tailwind CSS
Recharts
DevOps
Docker
GitHub Actions
Postman
Pytest
This reflects the recommended technologies in the supplied documents.

16. Milestone Mapping
Milestone 1 ✅
Authentication
RBAC
Profiles
Debate Sessions
Milestone 2 ✅
Argument Analysis
Fallacy Detection
Initial Scoring
Milestone 3 ✅ (Current Target)
Counterargument Engine
AI Debate Simulation
LangGraph Orchestrator
Judge Agent
Coaching Engine
Recommendation Engine
Learning Path Engine
Dynamic Dashboards
Streaming
RAG
Guardrails
Performance Scoring
Milestone 4 (Future)
Whisper STT
Presentation Analysis
Speech Pace
Filler Word Detection
Confidence Analysis
Prosody
Voice-based Feedback

Architecture Lock
From this point onward, this becomes the Master Architecture Specification v1.0 for your project.
We will not redesign the architecture during Milestone 3.
Any changes before Milestone 4 should be implementation details only, not structural changes.
The next steps—Codex backend prompt, GitHub Copilot frontend prompt, and API integration plan—will all follow this specification.

