import React, { useState } from 'react';
import { 
  MessageSquareCode, 
  Sparkles, 
  Filter, 
  Copy, 
  Check, 
  Swords, 
  RefreshCw, 
  Zap, 
  FileCode2, 
  ThumbsUp, 
  Target, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { generateCounterargumentsApi } from '../../services/apiClient';

interface RebuttalItem {
  type: string;
  text: string;
  strength: string;
}

const PRESET_CLAIMS = [
  {
    motion: 'Should social media platforms be regulated by independent governmental bodies?',
    claim: 'While regulation may reduce online harassment, it threatens free speech and invites state control.'
  },
  {
    motion: 'Universal Basic Income Implementations',
    claim: 'UBI creates a workforce disincentive that reduces economic productivity and encourages laziness.'
  },
  {
    motion: 'Artificial Intelligence Regulation',
    claim: 'Pausing frontier AI development will allow rogue nations to surpass democratic societies in cyber warfare.'
  },
  {
    motion: 'Nuclear Energy Expansion',
    claim: 'Nuclear waste disposal presents unmanageable multi-generational environmental hazards.'
  }
];

export const CounterargumentGeneratorView: React.FC = () => {
  const [motion, setMotion] = useState('Should social media platforms be regulated by independent governmental bodies?');
  const [claimText, setClaimText] = useState('While regulation may reduce online harassment, it threatens free speech and invites state control.');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Logical' | 'Evidence-Based' | 'Ethical' | 'Policy'>('All');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [counterpoints, setCounterpoints] = useState<RebuttalItem[]>([
    {
      type: 'Logical Angle',
      text: 'Free speech is not absolute when it directly harms public safety. Regulating platform algorithms is not censoring speech, but curating accountable public squares.',
      strength: 'High'
    },
    {
      type: 'Evidence-Based Angle',
      text: 'Studies from Germany’s NetzDG law show that platform compliance increased user safety without reducing overall political discourse or opposition voices.',
      strength: 'Empirical'
    },
    {
      type: 'Ethical Angle',
      text: 'Private corporations currently wield unchecked power over democratic elections. Independent public oversight restores democratic accountability to citizens.',
      strength: 'Strong'
    },
    {
      type: 'Policy Angle',
      text: 'Regulations can mandate algorithmic transparency reports rather than content removal, protecting individual expression while dismantling toxic engagement loops.',
      strength: 'Feasible'
    }
  ]);

  const handleGenerateRebuttals = async (overrideMotion?: string, overrideClaim?: string) => {
    const currentMotion = overrideMotion !== undefined ? overrideMotion : motion;
    const currentClaim = overrideClaim !== undefined ? overrideClaim : claimText;

    if (!currentClaim.trim()) return;

    setIsLoading(true);
    try {
      const res = await generateCounterargumentsApi(currentMotion, currentClaim);
      if (res && res.rebuttals && res.rebuttals.length > 0) {
        setCounterpoints(res.rebuttals);
      }
    } catch (err) {
      console.error('Counterargument generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_CLAIMS[0]) => {
    setMotion(preset.motion);
    setClaimText(preset.claim);
    handleGenerateRebuttals(preset.motion, preset.claim);
  };

  const filtered = activeFilter === 'All' ? counterpoints : counterpoints.filter(c => c.type.includes(activeFilter));

  const handleCopy = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner introducing Agent 2: The Rival */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/30 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Milestone 3 • Part 2: Agent 2 - The Rival Opponent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Counterargument & Rebuttal Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Agent 2 operates as your charismatic sparring partner. Operating at <strong className="text-amber-200">0.7 Temperature</strong>, it crafts persuasive, multi-perspective rebuttals across logical, empirical, ethical, and policy dimensions.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs">
              <Swords className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-slate-300">Temp: 0.7 (Creative Rival)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FileCode2 className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-slate-300">Model: Gemini 3.6 Flash</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Agent 2 Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Presets */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Generate Rebuttals</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input any opponent assertion to generate targeted counterarguments
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Debate Motion / Topic</label>
                <input
                  type="text"
                  value={motion}
                  onChange={(e) => setMotion(e.target.value)}
                  placeholder="e.g. Should social media platforms be regulated?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Opponent Claim to Rebut</span>
                  <span className="text-[11px] font-normal text-slate-400">{claimText.length} chars</span>
                </label>
                <textarea
                  rows={3}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Paste or type opponent claim here..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={() => handleGenerateRebuttals()}
              disabled={isLoading || !claimText.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate 4-Angle Rebuttals with Agent 2</span>
            </button>
          </div>

          {/* Quick Preset Claims */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Sample Opponent Claims
              </h3>
              <span className="text-[11px] text-slate-400">Click to auto-generate</span>
            </div>

            <div className="space-y-2">
              {PRESET_CLAIMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase font-mono truncate">
                      {preset.motion}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                      "{preset.claim}"
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Rebuttal Cards Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                Agent 2 Rebuttal Perspectives ({filtered.length})
              </h3>

              {/* Perspective Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['All', 'Logical', 'Evidence-Based', 'Ethical', 'Policy'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      activeFilter === f
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Agent 2 Rival Engine Formulating Rebuttals...</p>
              <p className="text-[11px] text-slate-400">Synthesizing logical, empirical, ethical, and policy angles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((cp, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        {cp.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Strength: {cp.strength}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(cp.text, idx)}
                      className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-semibold"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIdx === idx ? 'Copied' : 'Copy Rebuttal'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 font-serif italic">
                    "{cp.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
