import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ArgumentAnalyzerView: React.FC = () => {
  const [argumentText, setArgumentText] = useState(
    'Investing in public transportation reduces traffic congestion, decreases urban carbon emissions, and provides low-income citizens with essential job accessibility.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>({
    claimsIdentified: ['Reduces traffic congestion', 'Decreases carbon emissions', 'Provides job accessibility'],
    evidenceFound: ['Links public transport investment directly to environmental & economic benefits.'],
    argumentStrength: 'Strong (88/100)',
    reasoningQuality: 'Good',
    suggestions: ['Include statistical data on exact carbon emission percentage reductions to reach 95+ score.']
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult({
        claimsIdentified: [
          'Claim 1: Reduces traffic congestion',
          'Claim 2: Lowers urban carbon footprint',
          'Claim 3: Enhances socioeconomic mobility for low-income citizens'
        ],
        evidenceFound: ['Logical deduction connecting transit access to job markets.'],
        argumentStrength: 'Strong (90/100)',
        reasoningQuality: 'High Logical Consistency',
        suggestions: ['Cite empirical city case studies (e.g., London Congestion Charge) to substantiate claims.']
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Argument Analyzer Engine</h2>
            <p className="text-xs text-slate-500">Extracts core claims, evidence, logical strength, and reasoning quality</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Paste Your Argument Text Here</label>
          <textarea
            rows={4}
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" /> Analyze Argument Structure
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Claims & Structure Identified
            </h3>
            <ul className="space-y-2 text-xs">
              {result.claimsIdentified.map((c: string, i: number) => (
                <li key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Quality & AI Recommendations</h3>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
              <p className="text-[11px] font-bold text-indigo-900">Argument Strength: {result.argumentStrength}</p>
              <p className="text-[11px] text-indigo-800">Reasoning Quality: {result.reasoningQuality}</p>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold">Improvement Suggestion:</p>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {result.suggestions[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
