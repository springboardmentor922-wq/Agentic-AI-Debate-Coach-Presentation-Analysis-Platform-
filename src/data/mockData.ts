import { 
  DebateSession, 
  PracticeTopic, 
  PerformanceScore, 
  SkillProgress, 
  CoachingPlan, 
  NotificationItem, 
  NoteItem 
} from '../types';

export const INITIAL_USER = {
  id: 'usr_001',
  name: 'Usha',
  role: 'learner',
  email: 'usha.learner@debatecoach.ai',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  debatesCount: 24,
  avgScore: 78.6,
  skillsImprovedCount: 6,
  streakDays: 7,
};

export const MOCK_DEBATE_SESSIONS: DebateSession[] = [
  {
    id: 'deb_101',
    title: 'Social Media Regulation Policy',
    topic: 'Should social media platforms be regulated by independent governmental bodies?',
    format: 'One-on-One',
    date: '24 May 2025',
    status: 'Completed',
    score: 82,
    duration: '18:42',
    side: 'Proposition',
    difficulty: 'Intermediate',
    turnsCount: 6,
  },
  {
    id: 'deb_102',
    title: 'AI: Boon or Bane for Humanity?',
    topic: 'Will artificial intelligence create more jobs than it eliminates by 2035?',
    format: 'Oxford Debate',
    date: '20 May 2025',
    status: 'Completed',
    score: 76,
    duration: '15:20',
    side: 'Opposition',
    difficulty: 'Advanced',
    turnsCount: 4,
  },
  {
    id: 'deb_103',
    title: 'Online vs Traditional Education',
    topic: 'Is online higher education as effective as traditional campus learning?',
    format: 'One-on-One',
    date: '28 May 2025',
    status: 'Scheduled',
    side: 'Proposition',
    difficulty: 'Beginner',
  },
  {
    id: 'deb_104',
    title: 'Climate Change Mitigation Funding',
    topic: 'Developed nations should pay climate reparations to developing nations.',
    format: 'Parliamentary Debate',
    date: '15 May 2025',
    status: 'Completed',
    score: 85,
    duration: '22:10',
    side: 'Proposition',
    difficulty: 'Advanced',
    turnsCount: 8,
  },
  {
    id: 'deb_105',
    title: 'Universal Basic Income Trial',
    topic: 'Implementing Universal Basic Income will boost entrepreneurial risk-taking.',
    format: 'Oxford Debate',
    date: '10 May 2025',
    status: 'Completed',
    score: 71,
    duration: '14:05',
    side: 'Opposition',
    difficulty: 'Intermediate',
    turnsCount: 5,
  }
];

export const MOCK_PRACTICE_TOPICS: PracticeTopic[] = [
  {
    id: 'top_01',
    title: 'The Future of Artificial Intelligence',
    category: 'Technology',
    difficulty: 'Intermediate',
    description: 'Debate the societal impact, ethical safeguards, and economic shifts driven by frontier AI models.',
    keyArgumentsFor: ['Accelerates scientific discovery', 'Automates mundane labor', 'Provides personalized education'],
    keyArgumentsAgainst: ['Job displacement concerns', 'Algorithmic bias', 'Security & alignment risks'],
    popularityCount: 1420,
  },
  {
    id: 'top_02',
    title: 'Climate Change is the Biggest Global Threat',
    category: 'Environment',
    difficulty: 'Beginner',
    description: 'Assess the urgency of international environmental policies and renewable energy transitions.',
    keyArgumentsFor: ['Extreme weather risks', 'Ecosystem collapse', 'Economic costs of inaction'],
    keyArgumentsAgainst: ['Immediate economic burdens', 'Transition grid instability', 'Developing nation needs'],
    popularityCount: 1180,
  },
  {
    id: 'top_03',
    title: 'Remote Work vs Office Work',
    category: 'Society',
    difficulty: 'Beginner',
    description: 'Analyze workplace culture, employee productivity, and mental health in post-pandemic work models.',
    keyArgumentsFor: ['Zero commute time', 'Work-life balance', 'Global talent access'],
    keyArgumentsAgainst: ['Reduced spontaneous collaboration', 'Isolation', 'Mentorship gaps'],
    popularityCount: 950,
  },
  {
    id: 'top_04',
    title: 'Mandatory Voting in Democratic Elections',
    category: 'Politics',
    difficulty: 'Advanced',
    description: 'Examine civic duty vs individual liberty regarding compulsory participation in democratic votes.',
    keyArgumentsFor: ['Higher civic participation', 'Prevents radical polarization', 'Legitimizes elected leaders'],
    keyArgumentsAgainst: ['Infringes on free choice', 'Uninformed votes', 'Administrative enforcement costs'],
    popularityCount: 820,
  },
  {
    id: 'top_05',
    title: 'Universal Basic Income Implementation',
    category: 'Politics',
    difficulty: 'Intermediate',
    description: 'Evaluate economic security, labor participation, and tax funding for state-guaranteed basic income.',
    keyArgumentsFor: ['Poverty eradication', 'Safety net against automation', 'Reduces administrative bureaucracy'],
    keyArgumentsAgainst: ['High fiscal cost', 'Possible disincentive to work', 'Inflation risks'],
    popularityCount: 1310,
  }
];

