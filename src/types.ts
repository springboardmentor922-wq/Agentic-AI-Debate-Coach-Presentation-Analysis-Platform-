/**
 * Types & Schemas for AI Debate Coach & Presentation Analysis Platform
 */

export type UserRole = 'learner' | 'coach' | 'educator' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  institution?: string;
  bio?: string;
  assignedCoach?: string;
  isCustomAccount?: boolean;
  badges?: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: 'logic' | 'speech' | 'streak' | 'mastery' | 'community';
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  rewardPoints: number;
}

export type DebateFormat = 'One-on-One' | 'Oxford Debate' | 'Parliamentary Debate';

export type FallacyType = 
  | 'Ad Hominem'
  | 'Straw Man'
  | 'False Dilemma'
  | 'Slippery Slope'
  | 'Circular Reasoning'
  | 'Red Herring'
  | 'Appeal to Emotion'
  | 'None';

export interface FallacyReportSchema {
  fallacy_detected: boolean;
  fallacy_type: FallacyType;
  offending_text?: string | null;
  explanation?: string | null;
  counter_strategy?: string | null;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  penalty_points?: number;
  confidence_score?: number;
}

export interface PresentationMetricsSchema {
  transcript: string;
  words_per_minute: number;
  pace_status: 'Too Fast' | 'Optimal' | 'Too Slow' | 'Slow' | 'Fast';
  filler_words_count: number;
  filler_words_list: string[];
  filler_breakdown?: Array<{ word: string; count: number }>;
  filler_percentage?: number;
  clarity_score: number;
  confidence_score: number;
  engagement_score: number;
  overall_score: number;
  pitch_variance?: 'Monotone' | 'Balanced' | 'Dynamic';
  energy_level?: 'Low' | 'Moderate' | 'High';
  speech_duration_sec: number;
  feedback_tips?: string[];
  activated_agents?: string[];
}

export interface DebateTurnResponseSchema {
  user_transcript: string;
  ai_rebuttal: string;
  words_per_minute: number;
  pace_status: 'Too Fast' | 'Optimal' | 'Too Slow';
  fallacy_metrics: FallacyReportSchema;
  argument_score: number;
  evidence_score: number;
  persuasiveness_score: number;
  activated_agents: string[];
}

export interface ActiveDebateTurn {
  id: string;
  userText: string;
  aiRebuttal: string;
  wpm: number;
  paceStatus: string;
  fallacyMetrics: FallacyReportSchema;
  argumentScore: number;
  activatedAgents: string[];
  timestamp: string;
  isSample?: boolean;
}

export interface ActiveDebateSession {
  id: string;
  topic: string;
  format: DebateFormat;
  side: 'Proposition' | 'Opposition';
  turns: ActiveDebateTurn[];
  status: 'in_progress' | 'completed';
  createdAt: string;
  lastUpdated: string;
}

export interface DebateSession {
  id: string;
  title: string;
  topic: string;
  format: DebateFormat;
  date: string;
  status: 'Completed' | 'Scheduled' | 'Draft' | 'In Progress';
  score?: number;
  duration?: string;
  side: 'Proposition' | 'Opposition';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  turnsCount?: number;
}

export interface PracticeTopic {
  id: string;
  title: string;
  category: 'Technology' | 'Environment' | 'Society' | 'Politics' | 'Ethics';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  keyArgumentsFor: string[];
  keyArgumentsAgainst: string[];
  popularityCount: number;
}

export interface PerformanceScore {
  sessionDate: string;
  sessionName: string;
  debateScore: number;
  presentationScore: number;
  overallScore: number;
  argumentQuality: number;
  evidenceUsage: number;
  logicalConsistency: number;
  rebuttalEffectiveness: number;
  communicationSkills: number;
  confidence: number;
}

export interface SkillProgress {
  dimension: string;
  userScore: number;
  averageScore: number;
}

export interface CoachingPlan {
  id: string;
  learnerName?: string;
  title: string;
  focusArea: string;
  progressPercent: number;
  targetDate: string;
  drills: {
    id: string;
    title: string;
    type: 'drill' | 'lesson' | 'exercise';
    completed: boolean;
    duration: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'evaluation' | 'session' | 'system' | 'coaching';
  targetLearner?: string;
  link?: string;
  details?: string;
  source?: string;
  actionLabel?: string;
  metrics?: { label: string; value: string | number; color?: string }[];
  keyTakeaways?: string[];
}

export interface CoachFeedbackNote {
  id: string;
  learnerId?: string;
  learnerName: string;
  learnerEmail?: string;
  coachName: string;
  topic: string;
  note: string;
  date: string;
  timestamp: string;
  score?: number;
  grade?: string;
  focusSkill?: string;
  recommendation?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}

