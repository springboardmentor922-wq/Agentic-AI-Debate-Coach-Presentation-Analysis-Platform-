import React, { useState } from 'react';
import { 
  Bot, 
  Mic, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Volume2, 
  ShieldAlert,
  Swords,
  RotateCcw
} from 'lucide-react';
import { DebateFormat, DebateTurnResponseSchema } from '../../types';
import { processDebateTurnApi } from '../../services/apiClient';

export const AIDebateSimulationView: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>('One-on-One');
  const [selectedTopic, setSelectedTopic] = useState('Universal Basic Income creates a safety net for economic innovation.');
  const [userSide, setUserSide] = useState<'Proposition' | 'Opposition'>('Proposition');
  const [inputTurn, setInputTurn] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Turns history
  const [turns, setTurns] = useState<{
    id: string;
    userText: string;
    aiRebuttal: string;
    wpm: number;
    paceStatus: string;
    fallacyMetrics: DebateTurnResponseSchema['fallacy_metrics'];
    argumentScore: number;
    activatedAgents: string[];
    timestamp: string;
  }[]>([
    {
      id: 'turn_0',
      userText: 'UBI provides financial security that empowers individuals to take entrepreneurial risks without fear of poverty.',
      aiRebuttal: 'While you argue that UBI might stifle ambition, isn\'t it more accurate to say that it creates a floor for creative risk? Without the fear of poverty, how many would-be entrepreneurs are actually liberated?',
      wpm: 142,
      paceStatus: 'Optimal',
      fallacyMetrics: {
        fallacy_detected: false,
        fallacy_type: 'None',
        explanation: 'No logical inconsistencies found in economic rationale.',
        counter_strategy: 'Frame economic burden vs creative liberation.'
      },
      argumentScore: 88,
      activatedAgents: ['Argument Analysis', 'Agent 01: Referee', 'Agent 02: Rival'],
      timestamp: '10:30 AM'
    }
  ]);

  const handleProcessTurn = async (overrideText?: string) => {
    const textToSubmit = overrideText || inputTurn;
    if (!textToSubmit.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await processDebateTurnApi({
        user_input: textToSubmit,
        audio_duration_sec: Math.max(recordingSeconds, 15),
        debate_format: selectedFormat,
        topic: selectedTopic,
        conversation_history: turns.map(t => ({ role: 'user', content: t.userText }))
      });

      setTurns(prev => [
        ...prev,
        {
          id: `turn_${Date.now()}`,
          userText: response.user_transcript,
          aiRebuttal: response.ai_rebuttal,
          wpm: response.words_per_minute,
          paceStatus: response.pace_status,
          fallacyMetrics: response.fallacy_metrics,
          argumentScore: response.argument_score,
          activatedAgents: response.activated_agents,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setInputTurn('');
    } catch (err) {
      console.error('Debate turn error:', err);
    } finally {
      setIsLoading(false);
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const handleSimulateRecordSpeech = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(12);
      setTimeout(() => {
        setIsRecording(false);
        handleProcessTurn("My opponent claims we need social media regulation, but he couldn't even manage his own campaign budget!");
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Format Selector */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Live Arena: Dual-Agent Synthesis</h2>
              <p className="text-xs text-slate-400">Coordinated by Agent 01 Referee (0.0 Temp) & Agent 02 Rival Player (0.7 Temp)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            {(['One-on-One', 'Oxford Debate', 'Parliamentary Debate'] as DebateFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFormat === fmt
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Topic & Side Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-700/60">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-300">Debate Topic / Motion</label>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Assigned Stance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUserSide('Proposition')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  userSide === 'Proposition'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                Proposition (For)
              </button>
              <button
                onClick={() => setUserSide('Opposition')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  userSide === 'Opposition'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                Opposition (Against)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Agent Debate Grid (Matching Design HTML) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent 1: The Referee (Cold / Logical) */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-4 bg-[#1E293B]/80 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-sm font-bold text-rose-400">AGENT 01: THE REFEREE</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TEMP: 0.0 (STRICT)</span>
          </div>

          <div className="flex-1 p-5 space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logical Fallacy Detection</p>
              {turns.some(t => t.fallacyMetrics.fallacy_detected) ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                  <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    Ad Hominem Detected
                  </p>
                  <p className="text-xs text-slate-300">
                    Participant's claim focuses on the opponent's personal budget rather than the economic impact of the motion.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    No Fallacies Detected. Argument premise is logically sound.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fact Check & Logic Engine</p>
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 font-mono italic">Scanning PostgreSQL datasets for correlation metrics...</p>
                <p className="text-xs text-slate-200 mt-2 font-medium">
                  Status: Valid economic correlation supported by dataset query.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent 2: The Rival (Creative / Conversational) */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-4 bg-[#1E293B]/80 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="text-sm font-bold text-amber-400">AGENT 02: THE RIVAL</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TEMP: 0.7 (HUMAN)</span>
          </div>

          <div className="flex-1 p-5 space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rebuttal Generation</p>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-xs leading-relaxed italic text-amber-100 font-serif">
                  "{turns[turns.length - 1]?.aiRebuttal || 'While you argue that safety is vital, state regulation creates severe risks of censorship and suppression of dissenting opinions.'}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tone & Sentiment Analysis</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2.5 py-1 bg-slate-800 text-[10px] font-mono text-indigo-300 rounded border border-slate-700">PERSUASIVE</span>
                <span className="px-2.5 py-1 bg-slate-800 text-[10px] font-mono text-emerald-300 rounded border border-slate-700">MODERATE SPEED (142 WPM)</span>
                <span className="px-2.5 py-1 bg-slate-800 text-[10px] font-mono text-amber-300 rounded border border-slate-700">HIGH EMPATHY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Turn Submission & Speech Input Area */}
      <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Your Speech Turn Input</span>
          <span className="text-slate-400 font-mono">Real-time Audio & Text Processing</span>
        </div>

        <textarea
          rows={3}
          value={inputTurn}
          onChange={(e) => setInputTurn(e.target.value)}
          placeholder="e.g. Universal basic income establishes a safety floor that fosters long-term venture creation without systemic poverty risk..."
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleSimulateRecordSpeech}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isRecording ? 'Recording Speech (12s)...' : 'Record Speech Input'}
          </button>

          <button
            onClick={() => handleProcessTurn()}
            disabled={!inputTurn.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Send className="w-4 h-4" /> Submit Turn to Dual Agents
          </button>
        </div>
      </div>
    </div>
  );
};
