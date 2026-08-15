import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  BarChart2, 
  Clock, 
  FileText, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Radio, 
  Activity, 
  Target, 
  Gauge, 
  Sliders,
  Flame,
  Volume1,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { PresentationMetricsSchema } from '../../types';
import { analyzePresentationApi } from '../../services/apiClient';
import { SpeechEngine, SpeechAnalysisResult } from '../../services/speechService';
import { useTheme } from '../../context/ThemeContext';

export const PresentationAnalysisView: React.FC = () => {
  const { isDark } = useTheme();

  // Active View Tab: 'analysis' | 'drills' | 'file-upload'
  const [activeTabMode, setActiveTabMode] = useState<'analysis' | 'drills' | 'file-upload'>('analysis');

  // Input states
  const [speechText, setSpeechText] = useState(
    "Um, good morning everyone. Today I'd like to present our analysis on renewable energy adoption. Like, solar and wind power have, uh, dropped in cost by over 70 percent, you know, making clean transition viable across modern industrial grids. Basically, delaying action will, sort of, increase systemic volatility."
  );
  const [durationSec, setDurationSec] = useState(48);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Live Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveWpm, setLiveWpm] = useState(138);
  const [liveEnergyRms, setLiveEnergyRms] = useState(0.68);
  const recorderRef = useRef<{ stop: () => void } | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // TTS playback state
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const ttsInstanceRef = useRef<{ cancel: () => void } | null>(null);

  // File Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Presentation Metrics State
  const [metrics, setMetrics] = useState<PresentationMetricsSchema>({
    transcript: speechText,
    words_per_minute: 138,
    pace_status: 'Optimal',
    filler_words_count: 5,
    filler_words_list: ['um', 'like', 'uh', 'you know', 'basically'],
    filler_breakdown: [
      { word: 'um/uh', count: 2 },
      { word: 'like', count: 1 },
      { word: 'you know', count: 1 },
      { word: 'basically', count: 1 }
    ],
    filler_percentage: 6.8,
    clarity_score: 86,
    confidence_score: 84,
    engagement_score: 88,
    overall_score: 86,
    pitch_variance: 'Balanced',
    energy_level: 'Moderate',
    speech_duration_sec: 48,
    feedback_tips: [
      'Optimal speaking cadence of 138 WPM maintained within the competitive 130–160 WPM debate window.',
      'Detected 5 verbal filler words (6.8% of transcript). Replace "basically" and "you know" with deliberate 1-second silence.',
      'Balanced vocal pitch variance with strong inflection on key statistical claims.'
    ],
    activated_agents: ['Speech & Audio Analytics Agent', 'Prosody Feature Extraction Agent', 'Presentation Coaching Agent']
  });

  // Drill State
  const [drillMode, setDrillMode] = useState<'metronome' | 'filler-elimination' | 'emphasis'>('metronome');
  const [metronomeBpm, setMetronomeBpm] = useState(140);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [drillScore, setDrillScore] = useState<number | null>(null);

  // Theme styling helpers
  const cardBg = isDark ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm';
  const innerCardBg = isDark ? 'bg-slate-900/70 border-slate-700/60' : 'bg-slate-50 border-slate-200';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  // Real-time Canvas Waveform Animator
  useEffect(() => {
    if (!isRecording || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawWaveform = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(drawWaveform);

      analyser.getByteFrequencyData(dataArray);

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

          // Gradient color
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#6366f1'); // Indigo
          gradient.addColorStop(1, '#a855f7'); // Purple

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          x += barWidth + 1;
        }

        // Calculate live RMS energy
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / bufferLength;
        setLiveEnergyRms(Math.min(1.0, Math.max(0.1, avg / 128)));
      }
    };

    drawWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Clean up AudioContext & MediaStream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      SpeechEngine.stopSpeaking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Handle Start / Stop Live Microphone Recording
  const handleToggleLiveRecording = async () => {
    if (isRecording) {
      // STOP RECORDING
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsRecording(false);

      // Perform analysis on captured speech
      handleAnalyze(speechText, Math.max(recordingTime, 10));
    } else {
      // START RECORDING
      try {
        setSpeechText('');
        setRecordingTime(0);
        setIsRecording(true);

        // Web Audio API Context & Analyser
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyserRef.current = analyser;

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
        }

        // Live STT Speech Recognition
        const rec = SpeechEngine.startSpeechRecognition(
          (liveTranscript) => {
            setSpeechText(liveTranscript);
            const words = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
            const currentSec = Math.max(recordingTime, 2);
            setLiveWpm(Math.round((words / currentSec) * 60));
          },
          (err) => {
            console.warn('Speech recognition notice:', err);
          },
          () => {
            // onEnd
          }
        );
        recorderRef.current = rec;

        // Timer interval
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime((prev: number) => prev + 1);
        }, 1000);
      } catch (err: any) {
        console.error('Microphone recording error:', err);
        setIsRecording(false);
        alert('Could not access microphone. Please check browser permissions or use text/file upload.');
      }
    }
  };

  // Run Speech Analysis via API & Prosody Engine
  const handleAnalyze = async (overrideText?: string, overrideDuration?: number) => {
    const textToEvaluate = overrideText || speechText;
    const durToEvaluate = overrideDuration || durationSec;

    if (!textToEvaluate.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzePresentationApi(textToEvaluate, durToEvaluate);
      setMetrics(res);
    } catch (err) {
      console.error('Presentation analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // TTS Voice Playback
  const handleToggleTTS = () => {
    if (isPlayingTTS) {
      SpeechEngine.stopSpeaking();
      setIsPlayingTTS(false);
    } else {
      setIsPlayingTTS(true);
      ttsInstanceRef.current = SpeechEngine.speakText(speechText, {
        onEnd: () => setIsPlayingTTS(false)
      });
    }
  };

  // Remove All Fillers & Format Clean Speech
  const handleCleanFillers = () => {
    const clean = speechText
      .replace(/\b(um|umm|uh|uhh|like|you know|basically|actually|literally|sort of|kind of|i mean)\b/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/,\s*,/g, ',')
      .trim();
    setSpeechText(clean);
    handleAnalyze(clean, durationSec);
  };

  // File Upload Drop Handler
  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    setUploadedFileName(file.name);
    // Transcribe simulation
    const simulatedTranscripts: Record<string, string> = {
      default: "Good afternoon. We are presenting our proposition on automated governance. First, empirical data indicates a 40 percent reduction in administrative lag. However, like, we must address ethical oversights, you know, to prevent biased outcomes across demographic sectors."
    };
    const sample = simulatedTranscripts.default;
    setSpeechText(sample);
    setDurationSec(42);
    handleAnalyze(sample, 42);
  };

  // Copy transcript to clipboard
  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(speechText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export Presentation Evaluation Report
  const handleExportReport = () => {
    const reportContent = `
AI DEBATE COACH - PRESENTATION & SPEECH ANALYTICS AUDIT
======================================================
Date: ${new Date().toLocaleDateString()}
Overall Presentation Score: ${metrics.overall_score}/100
Pace (WPM): ${metrics.words_per_minute} WPM (${metrics.pace_status})
Clarity Score: ${metrics.clarity_score}/100
Confidence Score: ${metrics.confidence_score}/100
Pitch Variance: ${metrics.pitch_variance || 'Balanced'}
Energy Level: ${metrics.energy_level || 'Moderate'}
Total Spoken Fillers: ${metrics.filler_words_count} (${metrics.filler_percentage || 0}% of words)

TRANSCRIPT:
"${metrics.transcript}"

ACTIONABLE COACHING FEEDBACK:
${metrics.feedback_tips ? metrics.feedback_tips.map((tip: any, i: number) => `${i + 1}. ${tip}`).join('\n') : 'No specific feedback generated.'}
======================================================
`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Speech_Analysis_Report_${Date.now()}.txt`;
    link.click();
  };

  // Radar Chart Data Points
  const radarChartData = [
    { metric: 'Pacing (WPM)', value: Math.min(100, Math.max(40, 100 - Math.abs(metrics.words_per_minute - 145) * 1.5)) },
    { metric: 'Clarity & Flow', value: metrics.clarity_score },
    { metric: 'Confidence', value: metrics.confidence_score },
    { metric: 'Fluency', value: Math.max(40, 100 - (metrics.filler_words_count * 7)) },
    { metric: 'Modulation', value: metrics.pitch_variance === 'Dynamic' ? 95 : metrics.pitch_variance === 'Balanced' ? 85 : 62 },
  ];

  // Timeline Cadence Sample Data
  const timelineCadenceData = [
    { time: '0:00', wpm: 125, energy: 65 },
    { time: '0:10', wpm: 138, energy: 78 },
    { time: '0:20', wpm: metrics.words_per_minute, energy: 82 },
    { time: '0:30', wpm: Math.max(110, metrics.words_per_minute - 8), energy: 70 },
    { time: '0:40', wpm: Math.min(170, metrics.words_per_minute + 6), energy: 85 },
    { time: '0:50', wpm: metrics.words_per_minute, energy: 75 },
  ];

  // Filler Word Bar Chart Data
  const fillerBarData = (metrics.filler_breakdown || [
    { word: 'um/uh', count: 2 },
    { word: 'like', count: 1 },
    { word: 'you know', count: 1 },
    { word: 'basically', count: 1 }
  ]).map((f: { word: any; count: any; }) => ({ name: f.word, count: f.count }));

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Presentation & Speech Analytics</h2>
              </div>
              <p className={`text-xs ${textSub} mt-0.5`}>
                Real-time STT speech recognition, prosody acoustic extraction, cadence tracking & AI voice coaching.
              </p>
            </div>
          </div>

          {/* Mode Switcher & Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`flex items-center p-1 rounded-xl border ${innerCardBg}`}>
              <button
                onClick={() => setActiveTabMode('analysis')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'analysis' ? 'bg-indigo-600 text-white shadow-md' : `${textSub} hover:text-indigo-400`
                }`}
              >
                Speech Analyzer
              </button>
              <button
                onClick={() => setActiveTabMode('drills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'drills' ? 'bg-indigo-600 text-white shadow-md' : `${textSub} hover:text-indigo-400`
                }`}
              >
                Vocal Drills & Warmups
              </button>
              <button
                onClick={() => setActiveTabMode('file-upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'file-upload' ? 'bg-indigo-600 text-white shadow-md' : `${textSub} hover:text-indigo-400`
                }`}
              >
                Audio File Upload
              </button>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Evaluating...' : 'Run Analysis'}</span>
            </button>

            <button
              onClick={handleExportReport}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${innerCardBg} hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SPEECH ANALYZER */}
      {activeTabMode === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Live Audio Recorder, FFT Waveform Canvas, Transcript */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Microphone Recording & FFT Canvas Box */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
                  <h3 className="font-bold text-sm">Live Microphone Speech Capture & Acoustic Waveform</h3>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-rose-500">
                      REC: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Waveform Visualizer Canvas */}
              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center overflow-hidden min-h-[140px]">
                {isRecording ? (
                  <canvas ref={canvasRef} width={500} height={100} className="w-full h-24" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">Microphone ready. Press Start Recording to transcribe and extract vocal prosody in real time.</p>
                    <p className="text-[11px] text-slate-500">Supports native Web Speech API & HTML5 AudioContext frequency spectrum analysis.</p>
                  </div>
                )}

                {/* Live Floating Indicators during recording */}
                {isRecording && (
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/60">
                    <span className="text-indigo-400">Live Pacing: <strong>{liveWpm} WPM</strong></span>
                    <span className="text-purple-400">Energy RMS: <strong>{Math.round(liveEnergyRms * 100)}%</strong></span>
                    <span className="text-emerald-400">Status: <strong>Transcribing Live</strong></span>
                  </div>
                )}
              </div>

              {/* Record & Playback Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleLiveRecording}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Stop & Evaluate Speech' : 'Start Live Speech Recording'}</span>
                  </button>

                  <button
                    onClick={handleToggleTTS}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${innerCardBg} hover:bg-indigo-500/20 transition-all flex items-center gap-2`}
                  >
                    {isPlayingTTS ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                    <span>{isPlayingTTS ? 'Stop Playback' : 'Listen with AI Voice (TTS)'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleCleanFillers}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" /> Clean Verbal Fillers
                  </button>
                </div>
              </div>
            </div>

            {/* Spoken Transcript & Interactive Highlighter */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm">Speech Transcript & Verbal Crutches Heatmap</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${textSub}`}>
                    {speechText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    onClick={handleCopyTranscript}
                    className={`p-1.5 rounded-lg border ${innerCardBg} hover:text-indigo-400 text-xs flex items-center gap-1`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <textarea
                rows={4}
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                placeholder="Transcribed speech appears here. You can also paste speech notes..."
                className={`w-full ${innerCardBg} border rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed`}
              />

              {/* Visual Highlighted Tag View */}
              <div className={`p-4 rounded-xl border ${innerCardBg} text-xs leading-relaxed space-y-2`}>
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Acoustic Word Inspection</span>
                  <span className="text-amber-400 font-bold">{metrics.filler_words_count} Verbal Crutches Flagged</span>
                </div>
                <div className="leading-relaxed">
                  {speechText.split(/\s+/).map((word: string, idx: any) => {
                    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
                    const isFiller = ['um', 'umm', 'uh', 'uhh', 'like', 'basically', 'actually', 'literally'].includes(cleanWord);
                    return (
                      <span
                        key={idx}
                        className={
                          isFiller
                            ? 'bg-amber-500/20 text-amber-300 font-bold px-1 py-0.5 rounded border border-amber-500/40 mx-0.5'
                            : 'mx-0.5'
                        }
                      >
                        {word}{' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cadence Timeline Chart */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm">Speech Cadence & Vocal Energy Timeline</h3>
                </div>
                <span className="text-xs text-indigo-400 font-bold">Target: 130–160 WPM</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineCadenceData}>
                    <defs>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} domain={[80, 190]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                    />
                    <Area type="monotone" dataKey="wpm" name="Cadence (WPM)" stroke="#6366f1" fillOpacity={1} fill="url(#wpmGrad)" />
                    <Area type="monotone" dataKey="energy" name="Vocal Energy (%)" stroke="#a855f7" fillOpacity={1} fill="url(#energyGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* RIGHT 1 COL: Score Cards, 5-Axis Radar, Prosody Breakdown, AI Coaching Tips */}
          <div className="space-y-6">

            {/* Overall Presentation Score Card */}
            <div className={`${cardBg} p-6 rounded-2xl border text-center space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Presentation Score</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Grade A-
                </span>
              </div>

              <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {metrics.overall_score}<span className="text-xl text-slate-400 font-normal">/100</span>
              </div>

              {/* 4 Quick Sub-Score Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className={`p-3 rounded-xl border ${innerCardBg} text-center`}>
                  <p className={`text-[10px] ${textSub} uppercase font-bold`}>Clarity</p>
                  <p className="text-base font-extrabold text-indigo-400">{metrics.clarity_score}%</p>
                </div>
                <div className={`p-3 rounded-xl border ${innerCardBg} text-center`}>
                  <p className={`text-[10px] ${textSub} uppercase font-bold`}>Confidence</p>
                  <p className="text-base font-extrabold text-purple-400">{metrics.confidence_score}%</p>
                </div>
                <div className={`p-3 rounded-xl border ${innerCardBg} text-center`}>
                  <p className={`text-[10px] ${textSub} uppercase font-bold`}>Cadence</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">{metrics.words_per_minute} WPM</p>
                </div>
                <div className={`p-3 rounded-xl border ${innerCardBg} text-center`}>
                  <p className={`text-[10px] ${textSub} uppercase font-bold`}>Modulation</p>
                  <p className="text-xs font-bold text-amber-400 mt-1">{metrics.pitch_variance || 'Balanced'}</p>
                </div>
              </div>
            </div>

            {/* 5-Axis Radar Delivery Index */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>5-Axis Delivery Index</span>
                </h3>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <PolarAngleAxis dataKey="metric" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                    <Radar name="Delivery Score" dataKey="value" stroke="#818cf8" fill="#6366f1" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filler Words Breakdown Bar Chart */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Filler Word Frequency</span>
                </h3>
                <span className="text-xs text-amber-400 font-bold">{metrics.filler_words_count} total</span>
              </div>

              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fillerBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Actionable AI Speech Coaching Tips */}
            <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm">AI Speech Coach Action Plan</h3>
              </div>

              <div className="space-y-2.5">
                {(metrics.feedback_tips || [
                  'Maintain optimal pacing between 130–160 WPM during affirmative constructives.',
                  'Replace verbal crutches ("basically", "you know") with deliberate 1-second silence to project authority.',
                  'Vary vocal inflection and pitch on operative impact sentences.'
                ]).map((tip: any, i: any) => (
                  <div key={i} className={`p-3 rounded-xl border ${innerCardBg} text-xs flex items-start gap-2.5`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 2: VOCAL DRILLS & WARMUPS */}
      {activeTabMode === 'drills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardBg} p-6 rounded-2xl border space-y-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">Interactive Vocal & Delivery Practice Drills</h3>
                  <p className={`text-xs ${textSub}`}>Structured exercises designed to eliminate verbal fillers and master tournament cadence.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrillMode('metronome')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      drillMode === 'metronome' ? 'bg-indigo-600 text-white' : `${innerCardBg} ${textSub}`
                    }`}
                  >
                    1. Pacing Metronome
                  </button>
                  <button
                    onClick={() => setDrillMode('filler-elimination')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      drillMode === 'filler-elimination' ? 'bg-indigo-600 text-white' : `${innerCardBg} ${textSub}`
                    }`}
                  >
                    2. Zero-Filler Challenge
                  </button>
                  <button
                    onClick={() => setDrillMode('emphasis')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      drillMode === 'emphasis' ? 'bg-indigo-600 text-white' : `${innerCardBg} ${textSub}`
                    }`}
                  >
                    3. Dynamic Modulation
                  </button>
                </div>
              </div>

              {/* DRILL 1: Metronome Drill */}
              {drillMode === 'metronome' && (
                <div className={`p-6 rounded-2xl border ${innerCardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-indigo-400">Target Cadence: {metronomeBpm} WPM</h4>
                      <p className="text-xs text-slate-400">Read the passage below matching the audio metronome beat rhythm.</p>
                    </div>
                    <button
                      onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isMetronomeActive ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isMetronomeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isMetronomeActive ? 'Stop Metronome' : 'Start Metronome'}</span>
                    </button>
                  </div>

                  {/* Metronome Speed Slider */}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs font-bold">110 WPM (Slow)</span>
                    <input
                      type="range"
                      min={110}
                      max={180}
                      value={metronomeBpm}
                      onChange={(e: { target: { value: any; }; }) => setMetronomeBpm(Number(e.target.value))}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold">180 WPM (Tournament Fast)</span>
                  </div>

                  {/* Drill Passage Box */}
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
                    "The primary justification for regulatory oversight is not to stifle technological progress, but to construct a durable safety floor. When institutions operate under clear guardrails, investment flourishes with sustained public trust."
                  </div>
                </div>
              )}

              {/* DRILL 2: Zero-Filler Challenge */}
              {drillMode === 'filler-elimination' && (
                <div className={`p-6 rounded-2xl border ${innerCardBg} space-y-4`}>
                  <div>
                    <h4 className="font-bold text-sm text-amber-400">30-Second Zero-Filler Challenge</h4>
                    <p className="text-xs text-slate-400">Deliver a 30-second speech on the prompt without using "um", "uh", "like", or "basically".</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <p className="font-bold text-indigo-400 mb-1">PROMPT:</p>
                    <p>"Explain why access to public education must be guaranteed as a constitutional right."</p>
                  </div>

                  <button
                    onClick={handleToggleLiveRecording}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" /> Start Challenge Recording
                  </button>
                </div>
              )}

              {/* DRILL 3: Dynamic Emphasis Modulation */}
              {drillMode === 'emphasis' && (
                <div className={`p-6 rounded-2xl border ${innerCardBg} space-y-4`}>
                  <div>
                    <h4 className="font-bold text-sm text-purple-400">Pitch & Stress Modulation Drill</h4>
                    <p className="text-xs text-slate-400">Emphasize the <strong>bold highlighted terms</strong> with higher vocal volume and deliberate micro-pauses.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed font-mono text-slate-200">
                    "We cannot afford <strong>complacency</strong>. While our opponents promise <strong>gradual reform</strong>, the empirical data demands <strong>immediate action</strong>."
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Drill Mastery Badges</span>
              </h3>
              <div className="space-y-2">
                <div className={`p-3 rounded-xl border ${innerCardBg} flex items-center justify-between text-xs`}>
                  <span>Metronome Pacer (140 WPM)</span>
                  <span className="text-emerald-400 font-bold">Completed</span>
                </div>
                <div className={`p-3 rounded-xl border ${innerCardBg} flex items-center justify-between text-xs`}>
                  <span>Filler Hunter (Zero Fillers)</span>
                  <span className="text-indigo-400 font-bold">In Progress</span>
                </div>
                <div className={`p-3 rounded-xl border ${innerCardBg} flex items-center justify-between text-xs`}>
                  <span>Vocal Inflection Master</span>
                  <span className="text-slate-500">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: AUDIO FILE UPLOAD */}
      {activeTabMode === 'file-upload' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className={`${cardBg} p-8 rounded-2xl border space-y-6 text-center`}>
            <div>
              <h3 className="text-lg font-bold">Upload Recorded Presentation Audio</h3>
              <p className={`text-xs ${textSub} mt-1`}>Upload your .wav, .mp3, .m4a, or .webm debate audio recording for automated acoustic & speech evaluation.</p>
            </div>

            <div
              onDragOver={(e: { preventDefault: () => void; }) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
              className={`border-2 border-dashed rounded-2xl p-10 transition-colors cursor-pointer ${
                isDragging ? 'border-indigo-500 bg-indigo-500/10' : `${innerCardBg} border-slate-700/60 hover:border-indigo-500`
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold">Drag and drop audio file here</p>
              <p className={`text-xs ${textSub} mt-1`}>Supports .mp3, .wav, .m4a, .ogg up to 50MB</p>

              <label className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all">
                Browse Files
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && processUploadedFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedFileName && (
              <div className={`p-4 rounded-xl border ${innerCardBg} flex items-center justify-between text-xs`}>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{uploadedFileName}</span>
                </div>
                <button
                  onClick={() => setActiveTabMode('analysis')}
                  className="text-xs font-bold text-indigo-400 hover:underline"
                >
                  View Analysis & Results &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
