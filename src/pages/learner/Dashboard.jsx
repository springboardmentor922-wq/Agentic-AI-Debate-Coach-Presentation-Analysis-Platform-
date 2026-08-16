import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight, FaBell, FaBolt, FaBookOpen, FaBrain, FaCalendarAlt,
  FaChartLine, FaCheckCircle, FaClock, FaFire, FaMedal, FaSearch,
  FaSyncAlt, FaTrophy,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import ChatBot from "../../components/chatbot/ChatBot";
import api from "../../services/api";

const demoScores = [5.8, 6.3, 6.8, 7.2, 7.7, 8.2];

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const [historyResult, profileResult] = await Promise.allSettled([
      api.get("/analysis/history"), api.get("/profile/"),
    ]);
    if (historyResult.status === "fulfilled") setHistory(historyResult.value.data || []);
    if (profileResult.status === "fulfilled") setProfile(profileResult.value.data);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = window.setInterval(() => loadDashboard({ silent: true }), 15000);
    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const scores = history.map((item) => Number(item.overall_score) || 0).filter(Boolean);
    const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const skills = Math.min(6, new Set(history.map((item) => item.fallacy_type || "Argument structure")).size);
    return { sessions: history.length, average, skills, streak: Math.max(1, Math.min(7, history.length + 1)), scores };
  }, [history]);

  const name = profile?.name || profile?.full_name || localStorage.getItem("email")?.split("@")[0] || "Debater";
  const firstName = name.charAt(0).toUpperCase() + name.slice(1);
  const scores = metrics.scores.length ? metrics.scores.slice(-6) : demoScores;
  const recent = history.slice(0, 4);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/learner/history${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  };
  const showNotice = (text) => { setNotice(text); window.setTimeout(() => setNotice(""), 2600); };

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-800 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div><h1 className="text-lg font-bold text-slate-900">Learner Dashboard</h1><p className="text-xs text-slate-400">Your debate practice hub</p></div>
          <form onSubmit={submitSearch} className="hidden w-full max-w-sm items-center rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 md:flex"><FaSearch className="text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent px-3 py-2.5 text-xs outline-none" placeholder="Search debates, topics, sessions..." /></form>
          <div className="flex items-center gap-3"><button onClick={() => showNotice("You’re all caught up!")} className="relative rounded-full p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600" aria-label="Notifications"><FaBell /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" /></button><div className="hidden text-right sm:block"><p className="text-sm font-bold">Hi, {firstName}</p><p className="text-xs text-slate-400">Learner</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 font-bold text-violet-700">{firstName[0]}</div></div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-7">
          {notice && <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">{notice}</div>}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-violet-100 to-indigo-100 px-6 py-6 sm:px-8">
            <div className="relative z-10 max-w-xl"><h2 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}! <span aria-hidden="true">👋</span></h2><p className="mt-1 text-sm text-slate-600">Keep practicing, keep improving.</p><p className="mt-3 text-sm font-medium text-slate-700">You’re on the path to becoming an excellent communicator!</p><button onClick={() => navigate("/debate")} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700">Start a debate <FaArrowRight /></button></div><div className="absolute -right-4 -bottom-8 hidden h-44 w-44 rounded-full border-[22px] border-white/40 lg:block" /><FaBrain className="absolute right-14 top-7 hidden text-6xl text-violet-400/60 lg:block" />
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<FaTrophy />} color="violet" value={metrics.sessions} label="Debates Participated" detail="Live from your history" />
            <Stat icon={<FaChartLine />} color="blue" value={metrics.average ? `${metrics.average.toFixed(1)}/10` : "—"} label="Average Score" detail={metrics.average ? "Across completed analyses" : "Complete your first debate"} />
            <Stat icon={<FaMedal />} color="emerald" value={metrics.skills} label="Skills Improved" detail="Topics and reasoning checks" />
            <Stat icon={<FaFire />} color="orange" value={`${metrics.streak} days`} label="Current Streak" detail="Keep your momentum going" />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-3">
            <Panel className="xl:col-span-1" title="Performance Overview" action={<button onClick={() => loadDashboard()} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"><FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh</button>}><ScoreChart scores={scores} /></Panel>
            <Panel title="Upcoming Sessions" action={<button onClick={() => navigate("/debate")} className="text-xs font-semibold text-violet-600">Plan one</button>}><div className="space-y-3"><Session title="Policy Debate Practice" subtitle="Topic: Should social media be regulated?" time="Start now" onClick={() => navigate("/debate")} /><Session title="AI Debate Simulation" subtitle="Difficulty: Intermediate" time="Try next" onClick={() => navigate("/debate")} /></div></Panel>
            <Panel title="Skill Progress" action={<Link to="/learner/history" className="text-xs font-semibold text-violet-600">View all</Link>}><SkillProgress average={metrics.average} /></Panel>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-3">
            <Panel title="Recent Activity" action={<Link to="/learner/history" className="text-xs font-semibold text-violet-600">View all</Link>}><div className="space-y-3">{recent.length ? recent.map((item) => <Link key={item.id} to={`/learner/report/${item.id}`} className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-violet-50"><FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" /><div className="min-w-0"><p className="truncate text-xs font-semibold">Debate analysis completed</p><p className="truncate text-xs text-slate-500">{item.argument}</p></div><span className="ml-auto text-xs font-bold text-violet-600">{item.overall_score}/10</span></Link>) : <Empty text="Complete a debate to see live activity here." />}</div></Panel>
            <Panel title="Your Goals" action={<button onClick={() => showNotice("Goals are automatically updated from your completed analyses.")} className="text-xs font-semibold text-violet-600">How it works</button>}><div className="space-y-5"><Goal label="Improve Argument Quality" value={Math.min(100, Math.round(metrics.average * 10))} color="bg-emerald-500" /><Goal label="Speak More Confidently" value={Math.min(100, 35 + metrics.sessions * 8)} color="bg-violet-500" /><Goal label="Reduce Filler Words" value={Math.min(100, 25 + metrics.sessions * 6)} color="bg-blue-500" /></div></Panel>
            <Panel title="Recommended For You" action={<button onClick={() => navigate("/debate")} className="text-xs font-semibold text-violet-600">View all</button>}><div className="space-y-2"><Recommendation icon={<FaBolt />} title="Practice: Counterargument Drills" text="Sharpen your rebuttal skills" onClick={() => navigate("/debate")} /><Recommendation icon={<FaBookOpen />} title="Lesson: Logical Fallacies 101" text="Learn common fallacies with examples" onClick={() => navigate("/learner/analyze")} /><Recommendation icon={<FaClock />} title="Exercise: Impromptu Speaking" text="Improve your thinking on your feet" onClick={() => navigate("/debate")} /></div></Panel>
          </section>
        </div>
        <ChatBot />
      </main>
    </div>
  );
}

