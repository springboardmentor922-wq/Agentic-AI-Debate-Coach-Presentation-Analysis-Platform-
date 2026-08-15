import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  HelpCircle,
  BookOpen,
  Scale,
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  Flame,
  FileCode2
} from 'lucide-react';
import { analyzeFallacyApi } from '../../services/apiClient';
import { FallacyReportSchema } from '../../types';

interface PresetExample {
  title: string;
  type: string;
  text: string;
  badgeColor: string;
}

const PRESET_EXAMPLES: PresetExample[] = [
  {
    title: 'Ad Hominem Attack',
    type: 'Ad Hominem',
    text: "My opponent claims we need tax reform, but he couldn't even manage his own campaign budget!",
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-700'
  },
  {
    title: 'False Dilemma',
    type: 'False Dilemma',
    text: "Either we ban all fossil fuels immediately by tomorrow, or the planet will face total destruction in 5 years!",
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700'
  },
  {
    title: 'Straw Man Fallacy',
    type: 'Straw Man',
    text: "My opponent wants to reduce defense spending, which means they want our nation to be completely defenseless against foreign invaders!",
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700'
  },
  {
    title: 'Slippery Slope',
    type: 'Slippery Slope',
    text: "If we allow students to use laptops in class, next thing you know nobody will study, grades will plunge, and universities will collapse!",
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-700'
  },
  {
    title: 'Valid Empirical Logic',
    type: 'None',
    text: "Peer-reviewed economic studies show that investing in early childhood education increases long-term workforce productivity and reduces public expenditure.",
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  }
];

const TAXONOMY_RULES = [
  {
    name: 'Ad Hominem',
    description: 'Attacking the opponent’s personal background, morality, or status rather than refuting their argument.',
    penalty: '15 Pts Foul',
    severity: 'High'
  },
  {
    name: 'Straw Man',
    description: 'Distorting, oversimplifying, or exaggerating an argument to make it easier to attack.',
    penalty: '10 Pts Foul',
    severity: 'Medium'
  },
  {
    name: 'False Dilemma',
    description: 'Presenting two extreme options as the only choices while ignoring viable middle grounds.',
    penalty: '10 Pts Foul',
    severity: 'Medium'
  },
  {
    name: 'Slippery Slope',
    description: 'Claiming an initial small step inevitably leads to a chain of disastrous consequences without proof.',
    penalty: '12 Pts Foul',
    severity: 'High'
  },
  {
    name: 'Circular Reasoning',
    description: 'Using the premise itself as the conclusion without providing independent proof.',
    penalty: '8 Pts Foul',
    severity: 'Medium'
  },
  {
    name: 'Red Herring',
    description: 'Introducing an irrelevant secondary topic to divert attention from the primary motion.',
    penalty: '10 Pts Foul',
    severity: 'Medium'
  }
];

export const FallacyDetectorView: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    "My opponent claims we need tax reform, but he couldn't even manage his own campaign budget!"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'auditor' | 'taxonomy'>('auditor');
  const [report, setReport] = useState<FallacyReportSchema>({
    fallacy_detected: true,
    fallacy_type: 'Ad Hominem',
    offending_text: "he couldn't even manage his own campaign budget!",
    explanation: "Attacking personal campaign history or character rather than addressing the substance of tax policy.",
    counter_strategy: "Expose the personal attack foul immediately and refocus debate on empirical policy data.",
    severity: 'High',
    penalty_points: 15,
    confidence_score: 98
  });

  const handleDetect = async (overrideText?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : inputText;
    if (!textToAnalyze.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await analyzeFallacyApi(textToAnalyze);
      setReport(res);
    } catch (err) {
      console.error('Fallacy audit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (example: PresetExample) => {
    setInputText(example.text);
    handleDetect(example.text);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner introducing Agent 1: The Referee */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Logical Fallacy Detection & Logic Audit Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Provides objective, deterministic logic validation in real-time debate simulations. Identifies formal and informal reasoning flaws, flags fouls, calculates penalty points, and outlines tactical counter-strategies.
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-rose-700/50">
          <button
            onClick={() => setActiveTab('auditor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'auditor'
                ? 'bg-white text-rose-950 shadow-md'
                : 'bg-rose-950/50 text-rose-200 hover:bg-rose-900/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            Live Argument Auditor
          </button>
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'taxonomy'
                ? 'bg-white text-rose-950 shadow-md'
                : 'bg-rose-950/50 text-rose-200 hover:bg-rose-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Fallacy Taxonomy Matrix ({TAXONOMY_RULES.length})
          </button>
        </div>
      </div>

      {activeTab === 'auditor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Input & Audit Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Argument Logic</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Submit any debate turn statement for instant Referee analysis
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  JSON Schema Enforced
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Debate Statement / Argument Text</span>
                  <span className="text-[11px] font-normal text-slate-400">{inputText.length} chars</span>
                </label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type a debate argument here..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleDetect()}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Audit Statement with Agent 1 Referee
                </button>

                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                >
                  Clear Input
                </button>
              </div>
            </div>

            {/* Quick Preset Test Suite */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Quick Test Suite Examples
                </h3>
                <span className="text-[11px] text-slate-400">Click any preset to audit</span>
              </div>

              <div className="space-y-2">
                {PRESET_EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(ex)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${ex.badgeColor}`}>
                          {ex.type}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {ex.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate font-mono">
                        "{ex.text}"
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Result Report Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Referee Audit Output</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                  Status: {isLoading ? 'Evaluating...' : 'Ready'}
                </span>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Agent 1 Referee Analyzing Logic...</p>
                  <p className="text-[11px] text-slate-400">Running deterministic classification against fallacy taxonomy</p>
                </div>
              ) : report ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                    report.fallacy_detected 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {report.fallacy_detected ? (
                        <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm">
                          {report.fallacy_detected ? `FOUL FLAGGED: ${report.fallacy_type}` : 'VALID LOGIC PASSED'}
                        </h4>
                        <p className="text-[11px] opacity-90">
                          {report.fallacy_detected ? 'Logical inconsistency detected in turn' : 'No fallacies detected in argument premises'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Severity</span>
                      <span className={`text-xs font-extrabold ${
                        report.severity === 'High' || report.severity === 'Critical' ? 'text-rose-600 dark:text-rose-400' :
                        report.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {report.severity || (report.fallacy_detected ? 'High' : 'Low')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Foul Penalty</span>
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                        -{report.penalty_points || (report.fallacy_detected ? 15 : 0)} Pts
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Confidence</span>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {report.confidence_score || 96}%
                      </span>
                    </div>
                  </div>

                  {/* Detailed Breakdowns */}
                  {report.fallacy_detected && report.offending_text && (
                    <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                        Offending Substring / Foul Highlight
                      </span>
                      <p className="text-xs font-mono font-bold text-rose-900 dark:text-rose-200">
                        "{report.offending_text}"
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Referee Analysis & Explanation
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {report.explanation || 'The argument follows valid logical flow.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Tactical Remediation & Counter Strategy
                    </span>
                    <p className="text-xs text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
                      {report.counter_strategy || 'Refocus debate directly on core empirical premises.'}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        /* Fallacy Taxonomy Matrix Tab */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Agent 1 Logical Fallacy Taxonomy</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Standardized logical foul rules enforced during live debate turns
                </p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                Referee Enforcement Matrix
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TAXONOMY_RULES.map((rule, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{rule.name}</h3>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-900">
                      {rule.penalty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {rule.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Severity Level:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rule.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
