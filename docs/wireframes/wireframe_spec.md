# Wireframe Component Specifications
## Agentic AI Debate Coach & Presentation Analysis Platform

---

## 1. Overview
This directory contains wireframe layout specifications for the platform user interface components.

---

## 2. Key Components & Layout Specs

### 2.1 Audio Waveform Spectrum (`AudioVisualizer.jsx`)
- **Canvas Dimensions**: 100% width x 120px height
- **Visual Color Scheme**: `#3b82f6` (gradient to `#8b5cf6`)
- **Frame Rate**: 60 FPS via Web Audio API `AnalyserNode`

### 2.2 Fallacy Alert Badges (`FallacyBadge.jsx`)
- **Styling**: Rounded pill badge with icon + fallacy title + expandable explanation popover
- **Color Codes**:
  - *Ad Hominem*: Red / Rose background (`#f43f5e`)
  - *Straw Man*: Amber background (`#f59e0b`)
  - *False Dilemma*: Purple background (`#8b5cf6`)
  - *Slippery Slope*: Cyan background (`#06b6d4`)
  - *Appeal to Authority*: Indigo background (`#6366f1`)

### 2.3 Radar Skill Plot (`SkillChart.jsx`)
- **Axes**: Communication, Logic, Delivery
- **Range**: 0 to 100 normalized score
- **Dataset Color**: `#10b981` (emerald green fill with 20% opacity)