export const MOCK_PERFORMANCE_SCORES: PerformanceScore[] = [
  {
    sessionDate: 'Apr 10',
    sessionName: 'Speech Warmup',
    debateScore: 62,
    presentationScore: 60,
    overallScore: 62,
    argumentQuality: 60,
    evidenceUsage: 55,
    logicalConsistency: 62,
    rebuttalEffectiveness: 58,
    communicationSkills: 65,
    confidence: 60,
  },
  {
    sessionDate: 'Apr 24',
    sessionName: 'Policy Drill',
    debateScore: 68,
    presentationScore: 66,
    overallScore: 68,
    argumentQuality: 68,
    evidenceUsage: 62,
    logicalConsistency: 65,
    rebuttalEffectiveness: 66,
    communicationSkills: 70,
    confidence: 67,
  },
  {
    sessionDate: 'May 8',
    sessionName: 'Oxford Debate',
    debateScore: 72,
    presentationScore: 70,
    overallScore: 72,
    argumentQuality: 74,
    evidenceUsage: 68,
    logicalConsistency: 70,
    rebuttalEffectiveness: 72,
    communicationSkills: 75,
    confidence: 71,
  },
  {
    sessionDate: 'May 22',
    sessionName: 'UBI Debate',
    debateScore: 75,
    presentationScore: 74,
    overallScore: 75,
    argumentQuality: 78,
    evidenceUsage: 72,
    logicalConsistency: 75,
    rebuttalEffectiveness: 74,
    communicationSkills: 78,
    confidence: 76,
  },
  {
    sessionDate: 'Jun 5',
    sessionName: 'AI Ethics',
    debateScore: 82,
    presentationScore: 80,
    overallScore: 82,
    argumentQuality: 84,
    evidenceUsage: 78,
    logicalConsistency: 82,
    rebuttalEffectiveness: 80,
    communicationSkills: 83,
    confidence: 82,
  },
  {
    sessionDate: 'Jun 19',
    sessionName: 'Social Media Policy',
    debateScore: 87,
    presentationScore: 85,
    overallScore: 87,
    argumentQuality: 88,
    evidenceUsage: 84,
    logicalConsistency: 86,
    rebuttalEffectiveness: 86,
    communicationSkills: 89,
    confidence: 87,
  }
];

export const MOCK_SKILL_PROGRESS: SkillProgress[] = [
  { dimension: 'Argument Quality', userScore: 85, averageScore: 68 },
  { dimension: 'Evidence Usage', userScore: 78, averageScore: 64 },
  { dimension: 'Logical Consistency', userScore: 82, averageScore: 62 },
  { dimension: 'Rebuttal Effectiveness', userScore: 88, averageScore: 60 },
  { dimension: 'Communication Skills', userScore: 80, averageScore: 70 },
  { dimension: 'Confidence', userScore: 84, averageScore: 65 },
];

