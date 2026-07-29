// Maps the current route to the page_key the backend orchestrator uses to
// decide which specialist agents to activate (see
// backend/app/agents/orchestrator.py PAGE_AGENT_MAP). Keep these in sync.
const ROUTE_RULES = [
  { test: (p) => p === '/learner', key: 'learner_dashboard', label: 'Learner Dashboard' },
  { test: (p) => p.startsWith('/learner/sessions'), key: 'debate_session', label: 'Debate Session' },
  { test: (p) => p.startsWith('/learner/topics'), key: 'practice_topics', label: 'Practice Topics' },
  { test: (p) => p.startsWith('/learner/analysis'), key: 'my_debates', label: 'My Debates' },
  { test: (p) => p.startsWith('/learner/presentation'), key: 'presentation_analysis', label: 'Presentation Analysis' },
  { test: (p) => p.startsWith('/learner/learning'), key: 'feedback_coaching', label: 'Feedback & Coaching' },
  { test: (p) => p.startsWith('/learner/reports'), key: 'performance_dashboard', label: 'Performance Dashboard' },
  { test: (p) => p.startsWith('/learner'), key: 'learner_dashboard', label: 'Learner Dashboard' },
  { test: (p) => p.startsWith('/coach'), key: 'coach_dashboard', label: 'Coach Dashboard' },
  { test: (p) => p.startsWith('/educator'), key: 'educator_dashboard', label: 'Educator Dashboard' },
  { test: (p) => p.startsWith('/admin'), key: 'admin_dashboard', label: 'Admin Dashboard' },
]

export function resolvePageContext(pathname) {
  const match = ROUTE_RULES.find((r) => r.test(pathname))
  return match || { key: 'general', label: 'the platform' }
}

export const AGENT_LABELS = {
  argument_analysis: 'Argument Analysis',
  fallacy_detection: 'Fallacy Detection',
  counterargument: 'Counterargument',
  presentation_analysis: 'Presentation Analysis',
  recommendation_coaching: 'Recommendation & Coaching',
  performance_analytics: 'Performance Analytics',
  report_generation: 'Report Generation',
}
