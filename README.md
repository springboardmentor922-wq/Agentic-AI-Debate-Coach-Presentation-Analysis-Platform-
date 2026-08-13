# 🎙️ AI Debate Coach & Evaluation Platform

A full-stack, role-based web application for conducting, managing, and evaluating debate sessions. The platform helps learners improve **confidence, fluency, argumentation, and communication** through structured debates, feedback, and performance analytics.

## 🎥 Screen Recording

[View the project screen recording](https://drive.google.com/file/d/1n7JGqpjJdMvTtDfvCU3mUkAkvaRx4z85/view?usp=drivesdk)

## ✨ Features

### 👨‍🎓 Learner

* Start debates using different formats such as One-on-One, AI Simulation, Oxford, and Public Forum.
* Submit debate responses as audio or text.
* Track performance through analytics.
* Receive feedback from coaches and educators.

### 🎯 Debate Coach

* Review pending learner submissions.
* Score debates on:

  * Confidence
  * Fluency
  * Argument Strength
  * Communication
* Send personalized feedback.
* View the learner directory.

### 📚 Educator

* Assign debate topics, formats, and durations to learners.
* Monitor learner progress and task completion.
* View class and individual performance analytics.

### 🛡️ Admin

* Manage users and roles.
* Create and manage debate topics.
* View overall platform statistics.

## 🛠️ Technology Stack

| Layer       | Technology                  |
| ----------- | --------------------------- |
| Frontend    | React.js, Vite, Vanilla CSS |
| UI & Charts | Lucide React, Recharts      |
| Backend     | Python, FastAPI, Uvicorn    |
| Database    | MongoDB, PyMongo            |

## 📋 Prerequisites

* Node.js 16+
* Python 3.9+
* MongoDB running locally or a MongoDB Cloud URI

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Agentic-AI-Debate-Coach-Presentation-Analysis-Platform-
```

### 2. Start the Backend

```bash
cd backend
pip install fastapi uvicorn pymongo python-multipart
python -m uvicorn app:app --port 8000 --reload
```

Backend API: `http://127.0.0.1:8000`

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5500`

## 🔐 Authentication

The application currently uses a development token-based authentication flow with user information stored in local storage.

Stored information includes:

* `username`
* `role`
* `fullname`

Different user roles can be tested by logging in with an account assigned to the required role.

## 🎨 UI Design

The application uses a modern dark-themed interface featuring:

* Glassmorphism
* Gradient-based visual design
* Responsive layouts
* Smooth transitions and micro-interactions
* Interactive performance charts

## 📁 Project Structure

```text
Agentic-AI-Debate-Coach-Presentation-Analysis-Platform/
│
├── backend/
│   ├── app.py
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## 📌 Future Enhancements

* Real AI-powered debate evaluation
* Speech-to-text processing
* Advanced authentication and authorization
* Real-time debate sessions
* Expanded performance analytics
* Production deployment

## 📄 License

This project is intended for educational and development purposes.
