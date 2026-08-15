/**
 * Learner <-> Coach Synchronization Service
 * 
 * Manages real-time data persistence, enrollment registry, session completion,
 * dynamic scoring telemetry, and bi-directional events between Learner & Coach views.
 */

import { UserProfile, NotificationItem } from '../types';
import { addNotification } from './feedbackAndNotificationService';
// import { addNotification } from './feedbackAndNotificationService';

export interface LearnerActivityRecord {
  id?: string;
  learnerId: string;
  name?: string;
  learnerName: string;
  email?: string;
  learnerEmail: string;
  roleLabel: string;
  avatar?: string;
  institution?: string;
  assignedCoach?: string;
  totalDebates: number;
  averageScore: number;
  lastActiveTopic?: string;
  lastActiveTimestamp?: string;
  lastTurnCount?: number;
  lastScore?: number;
  skills: {
    communication: number;
    argument: number;
    confidence: number;
    evidence: number;
    reasoning: number;
    rebuttal?: number;
    arguments?: number;
  };
  completedDebates: Array<{
    id: string;
    topic: string;
    format: string;
    side: string;
    date: string;
    score: number;
    grade: string;
    turnsCount: number;
  }>;
  recentHistory?: Array<{
    id: string;
    topic: string;
    format: string;
    side: string;
    date: string;
    score: number;
    grade: string;
    turnsCount: number;
  }>;
}

const LEARNER_REGISTRY_KEY = 'ai_debate_learners_registry';
const COMPLETED_SESSIONS_KEY = 'ai_debate_completed_list';

// Default seeded active learners
const DEFAULT_LEARNERS: LearnerActivityRecord[] = [
  {
    learnerId: 'usr_alex',
    learnerName: 'Alex Chen',
    learnerEmail: 'alex.chen@debatecoach.ai',
    roleLabel: 'Senior Debater',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    institution: 'Stanford Debate Union',
    assignedCoach: 'Arjun Mehta (Senior Coach)',
    totalDebates: 9,
    averageScore: 78,
    lastActiveTopic: 'Universal Basic Income creates a safety net for economic innovation.',
    lastActiveTimestamp: '10m ago',
    lastTurnCount: 4,
    lastScore: 84,
    skills: {
      communication: 88,
      argument: 74,
      confidence: 86,
      evidence: 68,
      reasoning: 80
    },
    completedDebates: [
      {
        id: 'real_seed_1',
        topic: 'Universal Basic Income creates a safety net for economic innovation.',
        format: 'One-on-One',
        side: 'Proposition',
        date: 'Today',
        score: 84,
        grade: 'B+',
        turnsCount: 4
      }
    ]
  },
  {
    learnerId: 'usr_siddharth',
    learnerName: 'Siddharth Rao',
    learnerEmail: 'siddharth@student.edu',
    roleLabel: 'Debater',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    institution: 'Debate Club',
    assignedCoach: 'Dr. Evelyn Reed (Rhetoric Specialist)',
    totalDebates: 5,
    averageScore: 82,
    lastActiveTopic: 'Social media platforms should be regulated by independent governmental bodies',
    lastActiveTimestamp: '25m ago',
    lastTurnCount: 3,
    lastScore: 91,
    skills: {
      communication: 91,
      argument: 85,
      confidence: 93,
      evidence: 88,
      reasoning: 89
    },
    completedDebates: [
      {
        id: 'real_seed_2',
        topic: 'Social media platforms should be regulated by independent governmental bodies',
        format: 'Oxford Debate',
        side: 'Proposition',
        date: 'Aug 13, 2026',
        score: 91,
        grade: 'A',
        turnsCount: 3
      }
    ]
  },
  {
    learnerId: 'usr_riya',
    learnerName: 'Riya Patel',
    learnerEmail: 'riya.patel@debate.edu',
    roleLabel: 'Advanced Debater',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    institution: 'National Debate League',
    assignedCoach: 'Arjun Mehta (Senior Coach)',
    totalDebates: 14,
    averageScore: 91,
    lastActiveTopic: 'Junk food advertising targeting children should be banned',
    lastActiveTimestamp: '1h ago',
    lastTurnCount: 5,
    lastScore: 94,
    skills: {
      communication: 94,
      argument: 92,
      confidence: 95,
      evidence: 90,
      reasoning: 93
    },
    completedDebates: []
  },
  {
    learnerId: 'usr_karan',
    learnerName: 'Karan Mehta',
    learnerEmail: 'karan.m@debate.edu',
    roleLabel: 'Intermediate Debater',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    institution: 'Pacific Speech Academy',
    assignedCoach: 'Ananya Sharma (Speech Evaluator)',
    totalDebates: 8,
    averageScore: 78,
    lastActiveTopic: 'Renewable energy subsidies accelerate infrastructure modernizations',
    lastActiveTimestamp: '3h ago',
    lastTurnCount: 4,
    lastScore: 79,
    skills: {
      communication: 78,
      argument: 76,
      confidence: 84,
      evidence: 82,
      reasoning: 80
    },
    completedDebates: []
  }
];

