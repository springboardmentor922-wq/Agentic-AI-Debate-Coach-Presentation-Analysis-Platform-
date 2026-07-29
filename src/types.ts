/**
 * Types & Schemas for AI Debate Coach & Presentation Analysis Platform
 */

export type UserRole = 'learner' | 'coach' | 'educator' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  institution?: string;
  bio?: string;
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
}

export interface PresentationMetricsSchema {
  transcript: string;
  words_per_minute: number;
  pace_status: 'Too Fast' | 'Optimal' | 'Too Slow';
  filler_words_count: number;
  filler_words_list: string[];
  clarity_score: number;
  confidence_score: number;
  engagement_score: number;
  overall_score: number;
  speech_duration_sec: number;
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
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}
