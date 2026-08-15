import React, { useState } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  X, 
  Printer, 
  Target,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PDFReportService } from '../../services/PDFReportService';

interface MyDebatesViewProps {
  onStartNewDebate: () => void;
}

export interface ReportCardDetails {
  grade: string;
  gradeColor: string;
  overallSummary: string;
  metrics: {
    clarity: number;
    evidence: number;
    reasoning: number;
    structure: number;
  };
  strengths: string[];
  improvements: string[];
  judgeNotes: string;
  fallaciesCount: number;
  speechPace: number; // WPM
  keyHighlight: string;
}

interface DebateItem {
  id: string;
  title: string;
  format: string;
  status: 'Completed' | 'Scheduled' | 'Drafts';
  side: string;
  date: string;
  score: number;
  report: ReportCardDetails;
}

const DEBATE_LIST: DebateItem[] = [
  {
    id: '1',
    title: 'Should physical education be mandatory throughout high school?',
    format: 'Public Forum Debate',
    status: 'Completed',
    side: 'For',
    date: '3/8/2026',
    score: 52,
    report: {
      grade: 'C+',
      gradeColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      overallSummary: 'Moderate performance with good structure, but argumentation lacked statistical evidence and contained a minor hasty generalization during the second speech turn.',
      metrics: {
        clarity: 60,
        evidence: 42,
        reasoning: 55,
        structure: 51,
      },
      strengths: [
        'Engaging vocal delivery in opening statement',
        'Clear stance maintained throughout cross-examination'
      ],
      improvements: [
        'Incorporate empirical health and academic correlation studies',
        'Avoid making sweeping statements without citing specific sources'
      ],
      judgeNotes: 'Good team coordination. Focus on backing up your primary contention with concrete data rather than general assertions.',
      fallaciesCount: 2,
      speechPace: 145,
      keyHighlight: 'Passionate opening statement with strong structural organization.'
    }
  },
  {
    id: '2',
    title: 'Homework should be banned in schools',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'Not selected',
    date: '27/7/2026',
    score: 45,
    report: {
      grade: 'D',
      gradeColor: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
      overallSummary: 'Struggled to sustain the opposition burden of proof. Rebuttals were largely defensive rather than offering counter-models.',
      metrics: {
        clarity: 50,
        evidence: 35,
        reasoning: 48,
        structure: 47,
      },
      strengths: [
        'Strong vocal projection and pacing',
        'Authentic focus on student mental well-being'
      ],
      improvements: [
        'Differentiate between practice assignments and excessive workload',
        'Strengthen impact cards on cognitive retention'
      ],
      judgeNotes: 'Work on building constructive counter-arguments rather than solely criticizing the opponent\'s framework.',
      fallaciesCount: 3,
      speechPace: 162,
      keyHighlight: 'Empathic framing regarding student mental health.'
    }
  },
  {
    id: '3',
    title: 'Homework should be banned in schools (Practice Round)',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'Not selected',
    date: '27/7/2026',
    score: 0,
    report: {
      grade: 'N/A',
      gradeColor: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
      overallSummary: 'Draft round exited before completion. Partial argument logged in session cache.',
      metrics: {
        clarity: 0,
        evidence: 0,
        reasoning: 0,
        structure: 0,
      },
      strengths: ['Initiated practice session'],
      improvements: ['Complete all 3 debate turns to unlock AI judge scoring'],
      judgeNotes: 'Session terminated early. Resume to receive a complete evaluation report.',
      fallaciesCount: 0,
      speechPace: 0,
      keyHighlight: 'Draft saved in local session history.'
    }
  },
  {
    id: '4',
    title: 'This House believes sports should be mandatory in schools',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'For',
    date: '26/7/2026',
    score: 67,
    report: {
      grade: 'B-',
      gradeColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
      overallSummary: 'Solid contention construction with convincing health framing. Opponent\'s economic counter-model was under-addressed in the summary.',
      metrics: {
        clarity: 72,
        evidence: 65,
        reasoning: 68,
        structure: 63,
      },
      strengths: [
        'Clear distinction between competitive sports and physical education',
        'Strong cross-examination questions regarding budget allocation'
      ],
      improvements: [
        'Rebut opposing arguments regarding facility maintenance costs',
        'Pace speech timing better during the final summary turn'
      ],
      judgeNotes: 'Promising round. Make sure to explicitly weigh your physical health impacts against their fiscal burden arguments.',
      fallaciesCount: 1,
      speechPace: 138,
      keyHighlight: 'Sharp cross-examination trap forcing opponent to concede health benefits.'
    }
  },
  {
    id: '5',
    title: 'Homework should be banned in schools',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'For',
    date: '25/7/2026',
    score: 68,
    report: {
      grade: 'B-',
      gradeColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
      overallSummary: 'Persuasive stance on cognitive overload. Demonstrated solid signposting throughout the argument.',
      metrics: {
        clarity: 75,
        evidence: 60,
        reasoning: 70,
        structure: 67,
      },
      strengths: [
        'Excellent signposting across 3 core contentions',
        'Well-timed poise and clear articulation'
      ],
      improvements: [
        'Cite specific education board data rather than anecdotal experiences',
        'Address the opponent\'s argument on subject mastery'
      ],
      judgeNotes: 'Good organization! Focus on strengthening evidence quality to push into the A-tier.',
      fallaciesCount: 1,
      speechPace: 140,
      keyHighlight: 'Impeccable signposting and rhetorical clarity.'
    }
  },
  {
    id: '6',
    title: 'Junk food should be banned in schools',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'For',
    date: '24/7/2026',
    score: 93,
    report: {
      grade: 'A+',
      gradeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      overallSummary: 'Masterclass policy debate! Flawless integration of 2024 WHO nutritional guidelines, airtight impact weighing, and commanding summary delivery.',
      metrics: {
        clarity: 95,
        evidence: 92,
        reasoning: 94,
        structure: 91,
      },
      strengths: [
        'Cited 2024 WHO nutritional guidelines with exact data points',
        'Airtight impact weighing comparing long-term healthcare savings to vendor revenue',
        'Commanding, persuasive cross-fire delivery'
      ],
      improvements: [
        'Minor hesitation during the final 10 seconds transition'
      ],
      judgeNotes: 'Exceptional performance! High commendation from all judging metrics.',
      fallaciesCount: 0,
      speechPace: 142,
      keyHighlight: 'Airtight economic and health impact weighing.'
    }
  },
  {
    id: '7',
    title: 'Homework should be banned in schools',
    format: 'One-on-One Debate',
    status: 'Completed',
    side: 'Against',
    date: '24/7/2026',
    score: 92,
    report: {
      grade: 'A+',
      gradeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      overallSummary: 'Outstanding opposition strategy. Turned the Affirmative equity argument by proving structured homework balances socioeconomic learning gaps.',
      metrics: {
        clarity: 94,
        evidence: 90,
        reasoning: 93,
        structure: 91,
      },
      strengths: [
        'Brilliant argument turn on socioeconomic equity',
        'Fluid transitions and logical flow',
        'Disciplined clock management'
      ],
      improvements: [
        'Allocate slightly more time to the final whip summary'
      ],
      judgeNotes: 'Top-tier strategic execution! Perfect example of a successful opposition turn.',
      fallaciesCount: 0,
      speechPace: 146,
      keyHighlight: 'Masterful turn of the Affirmative equity framework.'
    }
  }
];