export function getLearnerRegistry(): LearnerActivityRecord[] {
  try {
    const raw = localStorage.getItem(LEARNER_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          id: item.id || item.learnerId,
          name: item.name || item.learnerName,
          email: item.email || item.learnerEmail,
          assignedCoach: item.assignedCoach || 'Arjun Mehta (Senior Coach)',
          completedDebates: Array.isArray(item.completedDebates) ? item.completedDebates : [],
          recentHistory: Array.isArray(item.completedDebates) ? item.completedDebates : (Array.isArray(item.recentHistory) ? item.recentHistory : []),
          skills: {
            communication: item.skills?.communication ?? 80,
            argument: item.skills?.argument ?? item.skills?.arguments ?? 75,
            confidence: item.skills?.confidence ?? 80,
            evidence: item.skills?.evidence ?? 70,
            reasoning: item.skills?.reasoning ?? 75,
            rebuttal: item.skills?.rebuttal ?? 75,
            arguments: item.skills?.arguments ?? item.skills?.argument ?? 75
          }
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load learner registry', e);
  }

  try {
    localStorage.setItem(LEARNER_REGISTRY_KEY, JSON.stringify(DEFAULT_LEARNERS));
  } catch (e) {
    // ignore
  }
  return DEFAULT_LEARNERS;
}

export function saveLearnerRegistry(list: LearnerActivityRecord[]): void {
  try {
    localStorage.setItem(LEARNER_REGISTRY_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('debate_learner_registry_updated', { detail: list }));
  } catch (e) {
    console.error('Failed to save learner registry', e);
  }
}

/**
 * Call this when a new user signs up or enrolls as a Learner.
 * Automatically adds the learner to the registry so they appear instantly on the Coach Dashboard.
 */
export function registerLearner(user: UserProfile): LearnerActivityRecord {
  const current = getLearnerRegistry();
  const existingIdx = current.findIndex(
    l => l.learnerId === user.id || l.learnerEmail.toLowerCase() === user.email.toLowerCase()
  );

  const newRecord: LearnerActivityRecord = {
    learnerId: user.id,
    learnerName: user.name,
    learnerEmail: user.email,
    roleLabel: user.roleLabel || 'Debate Learner',
    avatar: user.avatar,
    institution: user.institution || 'Debate Academy',
    totalDebates: 1,
    averageScore: 82,
    lastActiveTopic: 'Universal Basic Income creates a safety net for economic innovation.',
    lastActiveTimestamp: 'Just now (Enrolled)',
    lastTurnCount: 1,
    lastScore: 82,
    skills: {
      communication: 80,
      argument: 75,
      confidence: 82,
      evidence: 72,
      reasoning: 78
    },
    completedDebates: []
  };

  let updatedList: LearnerActivityRecord[];
  if (existingIdx >= 0) {
    // Update existing
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      learnerName: user.name,
      roleLabel: user.roleLabel || updatedList[existingIdx].roleLabel,
      avatar: user.avatar || updatedList[existingIdx].avatar,
      institution: user.institution || updatedList[existingIdx].institution
    };
  } else {
    // New enrollment: prepend so coaches see new student immediately at the top
    updatedList = [newRecord, ...current];
  }

  saveLearnerRegistry(updatedList);

  // Notify coach about new enrollment
  addNotification({
    title: 'New Learner Enrolled',
    message: `${user.name} has enrolled as a debate mentee (${user.roleLabel || 'Learner'}). Profile and scoring synced to Coach Portal.`,
    type: 'system'
  });

  return newRecord;
}

/**
 * Call this whenever a learner finishes a debate, turn, or practice session.
 * Updates their score, total debates, recent motion, and broadcasts in real-time.
 */
