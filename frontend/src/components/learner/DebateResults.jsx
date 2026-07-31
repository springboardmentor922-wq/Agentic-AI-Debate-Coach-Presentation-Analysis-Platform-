import React from 'react';
import { 
  CheckCircle, MessageSquare, Bot, AlertTriangle, Lightbulb, 
  Award, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

export const DebateResults = ({ results, onReset }) => {
  const analysis = results.analysis || {};

  const metrics = [
    { title: 'Confidence', score: (analysis.confidence || 0) * 10, classGradient: 'progress-gradient-indigo' },
    { title: 'Fluency', score: (analysis.fluency || 0) * 10, classGradient: 'progress-gradient-cyan' },
    { title: 'Argument Strength', score: (analysis.argument_strength || 0) * 10, classGradient: 'progress-gradient-emerald' },
    { title: 'Communication', score: (analysis.communication || 0) * 10, classGradient: 'progress-gradient-amber' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header Banner */}
      <div className="glass-card p-6 border-indigo-500/40 flex items-center justify-between glow-indigo">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="badge-pill badge-pill-emerald mb-1">Evaluation Complete</span>
            <h2 className="font-display text-2xl font-black text-white">Speech Performance Scorecard</h2>
          </div>
        </div>

        <button onClick={onReset} className="btn-primary">
          Start New Session <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Scorecard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-card p-5 space-y-3 border-indigo-500/20">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{m.title}</span>
              <span className="text-white font-mono font-black text-sm">{m.score}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${m.classGradient}`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Transcripts Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Transcribed Argument */}
        <div className="glass-card p-6 space-y-3 border-indigo-500/30">
          <div className="flex items-center gap-2 text-indigo-300 font-display font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Your Transcribed Argument
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto font-mono">
            {results.transcript || "No transcript detected from speech recording."}
          </div>
        </div>

        {/* AI Opponent Counter Argument */}
        <div className="glass-card p-6 space-y-3 border-violet-500/30 bg-violet-950/10">
          <div className="flex items-center gap-2 text-violet-300 font-display font-bold text-sm">
            <Bot className="w-4 h-4 text-violet-400" /> AI Opponent Counter-Argument
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/20 text-xs text-violet-200 leading-relaxed max-h-48 overflow-y-auto font-mono">
            {results.ai_response || "AI opponent response not generated."}
          </div>
        </div>
      </div>

      {/* Fallacies & Improvement Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fallacies */}
        <div className="glass-card p-6 space-y-3 border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-300 font-display font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Detected Logical Fallacies
          </div>
          <div className="space-y-2">
            {Array.isArray(analysis.fallacies) && analysis.fallacies.length > 0 ? (
              analysis.fallacies.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
                Solid reasoning! No logical fallacies detected.
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="glass-card p-6 space-y-3 border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-300 font-display font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-cyan-400" /> Suggestions
          </div>
          <div className="space-y-2">
            {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900/60 text-xs text-slate-400">
                Continue practicing arguments with structured premises and evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
