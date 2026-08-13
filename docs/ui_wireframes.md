# UI Wireframe & Layout Specification
## Agentic AI Debate Coach & Presentation Analysis Platform

---

## 1. Overview & Design Tokens

The UI is built with a dark-mode glassmorphic theme using CSS grid and flexbox layouts.

### Global Layout Structure
```
+-----------------------------------------------------------------------+
|  Navbar: Logo | Active Role Badge | Profile Menu | PDF Export Button   |
+-------------------+---------------------------------------------------+
|  Sidebar Navigation|  Main Workspace Content Container                |
|  - Dashboard      |  (Dashboard / Speech Studio / Debate Room / etc.) |
|  - Speech Studio  |                                                   |
|  - Debate Room    |                                                   |
|  - Profile        |                                                   |
|  - Educator/Admin |                                                   |
+-------------------+---------------------------------------------------+
```

---

## 2. Page Layout Wireframes

### 2.1 Unified Dashboard (`Dashboard.jsx`)
```
+-----------------------------------------------------------------------+
| [ Welcome back, Learner! ]   [ Quick Speech Studio ]  [ Start Debate ] |
+------------------------------------+----------------------------------+
|  Skill Growth Radar Plot           |  Recent Session Activity Log     |
|  - Communication (78.5)            |  - Debate Topic #3 (Socrates)    |
|  - Logic (82.0)                    |  - Speech Studio (WPM: 135)      |
|  - Delivery (74.0)                 |  - Fallacies Flagged: 2          |
+------------------------------------+----------------------------------+
|  Top Fallacy Summary               |  AI Recommendation Cards         |
|  - Straw Man (3x)                  |  "Practice structured rebuttal   |
|  - False Dilemma (1x)              |   on Technology Ethics topics."  |
+------------------------------------+----------------------------------+
```

### 2.2 Live Speech Studio (`SpeechStudio.jsx`)
```
+-----------------------------------------------------------------------+
| Speech Studio: Record Presentation                                    |
+-----------------------------------------------------------------------+
|  Real-Time Frequency Waveform Canvas (HTML5 FFT Spectrum 60 FPS)      |
|  |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| |
+-------------------------------------+---------------------------------+
|  Live Microphone Status: RECORDING  |  Metrics Counter:               |
|  [ Stop Recording ]  [ Pause ]      |  WPM: 142 | Fillers: 3 ("um")   |
+-------------------------------------+---------------------------------+
|  Live Speech Transcript & Real-Time Fallacy Badges                    |
|  "I think we should ban AI because everyone knows it's risky..."     |
|  [ BADGE: Bandwagon Fallacy ]                                         |
+-----------------------------------------------------------------------+
```

### 2.3 AI Debate Simulation Room (`DebateRoom.jsx`)
```
+-----------------------------------------------------------------------+
| Topic: "Should Artificial Intelligence replace human judges?"         |
| Selected AI Persona: Socrates (Probing & Analytical)   Timer: 02:45   |
+----------------------------------+------------------------------------+
|  Chat & Rebuttal Stream          |  Turn Analysis Panel               |
|  [Socrates]: What is your basis? |  - Logic Score: 85%                |
|  [Learner]: Human empathy is key.|  - Turn Fallacies: None Flagged    |
|  [Socrates]: Can empathy be      |  - Premise Strength: High          |
|              quantified?         |  [ Download PDF Report ]           |
+----------------------------------+------------------------------------+
| Input Box: [ Type your counterargument here... ]       [ Submit Turn ]|
+-----------------------------------------------------------------------+
```

### 2.4 Profile Settings (`ProfileSettings.jsx`)
```
+-----------------------------------------------------------------------+
| Profile Settings & Skill Goals                                        |
+-----------------------------------------------------------------------+
| Full Name: [ Debarshi Chatterjee ]    Email: [ user@example.com ]    |
| Experience Level: ( ) Novice  (*) Intermediate  ( ) Advanced          |
| Target Domains: [x] Technology  [x] Ethics  [ ] Finance  [x] Politics |
| Primary Goal: [ Eliminate straw man fallacies & improve pace WPM    ] |
| [ Save Profile Changes ]                                              |
+-----------------------------------------------------------------------+
```
