import React, { useRef, useState } from "react";
import aiEngine from "../api/aiEngine";

/**
 * Learner types in a minutes:seconds time limit -> records against a live
 * countdown (auto-stops at 0, or Stop works anytime before that) ->
 * transcribes -> reviews/edits -> confirms.
 */
function VoiceRecorder({ onConfirmed, disabled }) {
  const [status, setStatus] = useState("choose-duration"); // choose-duration | recording | transcribing | reviewing
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const audioBlobRef = useRef(null); // ✅ NEW — Phase B: keep the real recorded audio around

  const targetSeconds = () => Math.max(5, minutes * 60 + seconds); // 5s floor so it can't be zero

  const startRecording = async () => {
    setError("");
    const limit = targetSeconds();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        clearInterval(timerRef.current);
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob; // ✅ NEW — kept for handleConfirm to pass upward
        const finalDuration = (Date.now() - startTimeRef.current) / 1000;
        setDurationSec(finalDuration);

        setStatus("transcribing");
        try {
          const form = new FormData();
          form.append("audio", blob, "argument.webm");

          const res = await aiEngine.post("/api/v1/debate/transcribe", form, {
            headers: { "Content-Type": "multipart/form-data" }
          });

          setTranscript(res.data.transcript);
          setStatus("reviewing");

        } catch (err) {
          console.error(err);
          setError("Could not transcribe your recording. Is the AI engine running on localhost:8000?");
          setStatus("choose-duration");
        }
      };

      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setStatus("recording");
      setSecondsLeft(limit);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = limit - elapsed;

        if (remaining <= 0) {
          setSecondsLeft(0);
          recorder.stop(); // auto-stop at the chosen time limit
        } else {
          setSecondsLeft(remaining);
        }
      }, 250);

    } catch (err) {
      console.error(err);
      alert("Microphone access is required to record your argument.");
    }
  };

  // Manual stop — always available while recording, even before time's up
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const resetRecording = () => {
    setStatus("choose-duration");
    setTranscript("");
    setError("");
    audioBlobRef.current = null; // ✅ NEW
  };

  const handleConfirm = () => {
    onConfirmed(transcript, durationSec, audioBlobRef.current); // ✅ NEW — 3rd arg: the real recorded audio
    resetRecording();
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-[#0f0f1a] border border-white/10 rounded-lg p-4 mb-4">

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* ---- STEP 0: set a custom time limit, like setting a clock ---- */}
      {status === "choose-duration" && (
        <div>
          <p className="text-gray-400 text-xs mb-2">Set how long you want to speak</p>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              min="0"
              max="30"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(30, Number(e.target.value))))}
              className="w-16 bg-[#13131f] border border-white/10 rounded-lg px-3 py-2 text-center text-lg font-mono"
            />
            <span className="text-gray-400">min</span>

            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-16 bg-[#13131f] border border-white/10 rounded-lg px-3 py-2 text-center text-lg font-mono"
            />
            <span className="text-gray-400">sec</span>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition text-white font-medium px-4 py-2 rounded-lg"
          >
            🎙️ Start Recording ({fmt(targetSeconds())})
          </button>
        </div>
      )}

      {status === "recording" && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-red-400 text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording... {fmt(secondsLeft)} left
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 transition text-white font-medium px-4 py-2 rounded-lg"
          >
            ⏹ Stop now
          </button>
        </div>
      )}

      {status === "transcribing" && (
        <p className="text-gray-400 text-sm">Transcribing your recording...</p>
      )}

      {status === "reviewing" && (
        <div>
          <p className="text-gray-400 text-xs mb-2">
            Check the transcript below — edit anything that came out wrong, then confirm.
          </p>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full bg-[#13131f] border border-white/10 rounded-lg px-4 py-3 mb-3 min-h-[100px] text-sm"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetRecording}
              className="text-gray-400 hover:text-gray-200 text-sm font-medium px-4 py-2"
            >
              Discard &amp; re-record
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!transcript.trim()}
              className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 transition text-white font-medium px-5 py-2 rounded-lg"
            >
              ✓ Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
