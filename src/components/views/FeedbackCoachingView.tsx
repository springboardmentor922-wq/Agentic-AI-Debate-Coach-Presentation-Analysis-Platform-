import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  RefreshCw, 
  Wand2, 
  ArrowRight, 
  ShieldAlert, 
  BookOpen, 
  Compass, 
  Check, 
  Route, 
  Target, 
  BarChart2, 
  FileText, 
  Lightbulb, 
  Play, 
  ArrowUpRight, 
  Zap, 
  Award, 
  Clock,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { MOCK_COACHING_PLANS } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';

interface FeedbackCoachingViewProps {
  activeSubTab?: string; // 'learning-path' | 'feedback-coaching' | 'recommended'
  onNavigate?: (tab: string) => void;
  onStartPractice?: (topicTitle?: string) => void;
}

export const FeedbackCoachingView: React.FC<FeedbackCoachingViewProps> = ({
  activeSubTab = 'learning-path',
  onNavigate,
  onStartPractice
}) => {
  const { isDark } = useTheme();

  // Primary Tab state: 'learning-path' | 'feedback-coaching' | 'recommended'
  const [mainTab, setMainTab] = useState<'learning-path' | 'feedback-coaching' | 'recommended'>(
    (activeSubTab as any) || 'learning-path'
  );

  useEffect(() => {
    if (activeSubTab && ['learning-path', 'feedback-coaching', 'recommended'].includes(activeSubTab)) {
      setMainTab(activeSubTab as any);
    }
  }, [activeSubTab]);

  // Sub-tab state for Feedback & Coaching
  const [coachingSubTab, setCoachingSubTab] = useState<'fixit' | 'plans' | 'reviews'>('fixit');

  // State for Actionable "Fix-It" Rewrite Recommendations
  const [userClaimInput, setUserClaimInput] = useState('We should stop funding space exploration because it costs too much money and has no immediate benefits on Earth.');
  const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);
  const [rewriteResult, setRewriteResult] = useState({
    originalWeakness: 'Contains Hasty Generalization and lacks empirical economic ROI evidence regarding spin-off technologies.',
    strongerVersion: 'While Earth-based social priorities require substantial capital, public investment in aerospace research yields a 7:1 return through commercial spin-off technologies in telecommunications, climate satellite monitoring, and medical imaging.',
    evidenceToCite: 'NASA Economic Impact Report (2023) showing $71.2B total economic output from $25.4B budget.',
    strategyTip: 'Concede initial high capital expenditure, then pivot to multi-industry economic multiplier effects.'
  });

  // State for Coaching Plans drill checklist persistence
  const [coachingPlansState, setCoachingPlansState] = useState(MOCK_COACHING_PLANS);

  const toggleDrillCompletion = (planId: string, drillId: string) => {
    setCoachingPlansState(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedDrills = plan.drills.map(d => d.id === drillId ? { ...d, completed: !d.completed } : d);
        const completedCount = updatedDrills.filter(d => d.completed).length;
        const newProgress = Math.round((completedCount / updatedDrills.length) * 100);
        return { ...plan, drills: updatedDrills, progressPercent: newProgress };
      }
      return plan;
    }));
  };

  const handleGenerateRewrite = () => {
    setIsGeneratingRewrite(true);
    setTimeout(() => {
      setRewriteResult({
        originalWeakness: 'Lacks quantifiable evidence and commits an absolute dichotomy trap.',
        strongerVersion: `To maximize policy impact regarding "${userClaimInput.slice(0, 30)}...", structure the premise around measurable fiscal impact, regulatory feasibility, and multi-sector benefits.`,
        evidenceToCite: 'Peer-reviewed policy analysis & empirical benchmark metrics from 2024-2025 cross-country trials.',
        strategyTip: 'Replace emotional assertions with verified statistical trends and explicit causal links.'
      });
      setIsGeneratingRewrite(false);
    }, 500);
  };

  const handleTabChange = (tab: 'learning-path' | 'feedback-coaching' | 'recommended') => {
    setMainTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const cardBg = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner Navigation Header */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shrink-0">
              {mainTab === 'learning-path' && <Route className="w-6 h-6" />}
              {mainTab === 'feedback-coaching' && <Sparkles className="w-6 h-6" />}
              {mainTab === 'recommended' && <Compass className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                  Improvement Hub
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {mainTab === 'learning-path' && 'Personalized Learning Path & Skill Mastery'}
                {mainTab === 'feedback-coaching' && 'Feedback & Coaching Engine'}
                {mainTab === 'recommended' && 'Recommended For You'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mainTab === 'learning-path' && 'Structured 5-stage debate curriculum tailored to your performance benchmarks and diagnostic goals.'}
                {mainTab === 'feedback-coaching' && 'Actionable "Fix-It" argument rewrites, assigned mentor coaching plans, and detailed turn log critiques.'}
                {mainTab === 'recommended' && 'AI-curated practice topics, targeted skill gap drills, and empirical research briefs based on your latest scores.'}
              </p>
            </div>
          </div>

          {/* Main 3 View Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleTabChange('learning-path')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                mainTab === 'learning-path' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Route className="w-4 h-4" /> Learning Path
            </button>
            <button
              onClick={() => handleTabChange('feedback-coaching')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                mainTab === 'feedback-coaching' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Feedback & Coaching
            </button>
            <button
              onClick={() => handleTabChange('recommended')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                mainTab === 'recommended' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" /> Recommended For You
            </button>
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: LEARNING PATH ================= */}
      {mainTab === 'learning-path' && (
        <div className="space-y-6">
          {/* Level Progress Summary Header */}
          <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-900/40 border-indigo-500/30`}>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Stage 2 Active • Intermediate Advocate
              </span>
              <h3 className="text-lg font-bold text-white">Your Adaptive Debate Learning Path</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                You have completed 12 module topics. Complete Stage 2 drills to unlock Advanced Parliamentary Cross-Examination and Tournament Finalist certification.
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Overall Mastery</p>
                <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-0.5">62%</p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Stages Completed</p>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">1 / 5</p>
              </div>
            </div>
          </div>

          {/* 5-Stage Learning Roadmap */}
          <div className="space-y-4">
            {/* Stage 1: Motion Parsing & Thesis Framing (Completed) */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-xs shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Stage 01 • Completed</span>
                    <h4 className="font-bold text-white text-base">Motion Parsing & Stance Framing</h4>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  100% Mastered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Core fundamentals of Oxford, Parliamentary, and Lincoln-Douglas debate formats, defining motion terms, and constructing bulletproof thesis statements.
              </p>
            </div>

            {/* Stage 2: Claim-Warrant-Impact & CWI Logic (Active) */}
            <div className={`p-6 rounded-2xl border border-indigo-500/50 bg-slate-900 space-y-4 shadow-xl ring-1 ring-indigo-500/30`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                    02
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Stage 02 • Currently Active</span>
                    <h4 className="font-bold text-white text-base">Claim-Warrant-Impact (CWI) Structural Logic</h4>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                  65% Progress
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">2.1 Constructing Impregnable Claims</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400">Eliminate vague assertions and ground claims in policy outcomes.</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-indigo-500/40 space-y-1.5 ring-1 ring-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-300">2.2 Sourcing Warrant Evidence with Data</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">In Progress</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Integrate empirical studies and peer-reviewed statistical benchmarks.</p>
                  <button 
                    onClick={() => onStartPractice && onStartPractice('AP Ethics & Social Media Policy Debate')}
                    className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" /> Practice Module Sparring
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">2.3 Impact Framing & Social Multipliers</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Up Next</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Evaluate short-term fiscal costs against long-term societal benefits.</p>
                </div>
              </div>
            </div>

            {/* Stage 3: Fallacy Refutation & Agent 1 Defense (Locked) */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 opacity-90`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs shrink-0">
                    03
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage 03 • Unlocks at 80% Stage 2</span>
                    <h4 className="font-bold text-slate-200 text-base">Fallacy Refutation & Agent 1 Referee Defense</h4>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate('fallacy-detector')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  Explore Fallacy Engine <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Identify Ad Hominem, Straw Man, Slippery Slope, and False Dichotomy traps in real-time cross-examinations.
              </p>
            </div>

            {/* Stage 4: Advanced Cross-Ex & POI Timing (Locked) */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 opacity-75`}>
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0">
                  04
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stage 04 • Locked</span>
                  <h4 className="font-bold text-slate-300 text-base">Advanced Cross-Examination & Point of Information Timing</h4>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Strategic timing for Points of Information (POIs), pivot techniques under pressure, and opponent trap setup.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: FEEDBACK & COACHING ================= */}
      {mainTab === 'feedback-coaching' && (
        <div className="space-y-6">
          {/* Coaching Sub-navigation Pills */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCoachingSubTab('fixit')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coachingSubTab === 'fixit'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Actionable "Fix-It" Rewrites
              </button>
              <button
                onClick={() => setCoachingSubTab('plans')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coachingSubTab === 'plans'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Assigned Coaching Plans & Drills
              </button>
              <button
                onClick={() => setCoachingSubTab('reviews')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  coachingSubTab === 'reviews'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Turn Log Critiques & History
              </button>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline-block">
              AI Coach Engine • Agent 1 & Mentor Audits
            </span>
          </div>

          {/* SUB-TAB 1: FIX-IT REWRITES */}
          {coachingSubTab === 'fixit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Input Claim */}
              <div className={`lg:col-span-5 p-6 rounded-2xl border ${cardBg} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Weak Claim Diagnosis
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Real-time LLM Critique</span>
                </div>

                <h3 className="text-base font-bold text-white">Actionable "Fix-It" Critique & Rewrite</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Whenever an argument lacks structure or empirical evidence, the Coaching Engine automatically rephrases it into a stronger, higher-impact version.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Enter Weak or Penalized Claim</label>
                  <textarea
                    rows={4}
                    value={userClaimInput}
                    onChange={(e) => setUserClaimInput(e.target.value)}
                    placeholder="Type any argument here to see how AI transforms it into a stronger version..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleGenerateRewrite}
                  disabled={isGeneratingRewrite || !userClaimInput.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingRewrite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>{isGeneratingRewrite ? 'Generating Fix-It Example...' : 'Generate Stronger Rewrite Example'}</span>
                </button>
              </div>

              {/* Right Column: Transformation Card */}
              <div className={`lg:col-span-7 p-6 rounded-2xl border ${cardBg} space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Coaching Engine Transformation Example
                  </h3>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 font-mono">
                    +35 Pts Quality Boost
                  </span>
                </div>

                {/* Critique Diagnosis */}
                <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Identified Flaw / Weakness:</span>
                  <p className="text-xs text-amber-200 font-medium">{rewriteResult.originalWeakness}</p>
                </div>

                {/* Stronger Version Rephrase */}
                <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Rephrased Stronger Version (Example):
                  </span>
                  <p className="text-xs text-emerald-100 font-serif italic leading-relaxed">
                    "{rewriteResult.strongerVersion}"
                  </p>
                </div>

                {/* Evidence & Strategy Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evidence Sourcing Rec:</span>
                    <p className="text-xs text-slate-200 font-semibold">{rewriteResult.evidenceToCite}</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Debate Strategy Pivot:</span>
                    <p className="text-xs text-slate-200 font-semibold">{rewriteResult.strategyTip}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => onStartPractice && onStartPractice('Oxford Debate: AI Automation & Labor Market Shifts')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Test This Rewrite in Debate Simulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: COACHING PLANS */}
          {coachingSubTab === 'plans' && (
            <div className="space-y-6">
              {coachingPlansState.map((plan) => (
                <div key={plan.id} className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-900">
                        Focus Area: {plan.focusArea}
                      </span>
                      <h3 className="font-bold text-white text-lg mt-2">{plan.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Assigned by {plan.learnerName || 'Coach Arjun Mehta'} • Target Date: {plan.targetDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-200 font-mono">Completion: {plan.progressPercent}%</span>
                      <div className="w-36 h-2 bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-800">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${plan.progressPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Recommended Drills Checklist */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-200">Action Drills Checklist (Click to complete)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plan.drills.map((drill) => (
                        <div 
                          key={drill.id} 
                          onClick={() => toggleDrillCompletion(plan.id, drill.id)}
                          className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200 font-medium cursor-pointer hover:border-slate-700 transition-colors"
                        >
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${drill.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <div className="flex-1">
                            <p className={drill.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{drill.title}</p>
                            <span className="text-[10px] text-slate-400 font-semibold">{drill.type.toUpperCase()} • {drill.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-TAB 3: TURN LOG CRITIQUES */}
          {coachingSubTab === 'reviews' && (
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Recent Turn Log Critiques & AI Evaluations
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-300">Topic: AP Ethics & Social Media Policy Debate</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Score: 88/100</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "Great opening hook citing empirical youth mental health studies. Watch out for Hasty Generalizations in turn 2 when addressing content moderation algorithms."
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Reviewed by AI Referee Agent 1 • 2 hours ago</span>
                    <button 
                      onClick={() => onNavigate && onNavigate('ai-simulation')}
                      className="text-indigo-400 hover:underline font-bold cursor-pointer"
                    >
                      View Turn Log →
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-300">Topic: Lincoln-Douglas: Universal Basic Income & Welfare</span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Score: 72/100</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "Refusal to concede initial capital outlay weakened persuasive weight. Apply the Fix-It rewrite strategy to pivot into commercial multiplier effects."
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Reviewed by Coach Arjun Mehta • Yesterday</span>
                    <button 
                      onClick={() => onNavigate && onNavigate('ai-simulation')}
                      className="text-indigo-400 hover:underline font-bold cursor-pointer"
                    >
                      View Turn Log →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 3: RECOMMENDED FOR YOU ================= */}
      {mainTab === 'recommended' && (
        <div className="space-y-6">
          {/* Personalized Recommendation Diagnostic Header */}
          <div className={`p-6 rounded-2xl border ${cardBg} bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border-violet-500/30 space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-950 px-2.5 py-0.5 rounded-full border border-violet-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> AI Recommendation Radar
              </span>
              <span className="text-xs text-slate-400">Calibrated to your latest debate score (78.4 Avg)</span>
            </div>
            <h3 className="text-lg font-bold text-white">Targeted Recommendations for Your Next Session</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Based on your recent debate simulation turn logs, the AI Coach detected a <strong className="text-indigo-300">12-point deficit in Evidence Weight</strong> compared to your strong Argument Structure. Here are personalized practice motions, drills, and research briefs tailored to raise your overall score above 90+.
            </p>
          </div>

          {/* Section 1: Recommended Debate Motions */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Recommended Practice Motions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all`}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    High Fit • +12 Evidence Boost
                  </span>
                  <h4 className="font-bold text-white text-sm">AP Ethics & Social Media Policy Debate</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Practice incorporating empirical statistical evidence on youth mental health data to overcome evidence score deficits.
                  </p>
                </div>

                <button
                  onClick={() => onStartPractice && onStartPractice('AP Ethics & Social Media Policy Debate')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start Practice Topic
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all`}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    Rebuttal Focus
                  </span>
                  <h4 className="font-bold text-white text-sm">Lincoln-Douglas: Universal Basic Income & Welfare</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Focus on refuting opposition fiscal arguments without committing straw man or false dichotomy fallacies.
                  </p>
                </div>

                <button
                  onClick={() => onStartPractice && onStartPractice('Lincoln-Douglas: Universal Basic Income & Welfare')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start Practice Topic
                </button>
              </div>

              <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all`}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    Policy Mechanics
                  </span>
                  <h4 className="font-bold text-white text-sm">Parliamentary: Climate Policy & Clean Energy Subsidies</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Master Point of Information (POI) timing and multi-sector economic multiplier framing under time pressure.
                  </p>
                </div>

                <button
                  onClick={() => onStartPractice && onStartPractice('Parliamentary: Climate Policy & Clean Energy Subsidies')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start Practice Topic
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Recommended Rapid Drills */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Recommended Rapid Skill Drills
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">3-Minute Data Citation Challenge</h4>
                    <p className="text-[11px] text-slate-400">Cite 3 empirical statistics in under 180 seconds (+15 Evidence Score).</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate && onNavigate('practice-topics')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                >
                  Start Drill
                </button>
              </div>

              <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Slippery Slope Refutation Drill</h4>
                    <p className="text-[11px] text-slate-400">Neutralize 3 opponent fallacy traps without losing composure (+10 Score).</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate && onNavigate('fallacy-detector')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                >
                  Start Drill
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Evidence Briefs */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-400" />
              Recommended Research & Evidence Briefs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">2025 Global Economic Sourcing Handbook</p>
                  <p className="text-[11px] text-slate-400">Verified GDP impact multipliers and trade balance statistics.</p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate('learning-resources')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 shrink-0 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">Rhetorical Concession Strategy Guide</p>
                  <p className="text-[11px] text-slate-400">How to concede minor points while winning the central thesis.</p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate('learning-resources')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 shrink-0 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
