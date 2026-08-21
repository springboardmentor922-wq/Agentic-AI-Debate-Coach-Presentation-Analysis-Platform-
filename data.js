/* ==========================================================================
   AI DEBATE COACH - COMPREHENSIVE MOCK DATASET & ENGINE
   ========================================================================== */

window.AIDebateData = {
  // Logical Fallacies Knowledge Base & Detector Rules
  fallacies: [
    {
      id: 'fallacy-1',
      name: 'Strawman Fallacy',
      category: 'Distortion',
      severity: 'high',
      description: 'Misrepresenting an opponent\'s argument to make it easier to attack.',
      exampleQuote: 'My opponent wants to reduce military funding, which means they want our country completely defenseless!',
      suggestion: 'Restate the opponent\'s argument accurately before responding. Address their actual points rather than an exaggerated version.'
    },
    {
      id: 'fallacy-2',
      name: 'Ad Hominem',
      category: 'Personal Attack',
      severity: 'high',
      description: 'Attacking the person making the argument rather than the argument itself.',
      exampleQuote: 'We shouldn\'t listen to Dr. Smith\'s economic plan because he was fired from his first job twenty years ago.',
      suggestion: 'Refocus your argument on facts, statistics, and logical reasoning rather than personal background or character traits.'
    },
    {
      id: 'fallacy-3',
      name: 'False Dilemma',
      category: 'Oversimplification',
      severity: 'medium',
      description: 'Presenting two alternative states as the only possibilities when more exist.',
      exampleQuote: 'Either we ban all social media platforms immediately, or society will collapse entirely.',
      suggestion: 'Acknowledge nuance and middle-ground solutions. Explore regulatory or educational alternatives.'
    },
    {
      id: 'fallacy-4',
      name: 'Slippery Slope',
      category: 'Causal Fallacy',
      severity: 'medium',
      description: 'Asserting that a relatively small first step will inevitably lead to a chain of negative events.',
      exampleQuote: 'If we allow students to use AI tools for brainstorming, soon nobody will learn how to read or write at all.',
      suggestion: 'Provide empirical evidence demonstrating direct causation for each step in the chain.'
    },
    {
      id: 'fallacy-5',
      name: 'Circular Reasoning',
      category: 'Begging the Question',
      severity: 'medium',
      description: 'Using the conclusion as a premise to support the claim.',
      exampleQuote: 'Free speech is vital for democracy because a democratic nation requires people to speak freely.',
      suggestion: 'Introduce external validation, historical precedents, or structural benefits to justify your claim.'
    },
    {
      id: 'fallacy-6',
      name: 'Appeal to Emotion',
      category: 'Emotional Manipulation',
      severity: 'low',
      description: 'Attempting to manipulate an emotional response in place of a valid argument.',
      exampleQuote: 'Think of the poor suffering children if we don\'t pass this specific zoning tax bill today!',
      suggestion: 'Balance emotional anecdotes with tangible policy impact metrics and objective data.'
    },
    {
      id: 'fallacy-7',
      name: 'Appeal to Authority',
      category: 'Irrelevant Authority',
      severity: 'low',
      description: 'Claiming something must be true because an unqualified authority asserted it.',
      exampleQuote: 'Famous actor Jack Nicholson says quantum computing will replace traditional servers by next year.',
      suggestion: 'Cite accredited peer-reviewed research or domain-specific expert consensus instead.'
    },
    {
      id: 'fallacy-8',
      name: 'Red Herring',
      category: 'Diversion',
      severity: 'medium',
      description: 'Introducing an irrelevant topic to divert attention from the original issue.',
      exampleQuote: 'Why discuss carbon emissions when our national highways have so many potholes?',
      suggestion: 'Maintain topic focus and answer the core prompt directly before introducing secondary subjects.'
    },
    {
      id: 'fallacy-9',
      name: 'False Cause (Post Hoc)',
      category: 'Causal Fallacy',
      severity: 'high',
      description: 'Assuming that because B came after A, A must have caused B.',
      exampleQuote: 'Crime rates dropped right after we installed new street lamps, so street lamps solved crime.',
      suggestion: 'Account for confounding variables such as economic shifts, policing policies, and seasonal trends.'
    }
  ],

  // Learner Profile & Metrics
  learner: {
    name: 'Alexandra Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    title: 'Advanced Varsity Debater',
    institution: 'Stanford Debate Union',
    streakDays: 14,
    leaderboardRank: 4,
    totalDebates: 38,
    metrics: {
      overall: 88,
      confidence: 92,
      fluency: 85,
      argumentStrength: 90,
      communication: 86,
      persuasiveness: 89,
      criticalThinking: 94,
      delivery: 84
    },
    weeklyTrend: [76, 80, 82, 85, 84, 87, 88],
    skillRadar: {
      labels: ['Logic', 'Fluency', 'Evidence', 'Rebuttal', 'Poise', 'Pacing'],
      scores: [94, 85, 90, 88, 92, 84]
    },
    badges: [
      { id: 'b1', title: 'Fallacy Hunter', icon: 'shield-alert', description: 'Detected 50+ logical fallacies in live practice.' },
      { id: 'b2', title: 'Silver Tongue', icon: 'mic', description: 'Maintained 90+ fluency score for 7 consecutive days.' },
      { id: 'b3', title: 'Grandmaster Orator', icon: 'award', description: 'Completed 30 comprehensive AI debate coaching modules.' },
      { id: 'b4', title: 'Unstoppable Logic', icon: 'zap', description: 'Zero logical fallacies committed in 5 consecutive speeches.' }
    ],
    history: [
      {
        id: 'deb-101',
        topic: 'Universal Basic Income as a Response to AI Automation',
        side: 'Affirmative',
        date: '2026-07-28',
        score: 91,
        duration: '4m 12s',
        fallaciesCount: 1,
        status: 'Evaluated'
      },
      {
        id: 'deb-102',
        topic: 'Regulation of Autonomous Generative Weapons Systems',
        side: 'Negative',
        date: '2026-07-25',
        score: 86,
        duration: '5m 45s',
        fallaciesCount: 2,
        status: 'Evaluated'
      },
      {
        id: 'deb-103',
        topic: 'Mandatory Space Exploration Investment vs. Climate Remediation',
        side: 'Affirmative',
        date: '2026-07-20',
        score: 89,
        duration: '3m 50s',
        fallaciesCount: 0,
        status: 'Evaluated'
      }
    ]
  },

  // Debate Coach Review Submissions Roster
  coachData: {
    pendingReviews: [
      {
        id: 'rev-201',
        studentName: 'Marcus Vance',
        studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        topic: 'Ethics of Human Gene Editing in Embryos',
        submittedAt: '2026-07-30 14:30',
        duration: '4m 18s',
        status: 'Needs Review',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        transcript: 'Ladies and gentlemen of the panel, gene editing is not just a medical breakthrough; it is a moral imperative. If we have the technology to eliminate hereditary disorders like Huntington\'s disease or sickle cell anemia before a child is born, withholding that treatment is actively allowing preventable suffering. My opponents argue that gene editing will lead to designer babies for the ultra-wealthy. But that is a classic strawman argument. We are proposing strict FDA oversight and public healthcare subsidies, not an unregulated free market.'
      },
      {
        id: 'rev-202',
        studentName: 'Sophia Patel',
        studentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
        topic: 'Implementation of Carbon Tax on International Shipping',
        submittedAt: '2026-07-30 09:15',
        duration: '3m 50s',
        status: 'In Progress',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        transcript: 'International maritime transport accounts for over nearly three percent of global greenhouse gas emissions. Without a standardized carbon levy, vessel operators will continue using heavy fuel oil with impunity. Furthermore, revenue generated from this tax can fund green ammonia propulsion R&D for developing nation fleets.'
      }
    ],
    completedCount: 142,
    todayReviewsCount: 8,
    avgRatingGiven: 4.85
  },

  // Educator Class Rosters & Assignments
  educatorData: {
    totalStudents: 128,
    avgPerformance: 84.6,
    completionRate: 94.2,
    improvementRate: 18.5,
    classes: [
      { id: 'c1', name: 'AP Oratory & Forensics - Period 3', studentCount: 32, avgScore: 89 },
      { id: 'c2', name: 'Varsity Policy Debate Team', studentCount: 18, avgScore: 94 },
      { id: 'c3', name: 'Introduction to Rhetoric & Logic', studentCount: 42, avgScore: 78 }
    ],
    assignments: [
      {
        id: 'asg-1',
        title: 'Rebuttal Speech: Artificial Intelligence in Healthcare',
        deadline: '2026-08-05',
        difficulty: 'Advanced',
        submissions: 28,
        totalAssigned: 32
      },
      {
        id: 'asg-2',
        title: 'Constructive Argument: Renewable Energy Subsidies',
        deadline: '2026-08-10',
        difficulty: 'Intermediate',
        submissions: 14,
        totalAssigned: 42
      }
    ]
  },

  // Admin User & System Monitoring
  adminData: {
    systemHealth: '99.98%',
    totalUsers: 14250,
    activeToday: 3890,
    aiRequestsPerMin: 412,
    storageUsage: '1.42 TB / 5 TB',
    users: [
      { id: 'u-1', name: 'Alexandra Chen', email: 'alex.chen@stanford.edu', role: 'Learner', status: 'Active', joined: '2026-01-15' },
      { id: 'u-2', name: 'Dr. Robert Thorne', email: 'rthorne@harvard.edu', role: 'Debate Coach', status: 'Active', joined: '2025-11-04' },
      { id: 'u-3', name: 'Elena Rostova', email: 'elena@oxford.ac.uk', role: 'Educator', status: 'Active', joined: '2026-02-20' },
      { id: 'u-4', name: 'Marcus Vance', email: 'mvance@mit.edu', role: 'Learner', status: 'Active', joined: '2026-03-10' },
      { id: 'u-5', name: 'System SuperAdmin', email: 'admin@aidebatecoach.com', role: 'Admin', status: 'Active', joined: '2025-08-01' }
    ]
  }
};
