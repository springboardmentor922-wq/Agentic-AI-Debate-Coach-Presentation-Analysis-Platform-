import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { ActivityChart, ScoreRing, SkillBars } from "../../components/PerformanceVisuals";

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id === "latest") {
        const saved = sessionStorage.getItem("latestDebateReport");
        if (saved) setReport(JSON.parse(saved));
        setLoading(false); return;
      }
      try { const response = await api.get(`/analysis/history/${id}`); setReport(response.data); }
      catch { setReport(null); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">Loading report…</div>;
  if (!report) return <div className="grid min-h-screen place-items-center bg-slate-50 text-center"><div><h1 className="text-2xl font-bold text-slate-900">Report not found</h1><Link to="/learner" className="mt-3 inline-block font-semibold text-blue-700">Return to dashboard</Link></div></div>;

  const feedback = report.feedback || {};
  const fallacy = report.fallacy_analysis || { fallacy_type: report.fallacy_type, explanation: report.explanation };
  const suggestions = Array.isArray(feedback.feedback) ? feedback.feedback : String(report.feedback || "").split("\n").filter(Boolean);
  const score = report.overall_score || 0;
  const transcript = report.transcript || [];

  return <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><div><Link to="/learner" className="text-sm font-semibold text-blue-700">← Dashboard</Link><h1 className="mt-1 text-xl font-bold text-slate-900">Debate performance report</h1></div><Link to="/debate" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Start another debate</Link></div></header>
    <main className="mx-auto max-w-6xl p-5 sm:p-8"><section className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl sm:p-9"><p className="text-xs font-bold tracking-[0.2em] text-blue-200">SESSION COMPLETE</p><h2 className="mt-3 max-w-3xl text-2xl font-bold sm:text-3xl">{report.settings?.topic || "Your debate analysis"}</h2><div className="mt-5 flex flex-wrap gap-2 text-sm">{[report.settings?.level, report.settings?.mode, report.settings?.format, report.settings?.side && `${report.settings.side} the motion`].filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1.5 text-slate-200">{tag}</span>)}</div></section>
      <section className="mt-7 grid gap-7 lg:grid-cols-2"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Your score</h2><div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around"><ScoreRing score={score} /><div className="max-w-xs text-sm leading-6 text-slate-600"><p className="font-semibold text-slate-800">What this means</p><p className="mt-1">{score >= 8 ? "A strong, well-balanced case. Keep adding precise evidence." : score >= 6 ? "A solid foundation. Focus on sharper evidence and rebuttals." : "You have a starting point. Build each claim with a reason and an example."}</p></div></div></div><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-bold text-slate-900">Skill breakdown</h2><SkillBars scores={feedback} /></div></section>
      <section className="mt-7 grid gap-7 lg:grid-cols-5"><div className="lg:col-span-3"><ActivityChart scores={[feedback.clarity_score, feedback.logic_score, feedback.persuasiveness_score, feedback.grammar_score].filter(Boolean)} /></div><div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 lg:col-span-2"><p className="text-xs font-bold tracking-widest text-amber-700">REASONING CHECK</p><h2 className="mt-2 text-lg font-bold text-slate-900">{fallacy.fallacy_type || "No fallacy identified"}</h2><p className="mt-3 text-sm leading-6 text-slate-700">{fallacy.explanation || "Your argument did not contain a clearly identified logical fallacy."}</p></div></section>
      <section className="mt-7 grid gap-7 lg:grid-cols-2"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Coach recommendations</h2><ul className="mt-4 space-y-3">{suggestions.length ? suggestions.map((suggestion, index) => <li key={index} className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{suggestion}</li>) : <li className="text-sm text-slate-500">Complete another session to receive targeted recommendations.</li>}</ul></div><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">AI opponent’s countercase</h2><p className="mt-4 text-sm leading-7 text-slate-700">{report.counter_argument?.counterargument || report.counter_argument || "No counterargument was recorded."}</p>{report.counter_argument?.supporting_points?.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">{report.counter_argument.supporting_points.map((point) => <li key={point}>{point}</li>)}</ul>}</div></section>
      {transcript.length > 0 && <section className="mt-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Session transcript</h2><div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-2">{transcript.map((item) => <div key={item.id} className={`rounded-xl p-4 text-sm leading-6 ${item.kind === "user" ? "ml-auto max-w-3xl bg-blue-700 text-white" : "max-w-3xl bg-slate-50 text-slate-700"}`}><p className={`mb-1 text-xs font-bold ${item.kind === "user" ? "text-blue-100" : "text-blue-700"}`}>{item.author}</p>{item.text}</div>)}</div></section>}</main></div>;
}
