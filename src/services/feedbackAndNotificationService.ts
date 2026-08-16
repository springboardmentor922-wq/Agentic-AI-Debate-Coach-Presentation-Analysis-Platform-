import { NotificationItem, CoachFeedbackNote } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'ai_debate_notifications_list';
const COACH_FEEDBACK_STORAGE_KEY = 'ai_debate_coach_feedback_notes';

// Initial default seed notifications
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'New Coach Feedback Posted',
    message: 'Coach Arjun Mehta reviewed your turn log on "Universal Basic Income" and left strategic recommendations.',
    timestamp: '15 mins ago',
    read: false,
    type: 'coaching',
    targetLearner: 'Alex Chen',
    link: 'feedback-coaching'
  },
  {
    id: 'notif_2',
    title: 'AI Referee Evaluation Score',
    message: 'Your Oxford debate round achieved 88/100 with zero detected logical fallacies!',
    timestamp: '45 mins ago',
    read: false,
    type: 'evaluation',
    link: 'performance-scores'
  },
  {
    id: 'notif_3',
    title: 'Policy Debate Practice Session',
    message: 'Upcoming Parliamentary round ready for simulation with Agent 01 Referee & Agent 02 Rival.',
    timestamp: '2 hours ago',
    read: false,
    type: 'session',
    link: 'ai-simulation'
  },
  {
    id: 'notif_4',
    title: 'Speech Prosody Coaching Alert',
    message: 'Your average speaking rate was 142 WPM (Optimal cadence). 0 filler words detected.',
    timestamp: '5 hours ago',
    read: true,
    type: 'evaluation',
    link: 'presentation-analysis'
  },
  {
    id: 'notif_5',
    title: 'New Assignment from Educator',
    message: 'Ananya Sharma assigned "Renewable Energy Subsidies & Grid Modernization" debate brief.',
    timestamp: '1 day ago',
    read: true,
    type: 'system',
    link: 'practice-topics'
  }
];

// Initial default coach feedback notes
const DEFAULT_COACH_NOTES: CoachFeedbackNote[] = [
  {
    id: 'cn_101',
    learnerName: 'Alex Chen',
    learnerEmail: 'alex.chen@debatecoach.ai',
    coachName: 'Coach Arjun Mehta',
    topic: 'Universal Basic Income creates a safety net for economic innovation',
    note: 'Great opening constructive hook! However, during cross-examination in Turn 3, remember to concede short-term fiscal adjustment costs and immediately pivot into long-term commercial technology multiplier effects rather than dismissing opposing budget queries.',
    date: 'Aug 14, 2026',
    timestamp: 'Yesterday at 4:15 PM',
    score: 84,
    grade: 'B+',
    focusSkill: 'Cross-Examination Rebuttal',
    recommendation: 'Use Toulmin warrant mapping to support economic data points.'
  },
  {
    id: 'cn_102',
    learnerName: 'Siddharth Rao',
    learnerEmail: 'siddharth@student.edu',
    coachName: 'Coach Arjun Mehta',
    topic: 'Social media platforms should be regulated by independent governmental bodies',
    note: 'Flawless signposting in your second constructive speech! Your citation of the 2024 adolescent wellness longitudinal study carried significant judge weight. Continue refining your Points of Information (POI) timing.',
    date: 'Aug 13, 2026',
    timestamp: '2 days ago',
    score: 91,
    grade: 'A',
    focusSkill: 'Evidence Sourcing & POI',
    recommendation: 'Maintain your current pace and integrate counter-models during closing whip.'
  }
];

// --- NOTIFICATIONS MANAGEMENT ---

export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read notifications from localStorage', e);
  }
  // Store default seed
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
  } catch (e) {
    // ignore
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('debate_notifications_updated', { detail: notifications }));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function addNotification(
  item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'> & { timestamp?: string }
): NotificationItem {
  const current = getNotifications();
  const newItem: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: item.title,
    message: item.message,
    timestamp: item.timestamp || 'Just now',
    read: false,
    type: item.type,
    targetLearner: item.targetLearner,
    link: item.link || 'notifications'
  };

  const updated = [newItem, ...current];
  saveNotifications(updated);
  return newItem;
}

export function markNotificationAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map(n => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function deleteNotification(id: string): void {
  const current = getNotifications();
  const updated = current.filter(n => n.id !== id);
  saveNotifications(updated);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

// --- COACH FEEDBACK NOTES MANAGEMENT ---

export function getCoachFeedbackNotes(): CoachFeedbackNote[] {
  try {
    const raw = localStorage.getItem(COACH_FEEDBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read coach feedback notes from localStorage', e);
  }
  try {
    localStorage.setItem(COACH_FEEDBACK_STORAGE_KEY, JSON.stringify(DEFAULT_COACH_NOTES));
  } catch (e) {
    // ignore
  }
  return DEFAULT_COACH_NOTES;
}

export function saveCoachFeedbackNote(note: Omit<CoachFeedbackNote, 'id' | 'date' | 'timestamp'> & { id?: string; date?: string; timestamp?: string; coachName?: string }): CoachFeedbackNote {
  const current = getCoachFeedbackNotes();
  const newNote: CoachFeedbackNote = {
    id: note.id || `cn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    learnerName: note.learnerName,
    learnerEmail: note.learnerEmail,
    coachName: note.coachName || 'Debate Coach',
    topic: note.topic,
    note: note.note,
    date: note.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: note.timestamp || 'Just now',
    score: note.score || 82,
    grade: note.grade || 'B+',
    focusSkill: note.focusSkill || 'Rebuttal & Argument Structure',
    recommendation: note.recommendation || 'Focus on warrant proof and pace stability.'
  };

  // Replace if exists, or prepend
  const existingIdx = current.findIndex(n => n.id === newNote.id);
  let updated: CoachFeedbackNote[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newNote;
  } else {
    updated = [newNote, ...current];
  }

  try {
    localStorage.setItem(COACH_FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('debate_coach_feedback_updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to persist coach note', e);
  }

  // Also dispatch a real Notification for the learner
  addNotification({
    title: `Coach Note from ${newNote.coachName}`,
    message: `Feedback received on "${newNote.topic}": "${newNote.note.slice(0, 75)}${newNote.note.length > 75 ? '...' : ''}"`,
    type: 'coaching',
    targetLearner: newNote.learnerName,
    link: 'feedback-coaching'
  });

  return newNote;
}