export const MOCK_COACHING_PLANS: CoachingPlan[] = [
  {
    id: 'cp_01',
    title: 'Improve Argument Quality & Evidence',
    focusArea: 'Constructing robust empirical claims without logical gaps',
    progressPercent: 75,
    targetDate: '15 Jun 2025',
    drills: [
      { id: 'd1', title: 'Counterargument Drills: Sharpen rebuttal skills', type: 'drill', completed: true, duration: '15 mins' },
      { id: 'd2', title: 'Lesson: Logical Fallacies 101 - Identifying Ad Hominem & Straw Man', type: 'lesson', completed: true, duration: '20 mins' },
      { id: 'd3', title: 'Exercise: Impromptu Speaking - Thinking on your feet', type: 'exercise', completed: false, duration: '10 mins' },
      { id: 'd4', title: 'Evidence Integration: Citing statistical studies in real-time', type: 'drill', completed: false, duration: '15 mins' },
    ]
  },
  {
    id: 'cp_02',
    title: 'Speak More Confidently & Reduce Filler Words',
    focusArea: 'Pacing, vocal projection, eliminating "um" and "uh"',
    progressPercent: 60,
    targetDate: '22 Jun 2025',
    drills: [
      { id: 'd5', title: 'Speech Rate Control: Maintaining optimal 130-150 WPM', type: 'exercise', completed: true, duration: '12 mins' },
      { id: 'd6', title: 'Pause Mastery: Replacing fillers with deliberate silence', type: 'lesson', completed: false, duration: '15 mins' },
    ]
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'not_01',
    title: 'Upcoming Debate Session',
    message: 'Policy Debate Practice begins in 2 hours. Topic: Should social media be regulated?',
    timestamp: '10 mins ago',
    read: false,
    type: 'session',
  },
  {
    id: 'not_02',
    title: 'New AI Evaluation Feedback',
    message: 'Your argument analysis for "Renewable Energy" has been processed with score 82/100.',
    timestamp: '1 hour ago',
    read: false,
    type: 'evaluation',
  },
  {
    id: 'not_03',
    title: 'Goal Milestone Achieved!',
    message: 'Congratulations Usha! You achieved 5 consecutive practice debates.',
    timestamp: '2 hours ago',
    read: false,
    type: 'coaching',
  },
  {
    id: 'not_04',
    title: 'Fallacy Alert Resolved',
    message: 'Review your correction suggestion for the Straw Man fallacy flagged in yesterday\'s session.',
    timestamp: '1 day ago',
    read: true,
    type: 'evaluation',
  },
  {
    id: 'not_05',
    title: 'New Educator Announcement',
    message: 'Dr. Ananya Sharma uploaded a new rubric for Oxford Style Debates.',
    timestamp: '2 days ago',
    read: true,
    type: 'system',
  }
];

export const MOCK_NOTES: NoteItem[] = [
  {
    id: 'note_1',
    title: 'Debate Preparation: AI Ethics & Regulation',
    content: 'Key points to remember: 1. Always establish the harm framework first. 2. Cite empirical data on economic shift. 3. Rebut opponent\'s straw man regarding state control.',
    updatedAt: '24 May 2025',
    tags: ['AI Ethics', 'Preparation', 'Policy'],
  },
  {
    id: 'note_2',
    title: 'Key Fallacies to Spot in Opponent Speech',
    content: 'Ad Hominem (personal attack), Straw Man (oversimplifying claim), Slippery Slope (unfounded cascade), False Dilemma (only two extremes).',
    updatedAt: '20 May 2025',
    tags: ['Fallacies', 'Cheat Sheet'],
  },
  {
    id: 'note_3',
    title: 'Presentation Delivery Checklist',
    content: 'Target WPM: 130-150. Eye contact simulation: maintain steady camera posture. Pause 2 seconds after major claims.',
    updatedAt: '18 May 2025',
    tags: ['Public Speaking', 'Speech'],
  }
];

