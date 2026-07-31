import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Mic, Square, Send, RefreshCw, Sparkles, CheckCircle, Radio } from 'lucide-react';

export const AudioRecorder = ({ debateSession, onComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [remainingTime, setRemainingTime] = useState(debateSession.duration);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputType, setInputType] = useState('audio');
  const [textInput, setTextInput] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRemainingTime(debateSession.duration);

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Microphone permission denied or audio input device not found.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      alert("Please record your speech argument first.");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.uploadAudio(debateSession.debateId, audioBlob);

      if (res.success) {
        onComplete(res);
      } else {
        alert(res.message || "Failed to process audio analysis.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading audio to server.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      alert("Please enter your text argument.");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.uploadText(debateSession.debateId, textInput);
      if (res.success) {
        onComplete(res);
      } else {
        alert(res.message || "Failed to process text analysis.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading text to server.");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (analyzing) {
    return (
      <div className="glass-card p-12 max-w-2xl mx-auto text-center space-y-6 border-indigo-500/40 glow-indigo animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-ping" />
          <div className="relative w-full h-full rounded-full border border-indigo-500/50 flex items-center justify-center bg-slate-900/80">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin-slow" />
          </div>
        </div>
        <div>
          <h3 className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Analysing...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto glass-card p-8 text-center space-y-8 border-indigo-500/30">
      <div>
        <span className="badge-pill badge-pill-emerald mb-2">Live Session Active</span>
        <h2 className="font-display text-3xl font-black text-white">{debateSession.topic}</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Format: {debateSession.debateType}</p>
      </div>

      {/* Timer Display */}
      <div className="inline-block p-6 glass-card border-indigo-500/40 bg-slate-950/60">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Time Remaining</div>
        <div className="font-mono text-6xl font-black text-indigo-400 tracking-wider drop-shadow-lg">
          {formatTime(remainingTime)}
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex justify-center gap-2 my-4">
        <button 
          onClick={() => setInputType('audio')}
          className={`px-4 py-2 text-xs font-bold rounded-l-full border border-indigo-500/30 transition-all ${inputType === 'audio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
        >
          Audio Recording
        </button>
        <button 
          onClick={() => setInputType('text')}
          className={`px-4 py-2 text-xs font-bold rounded-r-full border border-indigo-500/30 transition-all ${inputType === 'text' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
        >
          Text Input
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 py-2">
        {inputType === 'audio' ? (
          <>
            {isRecording && (
              <div className="flex items-end justify-center gap-1.5 h-12 my-2">
                {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70].map((h, i) => (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{ animationDelay: `${(i % 5) * 0.2}s`, height: `${h}%` }}
                  />
                ))}
              </div>
            )}

            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 cursor-pointer transition-all hover:scale-105 border border-white/20"
              >
                <Mic className="w-12 h-12" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-2xl shadow-rose-500/60 cursor-pointer transition-all hover:scale-105 border border-white/20 animate-pulse"
              >
                <Square className="w-10 h-10 fill-current" />
              </button>
            )}

            {audioUrl && !isRecording && (
              <div className="w-full max-w-md space-y-4">
                <div className="p-4 glass-card bg-slate-950/80 border-indigo-500/30">
                  <p className="text-xs font-bold text-slate-300 flex items-center justify-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-indigo-400 animate-pulse" /> Recorded Audio Stream
                  </p>
                  <audio controls src={audioUrl} className="w-full h-10" />
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={startRecording} className="btn-secondary text-xs">
                    <RefreshCw className="w-3.5 h-3.5" /> Re-record
                  </button>
                  <button onClick={handleSubmit} className="btn-primary text-xs">
                    <Send className="w-3.5 h-3.5" /> Transcribe & Evaluate
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-lg space-y-4">
            <textarea
              className="w-full h-40 bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none transition-all"
              placeholder="Type your debate argument here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button onClick={handleTextSubmit} className="btn-primary w-full py-3 text-sm font-bold">
              Submit Text Argument
            </button>
          </div>
        )}

        <p className="text-xs text-slate-400 font-medium">
          {isRecording
            ? "Live recording... Speak clearly into your microphone."
            : audioUrl
            ? "Listen to your recorded speech above or submit for AI analysis."
            : "Click the microphone orb to initiate recording."}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
          Cancel Session
        </button>
      </div>
    </div>
  );
};
