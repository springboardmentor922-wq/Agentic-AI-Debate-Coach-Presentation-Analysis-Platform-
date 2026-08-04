import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";

function Ring({ label, value, color }) {
  const r = 34, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90">
        <circle cx="45" cy="45" r={r} stroke="#0f0f1a" strokeWidth="8" fill="none" />
        <circle cx="45" cy="45" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 45 45)" />
        <text x="45" y="50" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{value}</text>
      </svg>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  );
}

function PresentationAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Presentation Analysis</h2>
      <p className="text-gray-500 mb-6">Record a short presentation to get real speech-delivery scores.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <VoiceRecorderForPresentation onResult={setResult} setLoading={setLoading} setError={setError} />
        {loading && <p className="text-gray-400 text-sm">Analyzing your presentation...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl">
          <p className="text-gray-400 text-sm mb-4">My_Presentation — analyzed just now</p>
          <div className="flex gap-6 justify-center mb-6">
            <Ring label="Clarity" value={result.clarity_score} color="#a855f7" />
            <Ring label="Confidence" value={result.confidence_score} color="#3b82f6" />
            <Ring label="Engagement" value={result.engagement_score} color="#22c55e" />
            <Ring label="Pace" value={result.pace_status === "Optimal" ? 90 : 60} color="#f97316" />
          </div>
          <p className="text-gray-500 text-sm text-center">
            {result.words_per_minute} WPM ({result.pace_status}) · {result.filler_word_count} filler words
          </p>
        </div>
      )}
    </Layout>
  );
}

function VoiceRecorderForPresentation({ onResult, setLoading, setError }) {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const start = async () => {
    setError("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      clearInterval(timerRef.current);
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const duration = (Date.now() - startRef.current) / 1000;
      setStatus("analyzing");
      setLoading(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "presentation.webm");
        form.append("duration_seconds", duration);
        const res = await aiEngine.post("/api/v1/presentation/analyze", form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        onResult(res.data);
      } catch (err) {
        setError("Could not reach the AI engine.");
      } finally {
        setLoading(false);
        setStatus("idle");
      }
    };
    mediaRecorderRef.current = recorder;
    startRef.current = Date.now();
    recorder.start();
    setStatus("recording");
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 250);
  };

  const stop = () => mediaRecorderRef.current?.stop();

  return (
    <div>
      {status === "idle" && (
        <button onClick={start} className="bg-purple-600 hover:bg-purple-700 transition text-white font-medium px-4 py-2 rounded-lg">
          🎙️ Start Presentation Recording
        </button>
      )}
      {status === "recording" && (
        <div className="flex items-center gap-4">
          <span className="text-red-400 text-sm">● Recording... {seconds}s</span>
          <button onClick={stop} className="bg-red-600 hover:bg-red-700 transition text-white text-sm px-3 py-1.5 rounded-lg">Stop</button>
        </div>
      )}
      {status === "analyzing" && <p className="text-gray-400 text-sm">Transcribing and analyzing...</p>}
    </div>
  );
}

export default PresentationAnalysis;
