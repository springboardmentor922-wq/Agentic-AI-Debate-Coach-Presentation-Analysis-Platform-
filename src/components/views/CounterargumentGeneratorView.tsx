import React, { useState } from 'react';
import { MessageSquareCode, Sparkles, Filter, Copy, Check } from 'lucide-react';

export const CounterargumentGeneratorView: React.FC = () => {
  const [motion, setMotion] = useState('Should social media platforms be regulated by independent governmental bodies?');
  const [claimText, setClaimText] = useState('While regulation may reduce online harassment, it threatens free speech and invites state control.');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Logical' | 'Evidence-Based' | 'Ethical' | 'Policy'>('All');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const counterpoints = [
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
  ];

  const filtered = activeFilter === 'All' ? counterpoints : counterpoints.filter(c => c.type.includes(activeFilter));

  const handleCopy = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Counterargument & Rebuttal Generator (Agent 2 Rival)</h2>
            <p className="text-xs text-slate-500">Generates multi-perspective counter-positions for any topic or claim</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700">Debate Motion / Topic</label>
            <input
              type="text"
              value={motion}
              onChange={(e) => setMotion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Opponent Claim to Rebut</label>
            <textarea
              rows={2}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        {/* Perspective Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Perspective:
          </span>
          {(['All', 'Logical', 'Evidence-Based', 'Ethical', 'Policy'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeFilter === f
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Rebuttal Cards */}
      <div className="space-y-4">
        {filtered.map((cp, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-violet-200 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                {cp.type}
              </span>
              <button
                onClick={() => handleCopy(cp.text, idx)}
                className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1 font-medium"
              >
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIdx === idx ? 'Copied' : 'Copy Rebuttal'}
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">"{cp.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};
