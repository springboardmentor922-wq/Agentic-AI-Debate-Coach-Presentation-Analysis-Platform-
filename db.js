/* ==========================================================================
   AI DEBATE COACH - PERSISTENT MULTI-USER DATABASE ENGINE (db.js)
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'AI_DEBATE_COACH_DB_V3';

  const defaultSeedData = {
    users: [
      {
        id: 'u-learner-1',
        name: 'Alexandra Chen',
        email: 'alex.chen@stanford.edu',
        password: 'password123',
        role: 'learner',
        status: 'Active',
        institution: 'Stanford Debate Union',
        title: 'Advanced Varsity Debater',
        batch: '2024-25',
        department: 'Political Science',
        studentId: 'STU-2024-001',
        createdAt: '2026-01-15 10:00',
        lastActive: '2026-08-02 18:30',
        level: 'Advanced',
        metrics: { overall: 88, confidence: 92, fluency: 85, argumentStrength: 90, communication: 86, persuasiveness: 89, criticalThinking: 94, delivery: 84 },
        streakDays: 14,
        rank: 4,
        badges: ['top_performer', 'excellent_speaker', 'consistency']
      },
      {
        id: 'u-learner-2',
        name: 'Marcus Vance',
        email: 'mvance@mit.edu',
        password: 'password123',
        role: 'learner',
        status: 'Active',
        institution: 'MIT Rhetoric Club',
        title: 'Novice Debater',
        batch: '2025-26',
        department: 'Computer Science',
        studentId: 'STU-2025-018',
        createdAt: '2026-03-10 14:20',
        lastActive: '2026-08-01 11:15',
        level: 'Intermediate',
        metrics: { overall: 76, confidence: 78, fluency: 74, argumentStrength: 80, communication: 75, persuasiveness: 72, criticalThinking: 82, delivery: 73 },
        streakDays: 5,
        rank: 18,
        badges: ['most_improved']
      },
      {
        id: 'u-educator-1',
        name: 'Elena Rostova',
        email: 'elena@oxford.ac.uk',
        password: 'password123',
        role: 'educator',
        status: 'Active',
        institution: 'Oxford University',
        createdAt: '2026-02-20 09:15'
      },
      {
        id: 'u-coach-1',
        name: 'Dr. Robert Thorne',
        email: 'rthorne@harvard.edu',
        password: 'password123',
        role: 'coach',
        status: 'Active',
        institution: 'Harvard Debate Association',
        createdAt: '2025-11-04 11:30',
        assignedLearners: ['u-learner-1', 'u-learner-2']
      },
      {
        id: 'u-admin-1',
        name: 'System SuperAdmin',
        email: 'admin@aidebatecoach.com',
        password: 'adminpassword123',
        role: 'admin',
        status: 'Active',
        institution: 'AI Debate Coach Platform',
        createdAt: '2025-08-01 08:00'
      }
    ],

    topics: [
      { id: 'top-1', topic: 'Universal Basic Income is necessary to offset technological unemployment.', category: 'Economics & AI', difficulty: 'Intermediate', description: 'Debate on whether state disbursements are essential in an automated workforce economy.', status: 'Active', createdBy: 'Dr. Robert Thorne', createdDate: '2026-01-10' },
      { id: 'top-2', topic: 'Governments should regulate frontier Generative AI models as public utilities.', category: 'Technology & Governance', difficulty: 'Advanced', description: 'Policy debate focusing on safety, licensing, compute thresholds, and state monopolies.', status: 'Active', createdBy: 'Elena Rostova', createdDate: '2026-01-18' },
      { id: 'top-3', topic: 'Carbon tariffs are superior to internal cap-and-trade carbon markets.', category: 'Environment & Trade', difficulty: 'Advanced', description: 'Comparing cross-border carbon adjustment mechanisms (CBAM) with cap-and-trade incentives.', status: 'Active', createdBy: 'Elena Rostova', createdDate: '2026-02-05' },
      { id: 'top-4', topic: 'Developing nations should prioritize digital infrastructure over heavy industry.', category: 'Global Development', difficulty: 'Beginner', description: 'Examining leapfrogging strategies into tech services versus traditional industrialization.', status: 'Active', createdBy: 'System SuperAdmin', createdDate: '2026-02-14' }
    ],

    assignments: [
      { id: 'asg-101', title: 'Rebuttal Speech: Artificial Intelligence in Healthcare', topicId: 'top-2', topic: 'Governments should regulate frontier Generative AI models as public utilities.', debateType: 'Lincoln-Douglas', duration: '4m 00s', dueDate: '2026-08-10', instructions: 'Deliver a 4-minute affirmative constructive argument citing peer-reviewed safety studies.', learnerIds: ['u-learner-1', 'u-learner-2'], status: 'Assigned', assignedBy: 'Elena Rostova', createdAt: '2026-07-28 10:30' },
      { id: 'asg-102', title: 'Constructive Speech: Universal Basic Income Policy', topicId: 'top-1', topic: 'Universal Basic Income is necessary to offset technological unemployment.', debateType: 'Public Forum', duration: '5m 00s', dueDate: '2026-08-05', instructions: 'Focus on eliminating Strawman fallacies when answering economic opposition.', learnerIds: ['u-learner-1'], status: 'Submitted', assignedBy: 'Elena Rostova', createdAt: '2026-07-25 14:15', submittedAt: '2026-07-29 16:20', submissionText: 'Mr. Chairman and esteemed judges, UBI provides an indispensable economic cushion against automation...', score: null, coachNotes: null }
    ],

    practiceHistory: [
      { id: 'prac-301', userId: 'u-learner-1', topic: 'Universal Basic Income as a Response to AI Automation', debateType: 'Lincoln-Douglas', date: '2026-07-28 15:40', duration: '4m 12s', durationSeconds: 252, score: 91, wpm: 138, metrics: { confidence: 92, fluency: 85, grammar: 94, relevance: 90, overall: 91 }, fallaciesFound: [{ name: 'Strawman Fallacy', severity: 'high', quote: 'My opponent claims UBI causes everyone to quit working...' }], aiFeedback: 'Excellent vocal poise. Consider refining your second premise to avoid over-exaggerating opponent positions.', transcript: 'Ladies and gentlemen, universal basic income is not a radical experiment; it is an essential safety net.' },
      { id: 'prac-302', userId: 'u-learner-2', topic: 'Ethics of Human Gene Editing in Embryos', debateType: 'Public Forum', date: '2026-07-29 11:10', duration: '3m 45s', durationSeconds: 225, score: 79, wpm: 122, metrics: { confidence: 78, fluency: 74, grammar: 82, relevance: 81, overall: 79 }, fallaciesFound: [{ name: 'Ad Hominem', severity: 'medium', quote: 'We should not trust Dr. Smith because he changed jobs.' }], aiFeedback: 'Focus on statistical evidence rather than questioning researchers\' backgrounds.', transcript: 'Gene editing has great potential but we must be cautious of unethical applications.' },
      { id: 'prac-303', userId: 'u-learner-1', topic: 'AI Regulation in the Public Interest', debateType: 'Parliamentary', date: '2026-07-30 09:20', duration: '3m 50s', durationSeconds: 230, score: 87, wpm: 141, metrics: { confidence: 88, fluency: 86, grammar: 89, relevance: 85, overall: 87 }, fallaciesFound: [], aiFeedback: 'Strong opening. Improve conclusion to reinforce impact.', transcript: 'AI regulation is not optional — it is a public duty.' }
    ],

    feedbacks: [
      { id: 'fb-1', learnerId: 'u-learner-1', learnerName: 'Alexandra Chen', learnerEmail: 'alex.chen@stanford.edu', rating: 5, message: 'The AI fallacy detection feature caught two strawman arguments I didn\'t realize I was making!', date: '2026-07-29 16:45' },
      { id: 'fb-2', learnerId: 'u-learner-2', learnerName: 'Marcus Vance', learnerEmail: 'mvance@mit.edu', rating: 4, message: 'The live practice studio voice analyzer helped me reduce my filler words significantly.', date: '2026-07-30 09:12' }
    ],

    coachEvaluations: [
      {
        id: 'ceval-seed-1',
        assignmentId: 'asg-102',
        learnerId: 'u-learner-1',
        coachId: 'u-coach-1',
        coachName: 'Dr. Robert Thorne',
        topic: 'Universal Basic Income is necessary to offset technological unemployment.',
        debateType: 'Public Forum',
        submittedAt: '2026-07-29 16:20',
        evaluatedAt: '2026-07-31 10:00',
        publishedAt: '2026-07-31 10:05',
        status: 'Published',
        overallRating: 9,
        rubric: { confidence: 92, fluency: 88, grammar: 90, vocabulary: 87, pronunciation: 85, delivery: 89, logic: 93, persuasiveness: 88, communicationClarity: 91, criticalThinking: 94 },
        strengths: 'Excellent argument structure and use of empirical evidence. Strong opening hook.',
        areasToImprove: 'Conclusion needs more impact. Could reduce filler word usage.',
        communicationSkills: 'Clear articulation. Good pace at 138 WPM.',
        bodyLanguage: 'N/A — voice recording only.',
        suggestions: 'Practice rebuttals against AI adoption arguments. Study Alaska Permanent Fund data.',
        finalRemarks: 'Alexandra demonstrates varsity-level debating. Ready for regional competition.',
        tags: ['outstanding'],
        position: 'Affirmative',
        duration: '5m 00s',
        transcript: 'Mr. Chairman and esteemed judges, UBI provides an indispensable economic cushion against automation...'
      }
    ],

    notifications: [
      {
        id: 'notif-seed-1',
        userId: 'u-learner-1',
        type: 'coach_feedback',
        title: 'Coach Feedback Published',
        message: 'Dr. Robert Thorne has published feedback on your "Universal Basic Income Policy" debate.',
        link: 'feedback',
        read: false,
        createdAt: '2026-07-31 10:05',
        coachEvalId: 'ceval-seed-1'
      }
    ],

    activityLog: [
      { id: 'act-1', userId: 'u-learner-1', type: 'practice_completed', description: 'Completed practice: Universal Basic Income as a Response to AI Automation', date: '2026-07-28 15:40' },
      { id: 'act-2', userId: 'u-learner-1', type: 'assignment_submitted', description: 'Submitted assignment: Constructive Speech: Universal Basic Income Policy', date: '2026-07-29 16:20' },
      { id: 'act-3', userId: 'u-learner-1', type: 'coach_feedback_received', description: 'Coach feedback published by Dr. Robert Thorne', date: '2026-07-31 10:05' },
      { id: 'act-4', userId: 'u-learner-2', type: 'practice_completed', description: 'Completed practice: Ethics of Human Gene Editing in Embryos', date: '2026-07-29 11:10' }
    ],

    chatHistories: {}
  };

  class DatabaseEngine {
    constructor() {
      this.data = this.loadData();
      this._ensureCollections();
    }

    loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { console.error('DB load error:', e); }
      this.saveData(defaultSeedData);
      return JSON.parse(JSON.stringify(defaultSeedData));
    }

    _ensureCollections() {
      let changed = false;
      if (!this.data.coachEvaluations) { this.data.coachEvaluations = defaultSeedData.coachEvaluations; changed = true; }
      if (!this.data.notifications)    { this.data.notifications    = defaultSeedData.notifications;    changed = true; }
      if (!this.data.activityLog)      { this.data.activityLog      = defaultSeedData.activityLog;      changed = true; }
      this.data.users = this.data.users.map(u => ({
        batch: '2024-25', department: 'General', studentId: `STU-${u.id}`,
        level: 'Intermediate', lastActive: u.createdAt, badges: [], assignedLearners: [],
        ...u
      }));
      if (changed) this.saveData();
    }

    saveData(dataObj) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dataObj || this.data)); }
      catch (e) { console.error('DB save error:', e); }
    }

    /* ── USERS ──────────────────────────────────────────── */
    getUsers()            { return this.data.users || []; }
    getUserById(id)       { return this.getUsers().find(u => u.id === id); }
    getUserByEmail(email) { return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }

    addUser(userObj) {
      if (this.getUserByEmail(userObj.email)) throw new Error('User with this email already exists.');
      const newUser = {
        id: `u-${Date.now()}`, createdAt: new Date().toISOString().replace('T',' ').substring(0,16),
        status: 'Active', lastActive: new Date().toISOString().replace('T',' ').substring(0,16),
        metrics: { overall:75,confidence:75,fluency:75,argumentStrength:75,communication:75,persuasiveness:75,criticalThinking:75,delivery:75 },
        streakDays:1, rank: this.getUsers().length+1, badges:[],
        batch:'2025-26', department:'General', studentId:`STU-${Date.now()}`,
        level:'Beginner', assignedLearners:[],
        ...userObj
      };
      this.data.users.push(newUser); this.saveData(); return newUser;
    }

    updateUser(id, updates) {
      const idx = this.data.users.findIndex(u => u.id === id);
      if (idx !== -1) { this.data.users[idx] = { ...this.data.users[idx], ...updates }; this.saveData(); return this.data.users[idx]; }
      return null;
    }

    /* ── TOPICS ─────────────────────────────────────────── */
    getTopics() { return this.data.topics || []; }
    addTopic(obj) {
      const t = { id:`top-${Date.now()}`, createdDate:new Date().toISOString().substring(0,10), status:'Active', ...obj };
      this.data.topics.unshift(t); this.saveData(); return t;
    }
    updateTopic(id, updates) {
      const idx = this.data.topics.findIndex(t => t.id === id);
      if (idx !== -1) { this.data.topics[idx]={...this.data.topics[idx],...updates}; this.saveData(); return this.data.topics[idx]; }
      return null;
    }
    deleteTopic(id) { this.data.topics=this.data.topics.filter(t=>t.id!==id); this.saveData(); }

    /* ── ASSIGNMENTS ────────────────────────────────────── */
    getAssignments() { return this.data.assignments || []; }
    getAssignmentsForLearner(learnerId) { return this.getAssignments().filter(a=>a.learnerIds&&a.learnerIds.includes(learnerId)); }
    addAssignment(obj) {
      const a={id:`asg-${Date.now()}`,createdAt:new Date().toISOString().replace('T',' ').substring(0,16),status:'Assigned',...obj};
      this.data.assignments.unshift(a); this.saveData(); return a;
    }
    updateAssignmentStatus(id,newStatus,extraData={}) {
      const idx=this.data.assignments.findIndex(a=>a.id===id);
      if(idx!==-1){this.data.assignments[idx]={...this.data.assignments[idx],status:newStatus,...extraData};this.saveData();return this.data.assignments[idx];}
      return null;
    }

    /* ── PRACTICE HISTORY ───────────────────────────────── */
    getPracticeHistory(userId) {
      const all=this.data.practiceHistory||[];
      return userId?all.filter(h=>h.userId===userId):all;
    }
    addPracticeSession(obj) {
      const s={id:`prac-${Date.now()}`,date:new Date().toISOString().replace('T',' ').substring(0,16),...obj};
      this.data.practiceHistory.unshift(s); this.saveData();
      this.addActivity(obj.userId,'practice_completed',`Completed practice: ${obj.topic||'Debate'}`);
      return s;
    }

    /* ── FEEDBACKS ──────────────────────────────────────── */
    getFeedbacks() { return this.data.feedbacks||[]; }
    getFeedbacksForLearner(learnerId) { return this.getFeedbacks().filter(f=>f.learnerId===learnerId); }
    addFeedback(obj) {
      const f={id:`fb-${Date.now()}`,date:new Date().toISOString().replace('T',' ').substring(0,16),...obj};
      this.data.feedbacks.unshift(f); this.saveData(); return f;
    }

    /* ── COACH EVALUATIONS ─────────────────────────────── */
    getCoachEvaluations()              { return this.data.coachEvaluations||[]; }
    getCoachEvalById(id)               { return this.getCoachEvaluations().find(e=>e.id===id); }
    getCoachEvalsForLearner(learnerId) { return this.getCoachEvaluations().filter(e=>e.learnerId===learnerId); }
    getCoachEvalsForCoach(coachId)     { return this.getCoachEvaluations().filter(e=>e.coachId===coachId); }
    getPublishedEvalsForLearner(learnerId) { return this.getCoachEvalsForLearner(learnerId).filter(e=>e.status==='Published'); }

    addCoachEvaluation(obj) {
      const now=new Date().toISOString().replace('T',' ').substring(0,16);
      const e={id:`ceval-${Date.now()}`,evaluatedAt:now,status:'Draft',...obj};
      if(!this.data.coachEvaluations) this.data.coachEvaluations=[];
      this.data.coachEvaluations.unshift(e); this.saveData(); return e;
    }

    updateCoachEvaluation(id,updates) {
      const idx=(this.data.coachEvaluations||[]).findIndex(e=>e.id===id);
      if(idx!==-1){this.data.coachEvaluations[idx]={...this.data.coachEvaluations[idx],...updates};this.saveData();return this.data.coachEvaluations[idx];}
      return null;
    }

    publishCoachEvaluation(id) {
      const now=new Date().toISOString().replace('T',' ').substring(0,16);
      const updated=this.updateCoachEvaluation(id,{status:'Published',publishedAt:now});
      if(updated){
        if(updated.assignmentId) this.updateAssignmentStatus(updated.assignmentId,'Evaluated',{score:updated.overallRating*10,coachNotes:updated.finalRemarks,evaluatedAt:now});
        this.addNotification({userId:updated.learnerId,type:'coach_feedback',title:'Coach Feedback Published',message:`${updated.coachName} has published feedback on your "${updated.topic}" debate.`,link:'coach-feedback',coachEvalId:id});
        this.addActivity(updated.learnerId,'coach_feedback_received',`Coach feedback published by ${updated.coachName}`);
      }
      return updated;
    }

    deleteCoachEvaluation(id) { this.data.coachEvaluations=(this.data.coachEvaluations||[]).filter(e=>e.id!==id); this.saveData(); }

    /* ── NOTIFICATIONS ──────────────────────────────────── */
    getNotifications()              { return this.data.notifications||[]; }
    getNotificationsForUser(userId) { return this.getNotifications().filter(n=>n.userId===userId); }
    getUnreadNotifications(userId)  { return this.getNotificationsForUser(userId).filter(n=>!n.read); }

    addNotification(obj) {
      const n={id:`notif-${Date.now()}`,createdAt:new Date().toISOString().replace('T',' ').substring(0,16),read:false,...obj};
      if(!this.data.notifications) this.data.notifications=[];
      this.data.notifications.unshift(n); this.saveData();
      window.dispatchEvent(new CustomEvent('aidebate:notification',{detail:n}));
      return n;
    }
    markNotificationRead(id) {
      const idx=(this.data.notifications||[]).findIndex(n=>n.id===id);
      if(idx!==-1){this.data.notifications[idx].read=true;this.saveData();}
    }
    markAllNotificationsRead(userId) {
      (this.data.notifications||[]).forEach(n=>{if(n.userId===userId)n.read=true;}); this.saveData();
    }

    /* ── ACTIVITY LOG ───────────────────────────────────── */
    getActivityLog()           { return this.data.activityLog||[]; }
    getActivityForUser(userId) { return this.getActivityLog().filter(a=>a.userId===userId); }
    addActivity(userId,type,description) {
      const a={id:`act-${Date.now()}`,userId,type,description,date:new Date().toISOString().replace('T',' ').substring(0,16)};
      if(!this.data.activityLog) this.data.activityLog=[];
      this.data.activityLog.unshift(a);
      if(this.data.activityLog.length>500) this.data.activityLog=this.data.activityLog.slice(0,500);
      this.saveData(); return a;
    }

    /* ── LEARNER ANALYTICS ──────────────────────────────── */
    getLearnerAnalytics(learnerId) {
      const history=this.getPracticeHistory(learnerId);
      const coachEvs=this.getCoachEvalsForLearner(learnerId);
      const asgs=this.getAssignmentsForLearner(learnerId);
      const notifs=this.getNotificationsForUser(learnerId);
      const acts=this.getActivityForUser(learnerId);
      const scores=history.map(h=>h.score||0);
      const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
      const best=scores.length?Math.max(...scores):0;
      const worst=scores.length?Math.min(...scores):0;
      const metricAvg=key=>{const v=history.map(h=>h.metrics?.[key]||0).filter(x=>x>0);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0;};
      const wpms=history.map(h=>h.wpm||0).filter(v=>v>0);
      const avgWPM=wpms.length?Math.round(wpms.reduce((a,b)=>a+b,0)/wpms.length):0;
      const allFillers=history.flatMap(h=>h.fillerWords||[]);
      const fillerFreq={};
      allFillers.forEach(f=>fillerFreq[f]=(fillerFreq[f]||0)+1);
      const topFillers=Object.entries(fillerFreq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w,c])=>`${w} (${c}×)`);
      const durations=history.map(h=>h.durationSeconds||0).filter(v=>v>0);
      const totalTime=durations.reduce((a,b)=>a+b,0);
      const topicScores={};
      history.forEach(h=>{if(h.topic){if(!topicScores[h.topic])topicScores[h.topic]=[];topicScores[h.topic].push(h.score||0);}});
      const topicAvgs=Object.entries(topicScores).map(([t,s])=>({topic:t,avg:Math.round(s.reduce((a,b)=>a+b,0)/s.length)}));
      const sorted=[...topicAvgs].sort((a,b)=>b.avg-a.avg);
      return {
        totalDebates:history.length,completedDebates:history.length,
        pendingDebates:asgs.filter(a=>a.status==='Assigned'||a.status==='Started').length,
        practiceSessions:history.length,
        avgScore:avg,bestScore:best,worstScore:worst,
        avgFluency:metricAvg('fluency'),avgConfidence:metricAvg('confidence'),
        avgGrammar:metricAvg('grammar'),avgVocabulary:metricAvg('relevance'),
        avgPronunciation:metricAvg('relevance'),avgLogic:metricAvg('grammar'),
        avgDelivery:metricAvg('confidence'),avgPersuasiveness:metricAvg('overall'),avgOverallScore:avg,
        avgWPM,topFillerWords:topFillers,totalTimeMin:Math.round(totalTime/60),
        longestSpeech:durations.length?`${Math.floor(Math.max(...durations)/60)}m ${Math.max(...durations)%60}s`:'N/A',
        shortestSpeech:durations.length?`${Math.floor(Math.min(...durations)/60)}m ${Math.min(...durations)%60}s`:'N/A',
        bestDebateTopic:sorted[0]?.topic||'N/A',worstDebateTopic:sorted[sorted.length-1]?.topic||'N/A',
        coachEvaluationsCount:coachEvs.length,publishedFeedbackCount:coachEvs.filter(e=>e.status==='Published').length,
        unreadNotifications:notifs.filter(n=>!n.read).length,
        recentActivity:acts.slice(0,10),
        scoreTrend:history.slice(0,8).reverse().map(h=>({date:h.date?.substring(0,10),score:h.score||0}))
      };
    }

    /* ── CHAT HISTORY ───────────────────────────────────── */
    getChatHistory(userId) { return (this.data.chatHistories&&this.data.chatHistories[userId])||[]; }
    addChatMessage(userId,msgObj) {
      if(!this.data.chatHistories) this.data.chatHistories={};
      if(!this.data.chatHistories[userId]) this.data.chatHistories[userId]=[];
      this.data.chatHistories[userId].push(msgObj); this.saveData();
    }
  }

  window.AIDebateDB = new DatabaseEngine();

  // Mock Authenticated Backend API Interceptor (REST simulation)
  const originalFetch = window.fetch;
  window.fetch = async function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url.url;
    
    if (urlStr.startsWith('/coach/') || urlStr.startsWith('/learner/')) {
      const user = window.AIDebateAuth?.currentUser;
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      
      const role = user.role;
      try {
        if (urlStr === '/coach/learners' && options.method === 'GET') {
          if (role !== 'coach' && role !== 'admin') throw new Error('Forbidden');
          const learners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
          return new Response(JSON.stringify(learners), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.startsWith('/coach/learner/') && options.method === 'GET') {
          if (role !== 'coach' && role !== 'admin') throw new Error('Forbidden');
          const id = urlStr.split('/').pop();
          const learner = window.AIDebateDB.getUserById(id);
          if (!learner) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
          return new Response(JSON.stringify(learner), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr === '/coach/evaluations' && options.method === 'GET') {
          if (role !== 'coach' && role !== 'admin') throw new Error('Forbidden');
          const evals = window.AIDebateDB.getCoachEvaluations();
          return new Response(JSON.stringify(evals), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.startsWith('/coach/evaluation/') && options.method === 'GET') {
          if (role !== 'coach' && role !== 'admin') throw new Error('Forbidden');
          const id = urlStr.split('/').pop();
          const ev = window.AIDebateDB.getCoachEvalById(id);
          if (!ev) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
          return new Response(JSON.stringify(ev), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr === '/coach/feedback' && options.method === 'POST') {
          if (role !== 'coach') throw new Error('Forbidden');
          const body = JSON.parse(options.body || '{}');
          const ev = window.AIDebateDB.addCoachEvaluation(body);
          return new Response(JSON.stringify(ev), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr.startsWith('/coach/feedback/') && options.method === 'PUT') {
          if (role !== 'coach') throw new Error('Forbidden');
          const id = urlStr.split('/').pop();
          const body = JSON.parse(options.body || '{}');
          const ev = window.AIDebateDB.updateCoachEvaluation(id, body);
          if (body.status === 'Published') {
            window.AIDebateDB.publishCoachEvaluation(id);
          }
          return new Response(JSON.stringify(ev), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr === '/learner/feedback' && options.method === 'GET') {
          if (role !== 'learner') throw new Error('Forbidden');
          const feed = window.AIDebateDB.getPublishedEvalsForLearner(user.id);
          return new Response(JSON.stringify(feed), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr === '/learner/performance' && options.method === 'GET') {
          if (role !== 'learner') throw new Error('Forbidden');
          const perf = window.AIDebateDB.getLearnerAnalytics(user.id);
          return new Response(JSON.stringify(perf), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (urlStr === '/learner/notifications' && options.method === 'GET') {
          if (role !== 'learner') throw new Error('Forbidden');
          const notifs = window.AIDebateDB.getNotificationsForUser(user.id);
          return new Response(JSON.stringify(notifs), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      } catch (err) {
        if (err.message === 'Forbidden') {
          return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    return originalFetch.apply(this, arguments);
  };
})();
