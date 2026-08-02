# COPILOT CODING RULES

These rules must always be followed.

This project is the Infosys Springboard project

Agentic AI Debate Coach & Presentation Analysis Platform.

The project is currently limited to

Milestone 1

Milestone 2

Do NOT implement future milestones unless explicitly requested.

---

# Architecture

Always preserve the existing architecture.

Do not redesign the project.

Do not create a new architecture.

Reuse existing code whenever possible.

---

# Folder Structure

Never rename folders.

Never rename files.

Never move files.

Never change import paths unless necessary.

Keep the existing folder structure.

---

# Frontend Rules

Framework

React

Use

Functional Components

React Hooks

React Router

Axios

Reusable Components

Never use class components.

Never duplicate logic.

Never create unnecessary components.

Reuse existing components.

Keep components small and maintainable.

---

# Layout Rules

Every page must use

MainLayout

MainLayout contains

Sidebar

Navbar

Main Content

Do not remove MainLayout.

Do not replace MainLayout.

---

# CSS Rules

Reuse existing CSS.

Do not delete CSS.

Keep responsive design.

Maintain spacing consistency.

Maintain dashboard appearance.

Use existing color palette.

---

# Component Rules

Before creating a component

Search whether it already exists.

Reuse components whenever possible.

Never create duplicate cards.

Never duplicate modals.

Never duplicate buttons.

Never duplicate filters.

---

# Service Rules

Reuse existing services.

Example

authService

profileService

debateTopicService

debateSessionService

skillService

apiClient

Never create duplicate services.

---

# API Rules

Never change endpoint names.

Never change request format.

Never change response format.

Reuse existing APIs.

Only extend APIs if requested.

---

# Backend Rules

Backend

FastAPI

Reuse existing routers.

Reuse existing services.

Reuse existing schemas.

Reuse existing database models.

Keep PostgreSQL compatibility.

---

# Database Rules

Never rename tables.

Never remove columns.

Never change relationships.

Reuse existing schema.

Only create migrations if explicitly requested.

---

# Authentication

Keep JWT Authentication.

Keep RBAC.

Do not remove authorization checks.

---

# Error Handling

Always handle

Loading

Error

Empty State

Success State

API Failure

---

# React Best Practices

Use

useState

useEffect

useMemo

useCallback when necessary

Keep components readable.

Keep functions small.

Avoid deeply nested JSX.

---

# Performance

Avoid unnecessary renders.

Avoid duplicate API calls.

Memoize expensive calculations.

Keep API requests optimized.

---

# Code Quality

Readable code.

Meaningful variable names.

Meaningful function names.

Remove dead code.

Avoid code duplication.

Follow existing naming conventions.

---

# Refactoring Rules

Never rewrite an entire page unless requested.

Refactor incrementally.

Preserve existing functionality.

Do not remove working features.

Keep backward compatibility.

---

# Debate Topics Module

Reuse

DebateTopicsHeader

DebateTopicFilters

DebateTopicCard

RecommendedTopics

OfficialTopicsSection

MyTopicsSection

CreateTopicModal

Keep backend integration.

Improve UI only when necessary.

---

# Debate Sessions Module

Reuse

Session Cards

Session Details

Waiting Room

Debate Room

Keep routing unchanged.

---

# AI Modules

Do NOT implement

LLM

Speech Recognition

Speech-to-Text

Argument Analysis

Presentation Analysis

Counter Arguments

Recommendation Engine

MongoDB AI Collections

Unless explicitly requested.

---

# Before Writing Code

Always

1. Analyze current implementation.
2. Reuse existing code.
3. Reuse existing APIs.
4. Reuse existing components.
5. Preserve architecture.
6. Preserve folder structure.

Only then generate code.

---

# If Refactoring

Always explain

What is changing

Why it is changing

How it affects existing code

Never make unnecessary changes.

---

# Goal

Deliver production-ready code that satisfies only

Milestone 1

Milestone 2

without breaking existing functionality.