# UI/UX Wireframes & Design System

Rather than static wireframe images, Milestone 1 ships the wireframes as working, styled pages
(`frontend/src/pages/`) built against a single design system, so the "wireframe" and the
implementation never drift apart.

## Design tokens

| Token | Value | Use |
|---|---|---|
| `ink` (background) | `#0B0F19` / `#121826` / `#1A2233` | App background, sidebar, cards |
| `fog` (text) | `#EDEFF4` | Primary text on dark surfaces |
| `slate.muted` | `#8B93A7` | Secondary text, labels |
| `motion.teal` | `#3FBFAE` | "For" stance, primary actions, active nav |
| `rebuttal.coral` | `#E8543F` | "Against" stance, destructive actions |
| `signal.amber` | `#F4B740` | Warnings, in-progress/scheduled states |
| Display font | Fraunces (serif) | Headlines — gives the app an oratory/rhetorical character |
| Body font | Inter | UI text |
| Mono font | IBM Plex Mono | Timers, scores, session IDs, role badges |

**Signature element — the Motion Card:** every debate topic is presented like a formal debate
resolution ("This House believes…") with a two-tone **For / Against** split, echoing the
adversarial structure of a real debate rather than a generic content card.

## Page-by-page wireframe notes

### Login
Split screen. Left panel (desktop only) states the platform's "motion" as a hero headline with a
literal For/Against mini-card — establishing the visual identity immediately. Right panel: minimal
email/password form, link to Register.

### Registration
Centered card. Role selection is four tappable tiles (icon + label + one-line description) instead
of a dropdown, so the four roles are visible and understood before the user commits.

### Dashboard
Top stat row (Total Sessions, Completed, Upcoming, Topics Available) using monospace figures for a
scoreboard feel, followed by a recent-sessions table. Role-aware sidebar navigation (Administrator
sees an extra "Administration" entry).

### User Profile
Identity header (avatar initial, name, email, role badge) followed by an editable form: bio,
institution, learning goals, preferred topics (tags as comma-separated text in Milestone 1), and a
three-way experience-level selector.

### Debate Topic Selection
Search bar, grid of Motion Cards. Each card's footer is split into two buttons — "Argue FOR" /
"Argue AGAINST" — selecting one arms a sticky bottom action bar to start the session immediately.
Coach/Educator/Admin roles get an inline "New topic" form.

### Debate Room
Two-column layout: a circular countdown **Timer Ring** (teal, turning coral under 30 seconds) with
Start/End controls on the left; session metadata (stance, status, duration) on the right. A quiet
notice clarifies that AI feedback is not part of this milestone.

### Reports Dashboard
Stat row (Sessions Logged, Completed, Minutes Practiced) plus two charts — a bar chart of sessions
by status and a donut chart of For/Against stance distribution — built with Recharts, ready to be
extended with skill-score charts once AI analysis exists.

### Administration (Administrator only)
Simple user table: name, email, inline role-change dropdown, active/disabled status, and a
deactivate action.
