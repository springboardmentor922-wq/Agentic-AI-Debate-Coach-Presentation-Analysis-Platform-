import React, { useState } from 'react';
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  BarChart2, 
  Clock, 
  FileText 
} from 'lucide-react';
import { PresentationMetricsSchema } from '../../types';
import { analyzePresentationApi } from '../../services/apiClient';

export const PresentationAnalysisView: React.FC = () => {
  const [speechText, setSpeechText] = useState(
    "Um, good morning everyone. Today I'd like to present our analysis on renewable energy adoption. Like, solar and wind power have, uh, dropped in cost by over 70 percent, you know, making clean transition viable."
  );
  const [durationSec, setDurationSec] = useState(45);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [metrics, setMetrics] = useState<PresentationMetricsSchema>({
    transcript: speechText,
    words_per_minute: 138,
    pace_status: 'Optimal',
    filler_words_count: 4,
    filler_words_list: ['um', 'like', 'uh', 'you know'],
    clarity_score: 88,
    confidence_score: 85,
    engagement_score: 82,
    overall_score: 85,
    speech_duration_sec: 45
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzePresentationApi(speechText, durationSec);
      setMetrics(res);
    } catch (err) {
      console.error('Presentation analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Presentation & Speech Quality Analysis</h2>
              <p className="text-xs text-slate-500">Evaluated by Speech & Audio Analytics Agent (WPM, Filler Words, Pace, Confidence)</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all self-start"
          >
            <Sparkles className="w-4 h-4" /> Run Speech Analysis
          </button>
        </div>
      </div>

      {/* Main Grid: Input & Waveform (Left) + Score Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Speech Audio Input & Transcript Waveform */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Upload / Recorder Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Upload or Record Presentation Speech</h3>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">Drag & drop your .mp3 or .wav presentation audio file</p>
              <p className="text-[11px] text-slate-400 mt-1">Or paste your spoken transcript text below for instant AI evaluation</p>
            </div>

            {/* Transcript Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Speech Transcript Input</label>
                <span className="text-slate-400">{speechText.trim().split(/\s+/).length} words</span>
              </div>
              <textarea
                rows={4}
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              />
            </div>

            {/* Audio Waveform Player Simulation */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-500 transition-colors shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>00:18</span>
                  <span className="text-indigo-400 font-bold">138 WPM (Optimal)</span>
                  <span>00:45</span>
                </div>
                {/* Waveform Bars */}
                <div className="flex items-center gap-1 h-8">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        i === 12 || i === 24 || i === 36 ? 'bg-amber-400 h-7' : 'bg-indigo-500/60 h-4'
                      }`}
                      style={{ height: `${Math.sin(i) * 12 + 16}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Filler Word Highlight Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Transcript & Verbal Filler Detection</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
              " <span className="bg-amber-200 text-amber-900 font-bold px-1 rounded">Um</span>, good morning everyone. Today I'd like to present our analysis on renewable energy adoption. <span className="bg-amber-200 text-amber-900 font-bold px-1 rounded">Like</span>, solar and wind power have, <span className="bg-amber-200 text-amber-900 font-bold px-1 rounded">uh</span>, dropped in cost by over 70 percent, <span className="bg-amber-200 text-amber-900 font-bold px-1 rounded">you know</span>, making clean transition viable."
            </div>

            <p className="text-[11px] text-slate-500">
              Detected <strong>{metrics.filler_words_count} verbal filler words</strong> ({metrics.filler_words_list.join(', ')}). Replacing fillers with deliberate pauses will increase clarity score from {metrics.clarity_score} to 95+.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Score Cards */}
        <div className="space-y-6">
          {/* Overall Speech Score */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase">Overall Speech Score</p>
            <div className="text-4xl font-extrabold text-indigo-600">{metrics.overall_score}<span className="text-base text-slate-400">/100</span></div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Clarity</p>
                <p className="text-lg font-bold text-indigo-700">{metrics.clarity_score}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Confidence</p>
                <p className="text-lg font-bold text-indigo-700">{metrics.confidence_score}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Engagement</p>
                <p className="text-lg font-bold text-indigo-700">{metrics.engagement_score}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Pace Status</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">{metrics.pace_status}</p>
              </div>
            </div>
          </div>

          {/* Detailed Metric Recommendations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Speech Metrics Breakdown</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-700">Speaking Rate</span>
                <span className="font-bold text-indigo-600">{metrics.words_per_minute} WPM</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-700">Filler Words Count</span>
                <span className="font-bold text-amber-600">{metrics.filler_words_count} fillers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-700">Speech Duration</span>
                <span className="font-bold text-slate-800">{metrics.speech_duration_sec}s</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <p className="font-bold text-slate-800">AI Speech Coach Recommendation:</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Your pacing of {metrics.words_per_minute} WPM is within the optimal 120-150 range. To raise your clarity score, practice taking a silent 1-second breath whenever you feel inclined to say "um" or "like".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
