import React, { useRef, useState } from "react";
import Layout from "../components/Layout";
import aiEngine from "../api/aiEngine";
import api from "../api/axios";

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
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | recording | analyzing
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const validExt = f.name.toLowerCase().endsWith(".pptx") || f.name.toLowerCase().endsWith(".pdf");
    if (!validExt) {
      alert("Only .pptx or .pdf files are supported.");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const startRecording = async () => {
    if (!file) { alert("Upload your slides (PPTX or PDF) first."); return; }
    setError("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      clearInterval(timerRef.current);
      stream.getTracks().forEach((t) => t.stop());
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      const duration = (Date.now() - startRef.current) / 1000;
      setStatus("analyzing");

      try {
        const form = new FormData();
        form.append("document", file, file.name);
        form.append("audio", audioBlob, "presentation.webm");
        form.append("duration_seconds", duration);

        const res = await aiEngine.post("/api/v1/presentation/analyze-full", form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setResult(res.data);

        // Save real history
        await api.post("/learner/presentation-sessions", {
          filename: res.data.filename,
          slideCount: res.data.slide_count,
          transcript: res.data.transcript,
          presentationMetrics: {
            wordsPerMinute: res.data.presentation_metrics.words_per_minute,
            paceStatus: res.data.presentation_metrics.pace_status,
            fillerWordCount: res.data.presentation_metrics.filler_word_count
          },
          deliveryMetrics: {
            confidenceScore: res.data.delivery_metrics.confidence_score,
            clarityScore: res.data.delivery_metrics.clarity_score,
            engagementScore: res.data.delivery_metrics.engagement_score,
            overallFeedback: res.data.delivery_metrics.overall_feedback,
            grammarIssues: res.data.delivery_metrics.grammar_issues.map((g) => ({
              originalText: g.original_text, correctedText: g.corrected_text, explanation: g.explanation
            }))
          },
          contentReview: {
            structureScore: res.data.content_review.structure_score,
            clarityScore: res.data.content_review.clarity_score,
            claimSupportScore: res.data.content_review.claim_support_score,
            flowScore: res.data.content_review.flow_score,
            slideFeedback: res.data.content_review.slide_feedback.map((s) => ({
              slideNumber: s.slide_number, feedback: s.feedback
            })),
            overallContentFeedback: res.data.content_review.overall_content_feedback
          }
        }).catch(() => {});

      } catch (err) {
        setError(err.response?.data?.detail || "Could not analyze the presentation. Make sure the AI engine is running.");
      } finally {
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

  const stopRecording = () => mediaRecorderRef.current?.stop();

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Presentation Analysis</h2>
      <p className="text-gray-500 mb-6">Upload your slides, present them out loud, and get a real combined report — content AND delivery.</p>

      <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6 max-w-2xl mb-6">
        <h3 className="font-semibold mb-3">1. Upload Your Slides</h3>
        <input type="file" accept=".pptx,.pdf" onChange={handleFileChange}
          className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-3 mb-2 text-sm text-gray-300" />
        {file && <p className="text-purple-400 text-xs mb-4">Selected: {file.name}</p>}

        <h3 className="font-semibold mb-3 mt-4">2. Present It Out Loud</h3>
        {status === "idle" && (
          <button onClick={startRecording} disabled={!file}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 transition text-white font-medium px-4 py-2 rounded-lg">
            🎙️ Start Presenting
          </button>
        )}
        {status === "recording" && (
          <div className="flex items-center gap-4">
            <span className="text-red-400 text-sm">● Recording... {seconds}s</span>
            <button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 transition text-white text-sm px-3 py-1.5 rounded-lg">Stop</button>
          </div>
        )}
        {status === "analyzing" && <p className="text-gray-400 text-sm">Analyzing your slides and speech — this covers real content AND delivery, takes a moment...</p>}

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-4">{result.filename} — {result.slide_count} slides/pages — analyzed just now</p>
            <p className="text-purple-400 text-sm font-semibold mb-3">Delivery</p>
            <div className="flex gap-6 justify-center mb-4">
              <Ring label="Clarity" value={result.delivery_metrics.clarity_score} color="#a855f7" />
              <Ring label="Confidence" value={result.delivery_metrics.confidence_score} color="#3b82f6" />
              <Ring label="Engagement" value={result.delivery_metrics.engagement_score} color="#22c55e" />
              <Ring label="Pace" value={result.presentation_metrics.pace_status === "Optimal" ? 90 : 60} color="#f97316" />
            </div>
            <p className="text-gray-500 text-sm text-center mb-2">
              {result.presentation_metrics.words_per_minute ?? "N/A"} WPM ({result.presentation_metrics.pace_status}) · {result.presentation_metrics.filler_word_count} filler words
            </p>
            <p className="text-gray-300 text-sm text-center italic">"{result.delivery_metrics.overall_feedback}"</p>
          </div>

          <div className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-6">
            <p className="text-purple-400 text-sm font-semibold mb-3">Content (from your actual slides)</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Structure</p>
                <p className="font-bold text-purple-300">{result.content_review.structure_score}%</p>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Clarity</p>
                <p className="font-bold text-purple-300">{result.content_review.clarity_score}%</p>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Claim Support</p>
                <p className="font-bold text-purple-300">{result.content_review.claim_support_score}%</p>
              </div>
              <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs">Flow</p>
                <p className="font-bold text-purple-300">{result.content_review.flow_score}%</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">{result.content_review.overall_content_feedback}</p>

            {result.content_review.slide_feedback.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-500 text-xs font-semibold">PER-SLIDE FEEDBACK</p>
                {result.content_review.slide_feedback.map((s, i) => (
                  <div key={i} className="bg-[#0f0f1a] rounded-lg p-3 text-sm">
                    <span className="text-purple-400">Slide {s.slide_number}:</span> <span className="text-gray-300">{s.feedback}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default PresentationAnalysis;