// Coach Dashboard Data
export const COACH_DATA = {
  name: 'Coach Arjun Mehta',
  activeLearners: 48,
  sessionsToday: 6,
  pendingEvaluations: 12,
  avgClassScore: 74.6,
  topPerformer: 'Riya Patel (91.2/100)',
  recentLearnerActivity: [
    { learner: 'Riya Patel', action: 'Completed a debate: Social Media Regulation', score: '85/100', time: '1h ago' },
    { learner: 'Karan Mehta', action: 'Submitted presentation: Renewable Energy', score: '78/100', time: '3h ago' },
    { learner: 'Sneha Kulkarni', action: 'Received feedback on Rebuttal Effectiveness', score: '80/100', time: '4h ago' },
    { learner: 'Arjun Verma', action: 'Joined Policy Debate Practice session', score: '--', time: '5h ago' },
  ],
  evaluationQueue: [
    { id: 'eq1', learner: 'Riya Patel', topic: 'Should AI be regulated?', priority: 'High', type: 'Debate',Submitted: '1h ago' },
    { id: 'eq2', learner: 'Karan Mehta', topic: 'Renewable Energy Solutions', priority: 'Medium', type: 'Presentation', Submitted: '3h ago' },
    { id: 'eq3', learner: 'Sneha Kulkarni', topic: 'Education System Reform', priority: 'Medium', type: 'Debate', Submitted: '4h ago' },
    { id: 'eq4', learner: 'Arjun Verma', topic: 'Space Exploration Funding', priority: 'Low', type: 'Presentation', Submitted: '5h ago' },
  ],
  skillGap: [
    { skill: 'Argument Quality', percent: 68 },
    { skill: 'Evidence Usage', percent: 64 },
    { skill: 'Logical Consistency', percent: 60 },
    { skill: 'Rebuttal Effectiveness', percent: 55 },
    { skill: 'Communication Skills', percent: 72 },
  ]
};

// Educator Dashboard Data
export const EDUCATOR_DATA = {
  name: 'Dr. Ananya Sharma',
  totalLearners: 128,
  activeClasses: 8,
  debatesConducted: 36,
  avgClassScore: 72.4,
  myClasses: [
    { name: 'B.Tech 3rd Year', learners: 32, avgScore: 76.8, trend: '+7.2' },
    { name: 'B.Tech 2nd Year', learners: 28, avgScore: 69.3, trend: '+4.6' },
    { name: 'MBA 1st Year', learners: 24, avgScore: 71.5, trend: '+6.1' },
    { name: 'BBA Final Year', learners: 22, avgScore: 68.9, trend: '+3.8' },
    { name: 'Debate Club', learners: 22, avgScore: 81.6, trend: '+9.3' },
  ],
  classDistribution: [
    { name: 'Excellent (80-100)', value: 28, color: '#22c55e' },
    { name: 'Good (60-79)', value: 62, color: '#3b82f6' },
    { name: 'Average (40-59)', value: 28, color: '#f59e0b' },
    { name: 'Needs Improvement (0-39)', value: 10, color: '#ef4444' },
  ]
};

// Admin Dashboard Data
export const ADMIN_DATA = {
  totalUsers: 2842,
  learnersCount: 2186,
  coachesCount: 156,
  educatorsCount: 312,
  debatesConducted: 1264,
  avgPlatformScore: 74.6,
  systemHealth: [
    { service: 'Web Server', status: 'Operational' },
    { service: 'Database (Postgres + Mongo)', status: 'Operational' },
    { service: 'AI Agents Orchestrator', status: 'Operational' },
    { service: 'Storage Engine', status: 'Operational' },
    { service: 'Real-time Engine', status: 'Operational' },
  ],
  aiServiceUsage: [
    { service: 'Argument Analysis', usagePercent: 78 },
    { service: 'Fallacy Detection (Agent 1 Referee)', usagePercent: 63 },
    { service: 'Speech & Presentation Analysis', usagePercent: 71 },
    { service: 'Presentation Scoring', usagePercent: 68 },
    { service: 'Counterargument Gen (Agent 2 Rival)', usagePercent: 59 },
  ]
};

export const MOCK_ADMIN_DATA = ADMIN_DATA;
export const MOCK_COACH_DATA = COACH_DATA;
export const MOCK_EDUCATOR_DATA = EDUCATOR_DATA;
export const MOCK_DEBATES = MOCK_DEBATE_SESSIONS;