export function updateLearnerSessionProgress(params: {
  learnerName: string;
  learnerEmail?: string;
  topic: string;
  format?: string;
  side?: string;
  score: number;
  grade?: string;
  turnsCount?: number;
  clarity?: number;
  reasoning?: number;
  confidence?: number;
  evidence?: number;
}): void {
  const current = getLearnerRegistry();
  const searchName = params.learnerName.trim().toLowerCase();
  const searchEmail = params.learnerEmail?.trim().toLowerCase();

  let targetIdx = current.findIndex(
    l => (searchEmail && l.learnerEmail.toLowerCase() === searchEmail) || l.learnerName.toLowerCase() === searchName
  );

  const grade = params.grade || (params.score >= 88 ? 'A' : params.score >= 80 ? 'B+' : params.score >= 70 ? 'B' : 'C+');

  const debateEntry = {
    id: `deb_${Date.now()}`,
    topic: params.topic,
    format: params.format || 'One-on-One',
    side: params.side || 'Proposition',
    date: 'Today',
    score: Math.round(params.score),
    grade: grade,
    turnsCount: params.turnsCount || 3
  };

  let updatedList: LearnerActivityRecord[];

  if (targetIdx >= 0) {
    const existing = current[targetIdx];
    const prevCount = existing.totalDebates || 0;
    const newCount = prevCount + 1;
    const newAvg = Math.round(((existing.averageScore * prevCount) + params.score) / newCount);

    const updatedRecord: LearnerActivityRecord = {
      ...existing,
      totalDebates: newCount,
      averageScore: newAvg,
      lastActiveTopic: params.topic,
      lastActiveTimestamp: 'Just now',
      lastTurnCount: params.turnsCount || 3,
      lastScore: Math.round(params.score),
      skills: {
        communication: params.clarity ? Math.round((existing.skills.communication + params.clarity) / 2) : existing.skills.communication,
        argument: params.reasoning ? Math.round((existing.skills.argument + params.reasoning) / 2) : existing.skills.argument,
        confidence: params.confidence ? Math.round((existing.skills.confidence + params.confidence) / 2) : existing.skills.confidence,
        evidence: params.evidence ? Math.round((existing.skills.evidence + params.evidence) / 2) : existing.skills.evidence,
        reasoning: params.reasoning ? Math.round((existing.skills.reasoning + params.reasoning) / 2) : existing.skills.reasoning
      },
      completedDebates: [debateEntry, ...(existing.completedDebates || [])]
    };

    updatedList = [...current];
    updatedList[targetIdx] = updatedRecord;
  } else {
    // If not found in registry, create record
    const newRecord: LearnerActivityRecord = {
      learnerId: `usr_${Date.now()}`,
      learnerName: params.learnerName,
      learnerEmail: params.learnerEmail || `${params.learnerName.toLowerCase().replace(/\s+/g, '.')}@debatecoach.ai`,
      roleLabel: 'Debate Learner',
      totalDebates: 1,
      averageScore: Math.round(params.score),
      lastActiveTopic: params.topic,
      lastActiveTimestamp: 'Just now',
      lastTurnCount: params.turnsCount || 3,
      lastScore: Math.round(params.score),
      skills: {
        communication: params.clarity || 84,
        argument: params.reasoning || 80,
        confidence: params.confidence || 85,
        evidence: params.evidence || 75,
        reasoning: params.reasoning || 80
      },
      completedDebates: [debateEntry]
    };
    updatedList = [newRecord, ...current];
  }

  saveLearnerRegistry(updatedList);
}

/**
 * Returns a specific learner's activity and scores or null if not found.
 */
export function getLearnerProfileData(identifier: string): LearnerActivityRecord | undefined {
  const current = getLearnerRegistry();
  const query = identifier.trim().toLowerCase();
  return current.find(
    l => l.learnerId.toLowerCase() === query ||
         l.learnerName.toLowerCase() === query ||
         l.learnerEmail.toLowerCase() === query
  );
}

/**
 * Administrative Authority Function:
 * ONLY Administrators have permission to assign or reassign a coach to a learner.
 */
export function assignCoachToLearner(learnerIdOrEmail: string, coachName: string, adminUser?: string): boolean {
  const current = getLearnerRegistry();
  const query = learnerIdOrEmail.trim().toLowerCase();
  
  const targetIdx = current.findIndex(
    l => l.learnerId.toLowerCase() === query ||
         l.learnerEmail.toLowerCase() === query ||
         l.learnerName.toLowerCase() === query
  );

  if (targetIdx >= 0) {
    const updated = [...current];
    const targetLearner = updated[targetIdx];
    updated[targetIdx] = {
      ...targetLearner,
      assignedCoach: coachName
    };
    saveLearnerRegistry(updated);

    // Notify learner of new coach assignment
    addNotification({
      title: 'Mentor Coach Assigned by Administrator',
      message: `System Administrator (${adminUser || 'Admin'}) has officially assigned ${coachName} as your primary mentor coach.`,
      type: 'coaching'
    });

    return true;
  }
  return false;
}

/**
 * Returns the currently assigned coach for a given learner identifier.
 */
export function getAssignedCoachForLearner(identifier: string): string {
  const learner = getLearnerProfileData(identifier);
  return learner?.assignedCoach || 'Arjun Mehta (Senior Coach)';
}

