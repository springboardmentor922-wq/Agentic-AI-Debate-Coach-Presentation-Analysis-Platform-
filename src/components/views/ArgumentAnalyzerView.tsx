import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ArgumentAnalyzerView: React.FC = () => {
  const { isDark } = useTheme();
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

  const cardBgClass = isDark
    ? 'bg-[#1E1B2B]/90 border-slate-800 text-white shadow-xl'
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6 pb-12">
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Argument Analyzer Engine</h2>
            <p className={`text-xs ${textMuted}`}>Extracts core claims, evidence, logical strength, and reasoning quality</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-xs font-bold ${textHeader}`}>Paste Your Argument Text Here</label>
          <textarea
            rows={4}
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
              isDark 
                ? 'bg-slate-900/80 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
            }`}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> {isAnalyzing ? 'Analyzing...' : 'Analyze Argument Structure'}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${textHeader}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Claims & Structure Identified
            </h3>
            <ul className="space-y-2 text-xs">
              {result.claimsIdentified.map((c: string, i: number) => (
                <li key={i} className={`p-2.5 rounded-xl border font-medium flex items-center gap-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>Quality & AI Recommendations</h3>
            <div className={`p-3 rounded-xl border space-y-1 ${
              isDark ? 'bg-indigo-950/60 border-indigo-800/60' : 'bg-indigo-50 border-indigo-200'
            }`}>
              <p className="text-[11px] font-bold text-indigo-500">Argument Strength: {result.argumentStrength}</p>
              <p className={`text-[11px] ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Reasoning Quality: {result.reasoningQuality}</p>
            </div>
            <div className="text-xs space-y-1">
              <p className={`font-bold ${textHeader}`}>Improvement Suggestion:</p>
              <p className={`p-3 rounded-xl border leading-relaxed ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {result.suggestions[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