export const MyDebatesView: React.FC<MyDebatesViewProps> = ({ onStartNewDebate }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'All' | 'Completed' | 'Scheduled' | 'Drafts'>('All');
  const [expandedId, setExpandedId] = useState<string | null>('1'); // Default open first report card summary
  const [selectedReportModal, setSelectedReportModal] = useState<DebateItem | null>(null);

  const [debatesList, setDebatesList] = useState<DebateItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_completed_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p: any) => p.id));
          const defaultFiltered = DEBATE_LIST.filter(d => !ids.has(d.id));
          return [...parsed, ...defaultFiltered];
        }
      }
    } catch (e) {
      console.error('Failed to parse saved completed debates', e);
    }
    return DEBATE_LIST;
  });

  const filteredList = activeTab === 'All' 
    ? debatesList 
    : debatesList.filter(d => d.status === activeTab);

  // Stats summary calculations
  const completedDebates = debatesList.filter(d => d.status === 'Completed' && d.score > 0);
  const avgScore = Math.round(completedDebates.reduce((acc, curr) => acc + curr.score, 0) / (completedDebates.length || 1));
  const topGrade = 'A+ (93%)';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';
  const bgCard = isDark ? 'bg-[#1E1B2B]/90 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>My Debates</h2>
          <p className={`text-xs ${textSub}`}>Review completed practice sessions and explore detailed AI Evaluation Report Cards.</p>
        </div>

        <button
          onClick={onStartNewDebate}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all self-start cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> New Debate
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${bgCard} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${textHeader}`}>{avgScore}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Across {completedDebates.length} completed rounds</p>
        </div>

        <div className={`p-4 rounded-2xl border ${bgCard} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rounds Completed</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${textHeader}`}>{DEBATE_LIST.length}</span>
            <span className="text-xs font-medium text-slate-400">Sessions</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">7 total recorded submissions</p>
        </div>

        <div className={`p-4 rounded-2xl border ${bgCard} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Personal Best</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{topGrade}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Junk Food Ban Policy Round</p>
        </div>

        <div className={`p-4 rounded-2xl border ${bgCard} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Pace</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${textHeader}`}>145</span>
            <span className="text-xs font-medium text-slate-400">WPM</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Optimal speaking speed range</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Completed', 'Scheduled', 'Drafts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab 
                ? 'bg-purple-600 text-white shadow-xs' 
                : isDark 
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Debates List with Expandable Report Cards */}
      <div className="space-y-3">
        {filteredList.map((item) => {
          const isExpanded = expandedId === item.id;
          const r = item.report;

          return (
            <div 
              key={item.id} 
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark 
                  ? 'bg-[#1E1B2B]/90 border-slate-800 shadow-xl' 
                  : 'bg-white border-slate-200 shadow-md'
              }`}
            >
              {/* Header row */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-500/5 transition-colors`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-sm ${textHeader}`}>{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${r.gradeColor}`}>
                      Grade: {r.grade}
                    </span>
                  </div>
                  <p className={`text-[11px] flex items-center gap-1.5 flex-wrap ${textSub}`}>
                    <span>{item.format}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">{item.status}</span>
                    <span>•</span>
                    <span>Side: {item.side}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    <span>•</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReportModal(item);
                      }}
                      className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Full Report Card
                    </button>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-purple-600 dark:text-purple-400 font-mono font-black text-base block">
                      {item.score}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Overall Score</span>
                  </div>
                  <button 
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isDark ? 'border-slate-700 bg-slate-800/60 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Inline Expanded Report Card Summary */}
              {isExpanded && (
                <div className={`p-4 border-t space-y-4 ${
                  isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeader}`}>
                        AI Evaluation Report Card Summary
                      </h4>
                    </div>
                    <button 
                      onClick={() => setSelectedReportModal(item)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      Open Modal Report <FileText className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Overall Summary Narrative */}
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <p className="font-semibold text-purple-400 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Judge Summary:
                    </p>
                    <p>{r.overallSummary}</p>
                  </div>

                  {/* 4 Score Metrics Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className={textSub}>Clarity & Articulation</span>
                        <span className="font-bold text-indigo-400">{r.metrics.clarity}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.metrics.clarity}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className={textSub}>Evidence & Citation</span>
                        <span className="font-bold text-purple-400">{r.metrics.evidence}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${r.metrics.evidence}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className={textSub}>Logical Reasoning</span>
                        <span className="font-bold text-emerald-400">{r.metrics.reasoning}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.metrics.reasoning}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className={textSub}>Structure & Flow</span>
                        <span className="font-bold text-amber-400">{r.metrics.structure}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${r.metrics.structure}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    }`}>
                      <h5 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                      </h5>
                      <ul className="space-y-1 list-disc list-inside text-[11px]">
                        {r.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}>
                      <h5 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Priority Focus Areas
                      </h5>
                      <ul className="space-y-1 list-disc list-inside text-[11px]">
                        {r.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quick Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-700/30">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Fallacies Detected: <strong className="text-white">{r.fallaciesCount}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Speech Pace: <strong className="text-white">{r.speechPace} WPM</strong>
                    </span>
                    <button 
                      onClick={() => setSelectedReportModal(item)}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors"
                    >
                      View Complete Audit Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Report Card Modal Overlay */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-700/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${selectedReportModal.report.gradeColor}`}>
                    Grade: {selectedReportModal.report.grade} ({selectedReportModal.score}%)
                  </span>
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {selectedReportModal.format}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold tracking-tight">{selectedReportModal.title}</h3>
                <p className="text-xs text-slate-400">
                  Recorded on {selectedReportModal.date} • Stance: <strong className="text-slate-200">{selectedReportModal.side}</strong>
                </p>
              </div>

              <button 
                onClick={() => setSelectedReportModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Executive Summary */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Evaluation Report Card Summary
              </h4>
              <p className="text-xs leading-relaxed opacity-90">{selectedReportModal.report.overallSummary}</p>
            </div>

            {/* Detailed Metric Scores */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Clarity & Articulation</span>
                    <span className="text-indigo-400">{selectedReportModal.report.metrics.clarity}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/40 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedReportModal.report.metrics.clarity}%` }} />
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Evidence & Citation</span>
                    <span className="text-purple-400">{selectedReportModal.report.metrics.evidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/40 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedReportModal.report.metrics.evidence}%` }} />
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Logical Reasoning</span>
                    <span className="text-emerald-400">{selectedReportModal.report.metrics.reasoning}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/40 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedReportModal.report.metrics.reasoning}%` }} />
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Structure & Flow</span>
                    <span className="text-amber-400">{selectedReportModal.report.metrics.structure}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/40 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedReportModal.report.metrics.structure}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Key Strengths
                </h5>
                <ul className="space-y-1.5 list-disc list-inside text-xs">
                  {selectedReportModal.report.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Recommendations for Growth
                </h5>
                <ul className="space-y-1.5 list-disc list-inside text-xs">
                  {selectedReportModal.report.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Judge Commentary */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Head Judge Evaluation Remarks
              </h5>
              <p className="text-xs leading-relaxed italic opacity-90">
                "{selectedReportModal.report.judgeNotes}"
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t pt-4 border-slate-700/50">
              <button 
                onClick={() => {
                  PDFReportService.exportDebateSessionPDF({
                    id: `DEB-${selectedReportModal.id}`,
                    topic: selectedReportModal.title,
                    format: selectedReportModal.format,
                    stance: selectedReportModal.side,
                    score: selectedReportModal.score,
                    date: selectedReportModal.date,
                    aggregateBreakdown: {
                      argumentQuality: selectedReportModal.report.metrics.reasoning || 85,
                      evidenceUsage: selectedReportModal.report.metrics.evidence || 80,
                      logicalConsistency: selectedReportModal.report.metrics.reasoning || 85,
                      rebuttalEffectiveness: selectedReportModal.report.metrics.structure || 80,
                      communicationSkills: selectedReportModal.report.metrics.clarity || 85,
                    },
                    turns: [
                      {
                        id: `turn_${selectedReportModal.id}_1`,
                        turnNumber: 1,
                        speaker: 'user',
                        userSpeech: `${selectedReportModal.title} - ${selectedReportModal.side} stance constructive speech. Key focus: ${selectedReportModal.report.keyHighlight}`,
                        aiRebuttal: `Counter-argument addressing the ${selectedReportModal.side.toLowerCase()} position with structured rebuttal agility and evidentiary challenges.`,
                        scores: {
                          argumentQuality: selectedReportModal.report.metrics.reasoning,
                          evidenceUsage: selectedReportModal.report.metrics.evidence,
                          logicalConsistency: selectedReportModal.report.metrics.reasoning,
                          rebuttalEffectiveness: selectedReportModal.report.metrics.structure,
                          communicationSkills: selectedReportModal.report.metrics.clarity,
                          weightedTotal: selectedReportModal.score
                        }
                      }
                    ]
                  }, {
                    coachNotes: selectedReportModal.report.judgeNotes
                  });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> Export PDF Report
              </button>

              <button 
                onClick={() => {
                  setSelectedReportModal(null);
                  onStartNewDebate();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Practice This Topic Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

