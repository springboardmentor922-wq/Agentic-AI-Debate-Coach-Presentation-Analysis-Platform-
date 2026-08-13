# Frontend Architecture Specification
## Agentic AI Debate Coach & Presentation Analysis Platform

---

## 1. Overview & Technology Stack

The frontend is built as a single-page application (SPA) designed to deliver a high-performance, dark-mode glassmorphic user experience.

### Core Technologies
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Custom Vanilla CSS with CSS Variable design system (Glassmorphism, gradients, micro-animations)
- **Audio APIs**:
  - `SpeechRecognition` (Web Speech API) for real-time browser-native speech-to-text
  - `AudioContext` & `AnalyserNode` (Web Audio API) for 60fps frequency spectrum canvas rendering
- **Charts & Visuals**: HTML5 Canvas & Recharts/Chart.js integration for skill radar plots

---

## 2. Component Hierarchy & Page Architecture

```
frontend/src/
├── App.jsx                   # Main Router & Theme Wrapper
├── index.css                 # Global CSS Design Tokens & Glassmorphism Utilities
├── components/
│   ├── AudioVisualizer.jsx   # Frequency-domain audio waveform canvas
│   ├── FallacyBadge.jsx      # Fallacy alert pill component with severity color coding
│   ├── SkillChart.jsx        # Radar plot for Communication, Logic & Delivery metrics
│   ├── Timer.jsx             # Speech/Debate turn countdown timer
│   ├── Navbar.jsx            # Top navigation header with user profile dropdown
│   ├── Sidebar.jsx           # Role-based sidebar navigation
│   ├── FloatingAIChatbot.jsx # Quick assistance AI floating widget
│   └── ProtectedRoute.jsx   # Auth & RBAC route guard wrapper
├── contexts/
│   ├── AuthContext.jsx       # User auth state, JWT token management, login/logout
│   └── DebateContext.jsx     # Active debate turn state, turn timer, speech buffer
└── pages/
    ├── Login.jsx             # Authentication landing page (Login / Register)
    ├── Dashboard.jsx         # Learner/Coach main dashboard with summary stats
    ├── SpeechStudio.jsx      # Presentation recording & speech analytics studio
    ├── DebateRoom.jsx        # AI Debate simulation room with real-time fallacy feed
    ├── ProfileSettings.jsx   # User profile setup & learning goal configuration
    ├── EducatorDashboard.jsx # Class & cohort performance tracking
    └── AdminPanel.jsx        # Global system monitoring & user management
```

---

## 3. Design System & Glassmorphic Aesthetic

The UI adheres to a sleek, dark-mode design system defined in `index.css`:

```css
:root {
  --bg-primary: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.7);
  --border-glass: rgba(255, 255, 255, 0.1);
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
}
```

### Key UI Features
- **Glassmorphism**: `backdrop-filter: blur(12px)` combined with subtle 1px border gradients.
- **Dynamic Waveform**: Real-time FFT audio spectrum bar visualization during recording.
- **Fallacy Highlighting**: Color-coded badges (*Ad Hominem* = Rose, *Straw Man* = Amber, *False Dilemma* = Purple).

---

## 4. State Management & Context API

### 4.1 `AuthContext.jsx`
Manages token storage, user object persistence, and role-based privilege checks:
```javascript
const { user, token, login, logout, hasRole } = useAuth();
```

### 4.2 `DebateContext.jsx`
Manages turn-by-turn state for active debate sessions:
- Active topic & AI persona (*Socrates*, *The Pragmatist*, *The Aggressor*)
- Turn count & remaining timer duration
- Array of completed speech turns and detected fallacy logs

---

## 5. Browser Audio & Speech Integrations

1. **Web Audio API (`AudioContext`)**:
   - Captures microphone stream via `navigator.mediaDevices.getUserMedia()`
   - Connects stream to `AnalyserNode`
   - Queries `getByteFrequencyData()` inside a `requestAnimationFrame` loop to render frequency bars on an HTML5 `<canvas>`.
2. **Web Speech API (`SpeechRecognition`)**:
   - Captures transcript in real time.
   - Calculates WPM by computing `(total_words / elapsed_minutes)`.
   - Filters text against filler word dictionary to track filler frequency.