function Panel({ title, action, className = "", children }) { return <section className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-800">{title}</h2>{action}</div>{children}</section>; }
function Stat({ icon, color, value, label, detail }) { const colors = { violet: "bg-violet-100 text-violet-600", blue: "bg-blue-100 text-blue-600", emerald: "bg-emerald-100 text-emerald-600", orange: "bg-orange-100 text-orange-600" }; return <article className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${colors[color]}`}>{icon}</span><div><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-0.5 text-[10px] text-slate-400">{detail}</p></div></article>; }
function Session({ title, subtitle, time, onClick }) { return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100 text-violet-600"><FaCalendarAlt /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">{title}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{subtitle}</span></span><span className="rounded bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-600">{time}</span></button>; }
function ScoreChart({ scores }) { const min = Math.min(...scores, 0); const max = Math.max(...scores, 10); const points = scores.map((score, index) => `${10 + index * (250 / Math.max(1, scores.length - 1))},${110 - ((score - min) / Math.max(1, max - min)) * 90}`).join(" "); return <><svg viewBox="0 0 270 125" className="h-40 w-full" aria-label="Performance score trend"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#8b5cf6" stopOpacity=".25"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>{[20, 50, 80, 110].map((y) => <line key={y} x1="10" x2="260" y1={y} y2={y} stroke="#e9eaf0" strokeDasharray="3 3" />)}<polygon points={`${points} 260,110 10,110`} fill="url(#fill)"/><polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinejoin="round"/>{scores.map((score, i) => <circle key={i} cx={10 + i * (250 / Math.max(1, scores.length - 1))} cy={110 - ((score - min) / Math.max(1, max - min)) * 90} r="4" fill="#7c3aed" />)}</svg><p className="text-center text-xs text-slate-400">Average score across your latest sessions</p></>; }
function SkillProgress({ average }) { const items = [["Argument Quality", average ? average * 10 : 0], ["Confidence", Math.min(100, 45 + average * 5)], ["Communication", Math.min(100, 38 + average * 6)], ["Logical Consistency", Math.min(100, 40 + average * 5)]]; return <div className="space-y-4">{items.map(([label, value]) => <Goal key={label} label={label} value={Math.round(value)} color="bg-violet-500" />)}</div>; }
function Goal({ label, value, color }) { return <div><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-600">{label}</span><span className="font-bold text-slate-500">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} /></div></div>; }
function Recommendation({ icon, title, text, onClick }) { return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-slate-100 p-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50"><span className="text-lg text-violet-500">{icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold">{title}</span><span className="block truncate text-[11px] text-slate-500">{text}</span></span><FaArrowRight className="text-xs text-slate-400" /></button>; }
function Empty({ text }) { return <p className="rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500">{text}</p>; }
