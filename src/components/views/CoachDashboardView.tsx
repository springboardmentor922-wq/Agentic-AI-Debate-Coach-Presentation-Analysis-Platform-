import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  AlertCircle, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  FileText, 
  Brain, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Check, 
  HelpCircle,
  FileCheck,
  Zap,
  Target
} from 'lucide-react';
import { MOCK_COACH_DATA } from '../../data/mockData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CoachDashboardViewProps {
  activeUser?: UserProfile;
  activeSubTab?: string;
  existingUsers?: UserProfile[];
}

interface TurnLogDetail {
  id: string;
  learner: string;
  topic: string;
  date: string;
  score: number;
  grade: string;
  turns: Array<{
    turnNumber: number;
    speaker: string;
    role: 'learner' | 'opponent';
    phase: string;
    text: string;
    wpm?: number;
    clarityScore?: number;
    fallaciesDetected?: Array<{ type: string; quote: string; severity: 'High' | 'Medium' | 'Low'; fix: string }>;
    aiJudgeComment?: string;
  }>;
  coachFeedback?: string;
}

export const CoachDashboardView: React.FC<CoachDashboardViewProps> = ({ 
  activeUser, 
  activeSubTab = 'dashboard',
  existingUsers = []
}) => {
  const { isDark } = useTheme();
  const coachName = activeUser?.name || 'ram';
  const customLearners = existingUsers.filter(u => u.role === 'learner' && u.id !== 'usr_alex');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [plans, setPlans] = useState<Array<{ id: string; title: string; learner: string; target: string; progress: number }>>([]);
  
  // Turn Log Modal state
  const [selectedTurnLog, setSelectedTurnLog] = useState<TurnLogDetail | null>(null);
  const [coachNoteInput, setCoachNoteInput] = useState('');
  const [savedFeedbackSuccess, setSavedFeedbackSuccess] = useState(false);

  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderDivider = isDark ? 'border-slate-800' : 'border-slate-200';

  // Helper to open turn log for any learner item
  const openTurnLogModal = (learnerName: string, topicName: string) => {
    setSelectedTurnLog({
      id: `tl_${Date.now()}`,
      learner: learnerName,
      topic: topicName,
      date: 'Aug 9, 2026',
      score: 78,
      grade: 'B+',
      turns: [
        {
          turnNumber: 1,
          speaker: `${learnerName} (Debater)`,
          role: 'learner',
          phase: 'Opening Constructive Statement (Affirmative)',
          text: `Honorable judges and fellow debaters, today we affirm that ${topicName}. Our primary argument centers on fundamental societal efficiency and economic innovation. Furthermore, prohibiting or mandating this framework ensures equal access across all demographic tiers. Studies demonstrate a 34% increase in systemic performance when structured guidelines are maintained.`,
          wpm: 142,
          clarityScore: 88,
          fallaciesDetected: [],
          aiJudgeComment: 'Strong rhetorical hook with clear thesis statement. Good signposting.'
        },
        {
          turnNumber: 2,
          speaker: 'AI Opponent (DebateBot - Negation)',
          role: 'opponent',
          phase: 'Rebuttal & Cross-Examination',
          text: 'While the Affirmative highlights efficiency gains, they fail to account for implementation friction and budget constraints. How do you address the immediate capital outlay required for enforcement, and wouldn\'t this burden smaller municipalities unfairly?',
          aiJudgeComment: 'Direct counter-question targeting fiscal feasibility.'
        },
        {
          turnNumber: 3,
          speaker: `${learnerName} (Debater)`,
          role: 'learner',
          phase: 'Rebuttal & Defense Turn',
          text: 'Everyone knows that anyone opposing this policy simply does not care about long-term public welfare! Municipalities will adapt because technology always lowers administrative costs over time.',
          wpm: 165,
          clarityScore: 71,
          fallaciesDetected: [
            {
              type: 'Ad Hominem & Strawman',
              quote: 'Everyone knows that anyone opposing this policy simply does not care about public welfare',
              severity: 'High',
              fix: 'Address the opponent\'s economic budget argument directly rather than attacking their motives.'
            }
          ],
          aiJudgeComment: 'Warning: Deflected economic question with a emotional generalization fallacy.'
        },
        {
          turnNumber: 4,
          speaker: `${learnerName} (Debater)`,
          role: 'learner',
          phase: 'Final Whip & Closing Summary',
          text: 'In conclusion, the Affirmative framework stands firm. We proved that short-term costs are vastly outweighed by decade-long innovation benefits. We urge a strong vote in favor.',
          wpm: 138,
          clarityScore: 92,
          fallaciesDetected: [],
          aiJudgeComment: 'Polished impact weighing in closing seconds.'
        }
      ],
      coachFeedback: ''
    });
    setCoachNoteInput('');
    setSavedFeedbackSuccess(false);
  };

  // Render Turn Log Explanatory Modal
  const renderTurnLogModal = () => {
    if (!selectedTurnLog) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
        <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-700/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  TURN LOG AUDIT
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedTurnLog.date}</span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight mt-1">
                {selectedTurnLog.learner} — <span className="text-purple-400 font-semibold">{selectedTurnLog.topic}</span>
              </h3>
            </div>
            <button 
              onClick={() => setSelectedTurnLog(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation Callout: "What is a Turn Log and how does it work?" */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-1">
                  What is a Debate Turn Log?
                </h4>
                <p className="leading-relaxed opacity-90">
                  A <strong>Turn Log</strong> is the step-by-step transcript recorded during a practice debate round between the debater and the AI coach/opponent. It captures every speech turn, delivery pace (WPM), speech clarity score, detected logical fallacies, and AI judge commentary. As a coach, you can inspect exact quotes and attach targeted notes to guide your mentee.
                </p>
              </div>
            </div>
          </div>

          {/* Turn Log Transcripts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-purple-400" /> Speech Turn Transcripts & AI Telemetry
            </h4>

            {selectedTurnLog.turns.map((turn) => (
              <div 
                key={turn.turnNumber}
                className={`p-4 rounded-2xl border space-y-3 ${
                  turn.role === 'learner' 
                    ? isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                    : isDark ? 'bg-purple-950/20 border-purple-800/40' : 'bg-purple-50/60 border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      #{turn.turnNumber}
                    </span>
                    <span className={`font-bold text-xs ${turn.role === 'learner' ? 'text-indigo-400' : 'text-purple-400'}`}>
                      {turn.speaker}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-medium">
                      {turn.phase}
                    </span>
                  </div>

                  {turn.role === 'learner' && (
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      {turn.wpm && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> {turn.wpm} WPM
                        </span>
                      )}
                      {turn.clarityScore && (
                        <span className="text-emerald-400 font-bold">
                          Clarity: {turn.clarityScore}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Speech Text */}
                <p className="text-xs leading-relaxed italic opacity-95 pl-8 border-l-2 border-purple-500/40">
                  "{turn.text}"
                </p>

                {/* Fallacy Warning if detected in turn */}
                {turn.fallaciesDetected && turn.fallaciesDetected.length > 0 && (
                  <div className="ml-8 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" /> Detected Fallacy: {turn.fallaciesDetected[0].type}
                    </div>
                    <p className="text-[11px]">Quote: "{turn.fallaciesDetected[0].quote}"</p>
                    <p className="text-[11px] text-amber-300 font-medium">💡 Recommendation: {turn.fallaciesDetected[0].fix}</p>
                  </div>
                )}

                {/* AI Judge Notes */}
                {turn.aiJudgeComment && (
                  <p className="ml-8 text-[11px] text-slate-400 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> AI Judge Audit: {turn.aiJudgeComment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Coach Note / Feedback Box */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Attach Coach Note to Learner Report
            </h4>
            <textarea
              rows={3}
              value={coachNoteInput}
              onChange={(e) => setCoachNoteInput(e.target.value)}
              placeholder="Type specific feedback for your mentee regarding this turn log (e.g. 'Great opening hook, but watch out for emotional generalizations during cross-ex')..."
              className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <div className="flex items-center justify-between">
              {savedFeedbackSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Coach feedback attached to {selectedTurnLog.learner}'s report!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Feedback will appear in mentee's evaluation report.</span>
              )}
              <button 
                onClick={() => {
                  if (coachNoteInput.trim()) {
                    setSavedFeedbackSuccess(true);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Save Coach Note
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 1: Presentation Reviews ---
  if (activeSubTab === 'presentation-reviews') {
    const defaultReviews = [
      { id: '1', learner: 'Alex Chen', topic: 'Should physical education be mandatory throughout high school?', clarity: '65%', confidence: '88%', pace: '145 WPM (Optimal)', fillers: 0 },
      { id: '2', learner: 'Alex Chen', topic: 'Homework should be banned in schools', clarity: '88%', confidence: '92%', pace: '162 WPM (Fast)', fillers: 1 },
      { id: '3', learner: 'Riya Patel', topic: 'Should AI be regulated?', clarity: '85%', confidence: '90%', pace: '142 WPM (Optimal)', fillers: 0 },
      { id: '4', learner: 'Karan Mehta', topic: 'Renewable Energy Solutions', clarity: '78%', confidence: '84%', pace: '155 WPM (Optimal)', fillers: 2 },
    ];

    const customReviews = customLearners.map((u, idx) => ({
      id: `custom_rev_${u.id}_${idx}`,
      learner: u.name,
      topic: 'Universal Basic Income creates a safety net for economic innovation',
      clarity: '82%',
      confidence: '89%',
      pace: '138 WPM (Optimal)',
      fillers: 1
    }));

    const reviews = [...defaultReviews, ...customReviews];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Presentation & Delivery Reviews</h2>
          <p className={`text-xs ${textSub}`}>Real voice delivery, pacing, confidence, and filler metrics from learner sessions.</p>
        </div>

        <div className={`p-5 rounded-2xl border ${cardBgClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`font-semibold border-b ${isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <tr>
                  <th className="p-3">Learner</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Clarity</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Pace</th>
                  <th className="p-3">Fillers</th>
                  <th className="p-3">Audit</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {reviews.map((r) => (
                  <tr key={r.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-bold">{r.learner}</td>
                    <td className="p-3">{r.topic}</td>
                    <td className="p-3 font-semibold text-indigo-500">{r.clarity}</td>
                    <td className="p-3 font-semibold text-emerald-500">{r.confidence}</td>
                    <td className="p-3 font-mono">{r.pace}</td>
                    <td className="p-3 font-mono">{r.fillers}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => openTurnLogModal(r.learner, r.topic)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                      >
                        Review Turn Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 2: Skill Gap Analysis ---
  if (activeSubTab === 'skill-gap-analysis') {
    const defaultGaps = [
      {
        name: 'Alex Chen',
        debatesCount: 9,
        commScore: 55,
        argScore: 35,
        confScore: 60,
        recommendation: 'Practice with the Fallacy Detector and Argument Analyzer'
      },
      {
        name: 'Riya Patel',
        debatesCount: 14,
        commScore: 88,
        argScore: 78,
        confScore: 85,
        recommendation: 'Focus on evidence sourcing and rebuttal structure'
      },
      {
        name: 'Karan Mehta',
        debatesCount: 8,
        commScore: 72,
        argScore: 68,
        confScore: 64,
        recommendation: 'Practice counterargument generation and pace control'
      }
    ];

    const customGaps = customLearners.map((u) => ({
      name: u.name,
      debatesCount: 5,
      commScore: 70,
      argScore: 65,
      confScore: 75,
      recommendation: 'Maintain optimal 120–150 WPM delivery and check for fallacies'
    }));

    const learnersGaps = [...defaultGaps, ...customGaps];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Skill Gap Analysis</h2>
          <p className={`text-xs ${textSub}`}>Each learner's weakest real dimension, with a concrete recommendation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learnersGaps.map((lg) => (
            <div key={lg.name} className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-base ${textHeader}`}>{lg.name}</h3>
                <span className={`text-[11px] font-mono ${textSub}`}>{lg.debatesCount} debates</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] ${textSub}`}>Communication</p>
                  <p className="text-base font-bold text-indigo-500 mt-1">{lg.commScore}%</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] ${textSub}`}>Argument</p>
                  <p className="text-base font-bold text-rose-500 mt-1">{lg.argScore}%</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] ${textSub}`}>Confidence</p>
                  <p className="text-base font-bold text-purple-500 mt-1">{lg.confScore}%</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-purple-950/40 border-purple-800/50 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'}`}>
                💡 {lg.recommendation}
              </div>

              <button 
                onClick={() => openTurnLogModal(lg.name, 'Homework Ban Policy Round')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all cursor-pointer text-center"
              >
                Inspect Turn Log
              </button>
            </div>
          ))}
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 3: Coaching Plans ---
  if (activeSubTab === 'coaching-plans') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Coaching Plans</h2>
            <p className={`text-xs ${textSub}`}>Custom milestone checklists and assigned practice plans per learner.</p>
          </div>
          <button 
            onClick={() => setIsPlanModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${cardBgClass}`}>
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-80" />
            <p className={`text-sm font-semibold ${textSub}`}>No custom coaching plans created yet.</p>
            <p className={`text-xs ${textSub} mt-1`}>Click "+ New Plan" above to assign a milestone target to a learner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div key={p.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${textHeader}`}>{p.title}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400">{p.learner}</span>
                </div>
                <p className={`text-xs ${textSub}`}>Target: {p.target}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <h3 className={`font-bold text-base ${textHeader}`}>Create Coaching Plan</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Select Learner</label>
                  <select className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
                    <option>Alex Chen</option>
                    <option>Riya Patel</option>
                    <option>Karan Mehta</option>
                    {customLearners.map(u => (
                      <option key={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Plan Title</label>
                  <input type="text" placeholder="e.g. Fallacy Avoidance & Evidence Sourcing" className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setIsPlanModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>Cancel</button>
                <button 
                  onClick={() => {
                    setPlans(prev => [...prev, { id: Date.now().toString(), title: 'Fallacy Avoidance & Evidence Sourcing', learner: customLearners[0]?.name || 'Alex Chen', target: 'Reduce Fallacies to 0', progress: 20 }]);
                    setIsPlanModalOpen(false);
                  }} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 4: Learners ---
  if (activeSubTab === 'learners') {
    const defaultMentees = [
      { name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', level: 'Senior Debater', sessions: 9, avgScore: 71.5 },
      { name: 'Riya Patel', email: 'riya.patel@debate.edu', level: 'Advanced', sessions: 14, avgScore: 91.2 },
      { name: 'Karan Mehta', email: 'karan.m@debate.edu', level: 'Intermediate', sessions: 8, avgScore: 78.4 },
      { name: 'Sneha Kulkarni', email: 'sneha.k@debate.edu', level: 'Intermediate', sessions: 11, avgScore: 82.0 },
    ];

    const customMentees = customLearners.map(u => ({
      name: u.name,
      email: u.email,
      level: u.roleLabel || 'Learner',
      sessions: 3,
      avgScore: 84.0
    }));

    const mentees = [...defaultMentees, ...customMentees];

    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Learners Overview</h2>
            <p className={`text-xs ${textSub}`}>Manage assigned debate mentees and review individual records.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search mentees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentees.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
            <div key={m.name} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${cardBgClass}`}>
              <div className="space-y-1">
                <h3 className={`font-bold text-sm ${textHeader}`}>{m.name}</h3>
                <p className={`text-xs font-mono ${textSub}`}>{m.email}</p>
                <div className="flex items-center gap-2 text-[11px] pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-semibold">{m.level}</span>
                  <span className={textSub}>• {m.sessions} Sessions</span>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-2">
                <span className="text-xl font-bold font-mono text-purple-500 block">{m.avgScore}</span>
                <button 
                  onClick={() => openTurnLogModal(m.name, 'Recent Practice Round')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                >
                  Turn Log
                </button>
              </div>
            </div>
          ))}
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 5A: Argument Reviews (Distinct: Claims, Reasoning & Structural Auditing) ---
  if (activeSubTab === 'argument-reviews') {
    const argumentQueue = [
      {
        id: 'arg_1',
        learner: 'Alex Chen',
        topic: 'Should physical education be mandatory throughout high school?',
        claim: 'PE promotes cardiovascular resilience and reduces adolescent anxiety rates.',
        evidenceCited: '2023 CDC Adolescent Health Survey',
        reasoningScore: 68,
        structureGrade: 'B-',
        date: 'Aug 8, 2026'
      },
      {
        id: 'arg_2',
        learner: 'Riya Patel',
        topic: 'Junk food advertising targeting children should be banned',
        claim: 'Commercial marketing overrides parental dietary guidance and drives chronic juvenile obesity.',
        evidenceCited: '2024 WHO Dietary Guidelines & Pediatric Meta-Analysis',
        reasoningScore: 94,
        structureGrade: 'A+',
        date: 'Aug 7, 2026'
      },
      {
        id: 'arg_3',
        learner: 'Karan Mehta',
        topic: 'Renewable energy subsidies accelerate infrastructure modernizations',
        claim: 'Federal tax credits de-risk solar grid integration for private utilities.',
        evidenceCited: 'Department of Energy 2025 Market Brief',
        reasoningScore: 82,
        structureGrade: 'B+',
        date: 'Aug 6, 2026'
      }
    ];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Argument Structure Reviews</h2>
          <p className={`text-xs ${textSub}`}>Evaluate how learners construct primary claims, ground evidence, and establish logical links.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Reasoning Score</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">81.3/100</p>
          </div>
          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Evidence Integration</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">79% Cites Data</p>
          </div>
          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Audits</span>
            <p className="text-2xl font-black text-amber-400 mt-1">3 Arguments</p>
          </div>
        </div>

        <div className="space-y-4">
          {argumentQueue.map((item) => (
            <div key={item.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-700/50">
                <div>
                  <h3 className={`font-bold text-sm ${textHeader}`}>{item.learner}</h3>
                  <p className="text-xs text-purple-400 font-semibold">{item.topic}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Reasoning: {item.reasoningScore}% ({item.structureGrade})
                  </span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="font-semibold text-slate-400 mb-1">Primary Contention Claim:</p>
                  <p className="italic">"{item.claim}"</p>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="font-semibold text-slate-400 mb-1">Evidence Source Cited:</p>
                  <p className="text-emerald-400 font-medium">📌 {item.evidenceCited}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Click below to open step-by-step turn speech log:</span>
                <button 
                  onClick={() => openTurnLogModal(item.learner, item.topic)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Review Turn Log
                </button>
              </div>
            </div>
          ))}
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 5B: Fallacy Reports (Distinct: Dedicated Fallacy Audit & Frequency Telemetry) ---
  if (activeSubTab === 'fallacy-reports') {
    const fallacyLogs = [
      {
        id: 'f_1',
        learner: 'Alex Chen',
        topic: 'Should physical education be mandatory throughout high school?',
        fallacyType: 'Hasty Generalization',
        severity: 'High',
        quote: 'Anyone opposing mandatory physical education clearly hates student physical health.',
        recommendation: 'Avoid attributing malicious intent to opposing policy framework.',
        date: 'Aug 8, 2026'
      },
      {
        id: 'f_2',
        learner: 'Karan Mehta',
        topic: 'Homework should be banned in schools',
        fallacyType: 'Strawman Fallacy',
        severity: 'Medium',
        quote: 'Proponents of homework want children to spend 10 hours a day trapped at desks with zero leisure time.',
        recommendation: 'Represent opponent arguments accurately before attempting rebuttals.',
        date: 'Aug 5, 2026'
      },
      {
        id: 'f_3',
        learner: 'Alex Chen',
        topic: 'Universal Basic Income creates a safety net for economic innovation',
        fallacyType: 'Ad Hominem',
        severity: 'High',
        quote: 'Opposing economists are completely out of touch with real workers.',
        recommendation: 'Attack economic data rather than the personal status of economists.',
        date: 'Aug 3, 2026'
      }
    ];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Logical Fallacy Audit & Reports</h2>
          <p className={`text-xs ${textSub}`}>Real-time detection and severity breakdown of logical fallacies committed by mentees across debate practice sessions.</p>
        </div>

        {/* Fallacy KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Fallacies Detected</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400 mt-1">14 Flagged</p>
            <p className="text-[10px] text-slate-400 mt-1">-22% decrease this month</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Most Common</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-400 mt-1">Hasty Generalization</p>
            <p className="text-[10px] text-slate-400 mt-1">38% of all flagged speech turns</p>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">High Severity</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-500 mt-1">3 Critical</p>
            <p className="text-[10px] text-slate-400 mt-1">Requires immediate coaching intervention</p>
          </div>
        </div>

        {/* Fallacy Detailed Audit Cards */}
        <div className="space-y-3">
          {fallacyLogs.map((f) => (
            <div key={f.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className={`font-bold text-sm ${textHeader}`}>{f.learner} — <span className="text-slate-400 font-normal">{f.topic}</span></h3>
                    <span className="text-[11px] text-slate-400">{f.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {f.fallacyType}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    f.severity === 'High' ? 'bg-rose-600/30 text-rose-300' : 'bg-amber-600/30 text-amber-300'
                  }`}>
                    {f.severity} Severity
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-slate-400 font-medium">Flagged Speech Quote:</p>
                <p className="italic text-rose-300 font-serif">"{f.quote}"</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                <p className="text-amber-400 font-medium flex items-center gap-1">
                  💡 Coach Recommendation: {f.recommendation}
                </p>
                <button 
                  onClick={() => openTurnLogModal(f.learner, f.topic)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Inspect Speech Turn Log
                </button>
              </div>
            </div>
          ))}
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  // --- SUBVIEW 5C-1: Coach Mentee Performance Analytics ---
  if (activeSubTab === 'performance-analytics') {
    const analyticsTrend = [
      { week: 'Wk 1', avgScore: 64 },
      { week: 'Wk 2', avgScore: 71 },
      { week: 'Wk 3', avgScore: 78 },
      { week: 'Wk 4', avgScore: 85 },
    ];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Mentee Performance Analytics</h2>
          <p className={`text-xs ${textSub}`}>Cohort-wide skill development analytics, average turn log scores, and progress metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>Mentee Average Score Trajectory</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>Coaching Dimension Averages</h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Thesis Clarity & Framing</span>
                  <span className="text-purple-400 font-mono">88/100</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Evidence Sourcing & Benchmark Data</span>
                  <span className="text-indigo-400 font-mono">76/100</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Logical Fallacy Immunity</span>
                  <span className="text-emerald-400 font-mono">92/100</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 5C-2: Student Evaluation Reports ---
  if (activeSubTab === 'reports') {
    const reportSummaries = [
      {
        id: 'rep_1',
        learner: 'Alex Chen',
        topic: 'Should physical education be mandatory throughout high school?',
        grade: 'C+',
        score: 52,
        keyInsight: 'Good vocal projection, but lacked empirical health data and committed 2 emotional generalisations.',
        date: 'Aug 8, 2026'
      },
      {
        id: 'rep_2',
        learner: 'Riya Patel',
        topic: 'Junk food advertising targeting children should be banned',
        grade: 'A+',
        score: 93,
        keyInsight: 'Masterclass policy debate! Flawless integration of WHO nutritional guidelines and airtight impact weighing.',
        date: 'Aug 7, 2026'
      },
      {
        id: 'rep_3',
        learner: 'Karan Mehta',
        topic: 'Renewable energy subsidies accelerate infrastructure modernizations',
        grade: 'B-',
        score: 68,
        keyInsight: 'Solid contention construction, but opponent counter-model was under-addressed in summary.',
        date: 'Aug 6, 2026'
      }
    ];

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Student Evaluation Reports</h2>
          <p className={`text-xs ${textSub}`}>Comprehensive AI evaluation reports generated for finished learner debate turns.</p>
        </div>

        <div className="space-y-4">
          {reportSummaries.map((rep) => (
            <div key={rep.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
                <div>
                  <h3 className={`font-bold text-sm ${textHeader}`}>{rep.learner}</h3>
                  <p className="text-xs text-purple-400 font-semibold">{rep.topic}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Grade: {rep.grade} ({rep.score}%)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">{rep.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rep.keyInsight}"
              </p>

              <div className="flex items-center justify-end pt-1">
                <button 
                  onClick={() => openTurnLogModal(rep.learner, rep.topic)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Open Complete Turn Log
                </button>
              </div>
            </div>
          ))}
        </div>

        {renderTurnLogModal()}
      </div>
    );
  }

  const customQueueItems = customLearners.map((u, idx) => ({
    id: `custom_eq_main_${u.id}_${idx}`,
    learner: u.name,
    topic: 'Universal Basic Income creates a safety net for economic innovation.',
    Submitted: 'Just now',
    priority: 'High',
    type: 'Debate'
  }));

  const mainDashboardQueue = [...MOCK_COACH_DATA.evaluationQueue, ...customQueueItems];

  // --- DEFAULT SUBVIEW: Coach Dashboard Main ---
  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-sky-400/30">
        <div className="space-y-1">
          <span className="text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 font-bold text-xs uppercase tracking-wider shadow-xs">COACH PORTAL</span>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Welcome, {coachName} 🎯</h2>
          <p className="text-sky-100 text-xs font-medium">Guiding 48 active debate mentees with AI-powered telemetry and performance auditing</p>
        </div>

        <div className="bg-white/15 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl text-xs border border-white/30 shadow-md shrink-0">
          Top Performer: {MOCK_COACH_DATA.topPerformer}
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium ${textSub}`}>Active Mentees</p>
            <p className={`text-2xl font-bold mt-0.5 ${textHeader}`}>{MOCK_COACH_DATA.activeLearners}</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium ${textSub}`}>Sessions Today</p>
            <p className={`text-2xl font-bold mt-0.5 ${textHeader}`}>{MOCK_COACH_DATA.sessionsToday}</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium ${textSub}`}>Pending Reviews</p>
            <p className={`text-2xl font-bold mt-0.5 ${textHeader}`}>{MOCK_COACH_DATA.pendingEvaluations}</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center gap-4 ${cardBgClass}`}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-medium ${textSub}`}>Mentee Avg Score</p>
            <p className={`text-2xl font-bold mt-0.5 ${textHeader}`}>{MOCK_COACH_DATA.avgClassScore}/100</p>
          </div>
        </div>
      </div>

      {/* Learner Review & Evaluation Queue Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardBgClass}`}>
        <div className={`p-5 border-b font-bold text-sm flex items-center justify-between ${borderDivider}`}>
          <span className={textHeader}>Learner Review & Evaluation Queue</span>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            12 Awaiting Feedback
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-semibold border-b ${isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <tr>
                <th className="p-3.5">Learner Name</th>
                <th className="p-3.5">Debate Topic</th>
                <th className="p-3.5">Submission Time</th>
                <th className="p-3.5">Type & Priority</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
              {mainDashboardQueue.map((item) => (
                <tr key={item.id} className={isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50/70'}>
                  <td className={`p-3.5 font-bold ${textHeader}`}>{item.learner}</td>
                  <td className="p-3.5">{item.topic}</td>
                  <td className={`p-3.5 ${textSub}`}>{item.Submitted}</td>
                  <td className="p-3.5 font-semibold text-indigo-500">{item.type} ({item.priority})</td>
                  <td className="p-3.5">
                    <button 
                      onClick={() => openTurnLogModal(item.learner, item.topic)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
                    >
                      Review Turn Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {renderTurnLogModal()}
    </div>
  );
};

