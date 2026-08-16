import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaPaperPlane, FaStop, FaVolumeUp } from "react-icons/fa";
import api from "../../services/api";

const TOPICS = [
  { title: "Should AI replace teachers?", area: "Technology & education" },
  { title: "Should social media be regulated for teenagers?", area: "Society & media" },
  { title: "Is nuclear energy essential for a sustainable future?", area: "Environment" },
  { title: "Should voting be compulsory?", area: "Civics & policy" },
  { title: "Should school uniforms be mandatory?", area: "Education & society" },
  { title: "Should governments ban single-use plastics?", area: "Environment" },
  { title: "Is remote work better than office work?", area: "Work & economy" },
  { title: "Should college education be free?", area: "Education & policy" },
  { title: "Can technology solve climate change?", area: "Technology & environment" },
  { title: "Should animals be used for scientific research?", area: "Ethics & science" },
  { title: "Should cities prioritize public transport over roads?", area: "Urban policy" },
  { title: "Is freedom of speech more important than preventing misinformation?", area: "Civics & media" },
  { title: "Should competitive sports be part of every school curriculum?", area: "Education & wellbeing" },
  { title: "Should governments regulate artificial intelligence?", area: "Technology & policy" },
];
const DURATIONS = [3, 5, 8, 10];

const initialOpponent = "I’m ready when you are. State your position clearly, support it with a reason or example, and I’ll challenge it fairly.";

export default function DebateSession() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("setup");
  const [settings, setSettings] = useState({ topic: TOPICS[0].title, customTopic: "", level: "Intermediate", mode: "Practice", duration: 5, format: "One-on-One", side: "For" });
  const [messages, setMessages] = useState([]);
  const [argument, setArgument] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);
  const finishRef = useRef(null);

  const userArguments = useMemo(() => messages.filter((message) => message.author === "You").map((message) => message.text), [messages]);

  useEffect(() => {
    if (stage !== "live" || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [stage, secondsLeft]);

  useEffect(() => { if (stage === "live" && secondsLeft === 0) finishRef.current?.(); }, [secondsLeft, stage]);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  function startDebate() {
    const selectedSettings = { ...settings, topic: settings.customTopic.trim() || settings.topic };
    setSettings(selectedSettings);
    setSecondsLeft(selectedSettings.duration * 60);
    setMessages([{ id: Date.now(), author: "AI opponent", text: initialOpponent, kind: "ai" }]);
    setStage("live");
  }

  async function sendArgument() {
    const text = argument.trim();
    if (!text || thinking) return;
    const newMessage = { id: Date.now(), author: "You", text, kind: "user" };
    setMessages((current) => [...current, newMessage]);
    setArgument("");
    setThinking(true);
    try {
      const response = await api.post("/analysis/counterargument", { text: `${settings.topic}\nLearner position: ${settings.side}\nArgument: ${text}` });
      const answer = response.data?.counterargument || "That is an interesting point. Can you add evidence that supports your reasoning?";
      setMessages((current) => [...current, { id: Date.now() + 1, author: "AI opponent", text: answer, points: response.data?.supporting_points, kind: "ai" }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, author: "AI opponent", text: "I could not respond just now. Keep developing your case and try sending the next point.", kind: "ai" }]);
    } finally { setThinking(false); }
  }

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { window.alert("Voice input is not available in this browser. You can continue with text input."); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; recognition.continuous = false; recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => setArgument(Array.from(event.results).map((result) => result[0].transcript).join(" "));
    recognitionRef.current = recognition; recognition.start();
  }

  function speak(text) { window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text)); }

  async function finishDebate() {
    if (endRef.current || stage !== "live") return;
    endRef.current = true; setStage("finishing"); recognitionRef.current?.stop();
    const fullArgument = userArguments.join("\n\n") || "No learner argument was submitted.";
    try {
      const response = await api.post("/analysis/analyze", { text: `Topic: ${settings.topic}\nLevel: ${settings.level}\nMode: ${settings.mode}\nPosition: ${settings.side}\n\nLearner arguments:\n${fullArgument}` });
      const report = { ...response.data, settings, transcript: messages, completedAt: new Date().toISOString() };
      sessionStorage.setItem("latestDebateReport", JSON.stringify(report));
      navigate("/learner/report/latest");
    } catch {
      endRef.current = false; setStage("live"); window.alert("We could not generate your report yet. Please check the API connection and try again.");
    }
  }

  finishRef.current = finishDebate;

  const clock = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  if (stage === "setup") return <Setup settings={settings} setSettings={setSettings} start={startDebate} />;
  if (stage === "finishing") return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" /><h1 className="mt-5 text-xl font-bold text-slate-900">Preparing your debate report</h1><p className="mt-2 text-slate-500">The AI is scoring your reasoning and building your analysis.</p></div></div>;

  return <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"><div><button onClick={() => navigate("/learner")} className="text-sm font-semibold text-blue-700">← Dashboard</button><h1 className="mt-1 text-lg font-bold text-slate-900">Live debate session</h1><p className="text-sm text-slate-500">{settings.level} · {settings.mode} · {settings.format}</p></div><div className="rounded-xl bg-slate-900 px-4 py-2 text-center text-white"><p className="text-xs text-slate-300">Time remaining</p><p className="font-mono text-xl font-bold">{clock}</p></div></div></header>
    <main className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><p className="text-xs font-bold tracking-widest text-blue-700">MOTION</p><h2 className="mt-1 text-xl font-bold text-slate-900">{settings.topic}</h2><p className="mt-1 text-sm text-slate-500">You are arguing {settings.side.toLowerCase()} the motion.</p></div><div className="min-h-[390px] space-y-5 bg-slate-50 p-5">{messages.map((message) => <article key={message.id} className={`max-w-3xl rounded-2xl p-4 ${message.kind === "user" ? "ml-auto bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}><div className="mb-2 flex items-center justify-between gap-3"><span className={`text-xs font-bold ${message.kind === "user" ? "text-blue-100" : "text-blue-700"}`}>{message.author}</span>{message.kind === "ai" && <button aria-label="Read response aloud" onClick={() => speak(message.text)} className="text-slate-400 hover:text-blue-700"><FaVolumeUp /></button>}</div><p className="leading-7">{message.text}</p>{message.points?.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-500">{message.points.map((point) => <li key={point}>{point}</li>)}</ul>}</article>)}{thinking && <div className="w-fit rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">AI opponent is thinking…</div>}</div><div className="border-t border-slate-100 p-4"><textarea value={argument} onChange={(event) => setArgument(event.target.value)} onKeyDown={(event) => { if (event.ctrlKey && event.key === "Enter") sendArgument(); }} placeholder="Present your next argument. Use evidence, examples, and clear reasoning…" rows="4" className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /><div className="mt-3 flex flex-wrap justify-between gap-3"><button onClick={toggleVoice} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${listening ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}><FaMicrophone />{listening ? "Listening…" : "Use voice"}</button><button onClick={sendArgument} disabled={!argument.trim() || thinking} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">Send argument <FaPaperPlane /></button></div></div></section>
      <aside className="space-y-5"><div className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-bold tracking-widest text-blue-200">DEBATE PLAN</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-300">Level</dt><dd className="font-semibold">{settings.level}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-300">Format</dt><dd className="text-right font-semibold">{settings.format}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-300">Your side</dt><dd className="font-semibold">{settings.side}</dd></div></dl></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">Argument checklist</h3><ul className="mt-3 space-y-3 text-sm text-slate-600"><li>• Make a clear claim</li><li>• Explain why it matters</li><li>• Add evidence or an example</li><li>• Address the counterpoint</li></ul></div><button onClick={finishDebate} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"><FaStop />Finish & view report</button></aside></main></div>;
}

function Setup({ settings, setSettings, start }) {
  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const isCustomTopic = settings.topic === "Custom topic";
  return <div className="min-h-screen bg-slate-50"><div className="mx-auto max-w-5xl p-5 sm:p-10">
    <button onClick={() => history.back()} className="text-sm font-semibold text-green-700">← Back to dashboard</button>
    <section className="mt-4 overflow-hidden rounded-3xl bg-green-700 p-7 text-white shadow-xl sm:p-10"><p className="text-xs font-bold tracking-[0.2em] text-green-100">NEW PRACTICE SESSION</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Build your debate before you begin.</h1><p className="mt-3 max-w-2xl text-green-50">Choose a motion and format that suits your goal. Gemini will respond as your debate opponent and create a complete performance report at the end.</p></section>
    <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-7 md:grid-cols-2">
      <Field label="Debate topic"><select value={settings.topic} onChange={(event) => update("topic", event.target.value)} className="input">{TOPICS.map((topic) => <option key={topic.title}>{topic.title}</option>)}<option>Custom topic</option></select>{isCustomTopic ? <input value={settings.customTopic} onChange={(event) => update("customTopic", event.target.value)} placeholder="Write your own debate motion" className="input mt-3" maxLength="180" /> : <p className="mt-2 text-xs text-slate-500">{TOPICS.find((topic) => topic.title === settings.topic)?.area}</p>}</Field>
      <Field label="Difficulty level"><div className="grid grid-cols-3 gap-2">{["Beginner", "Intermediate", "Advanced"].map((level) => <Choice key={level} active={settings.level === level} onClick={() => update("level", level)}>{level}</Choice>)}</div></Field>
      <Field label="Debate mode"><div className="grid grid-cols-2 gap-2">{["Practice", "Challenge"].map((mode) => <Choice key={mode} active={settings.mode === mode} onClick={() => update("mode", mode)}>{mode}</Choice>)}</div></Field>
      <Field label="Time limit"><div className="grid grid-cols-4 gap-2">{DURATIONS.map((duration) => <Choice key={duration} active={settings.duration === duration} onClick={() => update("duration", duration)}>{duration} min</Choice>)}</div></Field>
      <Field label="Debate format"><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{[
        ["One-on-One", "Direct AI opponent exchange"],
        ["Public Forum", "Evidence-led audience debate"],
        ["Oxford", "Formal proposition and opposition"],
        ["Parliamentary", "Government versus opposition"],
        ["Policy", "Detailed solutions and impacts"],
      ].map(([format, description]) => <button key={format} type="button" onClick={() => update("format", format)} className={`rounded-xl border p-3 text-left transition ${settings.format === format ? "border-violet-600 bg-violet-50 text-violet-800 ring-1 ring-violet-500" : "border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50"}`}><span className="block text-sm font-bold">{format}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></button>)}</div></Field>
      <Field label="Your position"><div className="grid grid-cols-2 gap-2"><Choice active={settings.side === "For"} onClick={() => update("side", "For")}>For the motion</Choice><Choice active={settings.side === "Against"} onClick={() => update("side", "Against")}>Against</Choice></div></Field>
    </div><div className="mt-9 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center"><p className="text-sm text-slate-500">Voice input is available when supported by your browser.</p><button onClick={start} disabled={isCustomTopic && !settings.customTopic.trim()} className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-200 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">Start debate session →</button></div></section>
  </div></div>;
}
function Field({ label, children }) { return <label className="block"><span className="mb-3 block text-sm font-bold text-slate-800">{label}</span>{children}</label>; }
function Choice({ active, children, onClick }) { return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${active ? "border-blue-700 bg-blue-50 text-blue-800 ring-1 ring-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{children}</button>; }
