import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Flag,
  Award
} from 'lucide-react';
import { DebateFormat, DebateTurnResponseSchema, ActiveDebateSession, ActiveDebateTurn } from '../../types';
import { processDebateTurnApi } from '../../services/apiClient';

interface AIDebateSimulationViewProps {
  activeTopic?: string;
  onTopicChange?: (topic: string) => void;
  activeSession?: ActiveDebateSession;
  onUpdateSession?: (session: ActiveDebateSession) => void;
  onCompleteSession?: (session: ActiveDebateSession) => void;
}

export const AIDebateSimulationView: React.FC<AIDebateSimulationViewProps> = ({
  activeTopic,
  onTopicChange,
  activeSession,
  onUpdateSession,
  onCompleteSession
}) => {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(activeSession?.format || 'One-on-One');
  const [selectedTopic, setSelectedTopic] = useState(
    activeSession?.topic || activeTopic || 'Universal Basic Income creates a safety net for economic innovation.'
  );
  const [userSide, setUserSide] = useState<'Proposition' | 'Opposition'>(activeSession?.side || 'Proposition');
  const [turns, setTurns] = useState<ActiveDebateTurn[]>(
    activeSession?.turns && activeSession.turns.length > 0
      ? activeSession.turns
      : [
          {
            id: 'turn_0',
            userText: 'UBI provides financial security that empowers individuals to take entrepreneurial risks without fear of poverty.',
            aiRebuttal: "While you argue that UBI might stifle ambition, isn't it more accurate to say that it creates a floor for creative risk? Without the fear of poverty, how many would-be entrepreneurs are actually liberated?",
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
        ]
  );

  const [inputTurn, setInputTurn] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Sync internal state when activeSession prop changes
  useEffect(() => {
    if (activeSession) {
      if (activeSession.topic) setSelectedTopic(activeSession.topic);
      if (activeSession.format) setSelectedFormat(activeSession.format);
      if (activeSession.side) setUserSide(activeSession.side);
      if (activeSession.turns && activeSession.turns.length > 0) setTurns(activeSession.turns);
    } else if (activeTopic) {
      setSelectedTopic(activeTopic);
    }
  }, [activeSession, activeTopic]);

  // Helper to notify parent and persist active session
  const saveSessionState = (
    newTurns: ActiveDebateTurn[],
    newTopic = selectedTopic,
    newFormat = selectedFormat,
    newSide = userSide,
    status: 'in_progress' | 'completed' = activeSession?.status || 'in_progress'
  ) => {
    if (onUpdateSession) {
      onUpdateSession({
        id: activeSession?.id || `session_${Date.now()}`,
        topic: newTopic,
        format: newFormat,
        side: newSide,
        turns: newTurns,
        status,
        createdAt: activeSession?.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleTopicInputChange = (val: string) => {
    setSelectedTopic(val);
    if (onTopicChange) {
      onTopicChange(val);
    }
    saveSessionState(turns, val, selectedFormat, userSide);
  };

  const handleFormatChange = (fmt: DebateFormat) => {
    setSelectedFormat(fmt);
    saveSessionState(turns, selectedTopic, fmt, userSide);
  };

  const handleSideChange = (side: 'Proposition' | 'Opposition') => {
    setUserSide(side);
    saveSessionState(turns, selectedTopic, selectedFormat, side);
  };

  const handleProcessTurn = async (overrideText?: string) => {
    const textToSubmit = overrideText || inputTurn;
    if (!textToSubmit.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await processDebateTurnApi({
        user_input: textToSubmit,
        audio_duration_sec: isRecording ? recordingSeconds : undefined,
        debate_format: selectedFormat,
        topic: selectedTopic,
        conversation_history: turns.map(t => ({ role: 'user', content: t.userText }))
      });

      const newTurn: ActiveDebateTurn = {
        id: `turn_${Date.now()}`,
        userText: response.user_transcript,
        aiRebuttal: response.ai_rebuttal,
        wpm: response.words_per_minute,
        paceStatus: response.pace_status,
        fallacyMetrics: response.fallacy_metrics,
        argumentScore: response.argument_score,
        activatedAgents: response.activated_agents,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedTurns = [...turns, newTurn];
      setTurns(updatedTurns);
      saveSessionState(updatedTurns, selectedTopic, selectedFormat, userSide, 'in_progress');
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

  const handleFinishDebate = () => {
    const updatedSession: ActiveDebateSession = {
      id: activeSession?.id || `session_${Date.now()}`,
      topic: selectedTopic,
      format: selectedFormat,
      side: userSide,
      turns,
      status: 'completed',
      createdAt: activeSession?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    if (onCompleteSession) {
      onCompleteSession(updatedSession);
    }
    setIsCompletedModalOpen(true);
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              {(['One-on-One', 'Oxford Debate', 'Parliamentary Debate'] as DebateFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
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

            <button
              onClick={handleFinishDebate}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Evaluate Debate
            </button>
          </div>
        </div>

        {/* Topic & Side Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-700/60">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-300">Debate Topic / Motion</label>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => handleTopicInputChange(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Assigned Stance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSideChange('Proposition')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  userSide === 'Proposition'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                Proposition (For)
              </button>
              <button
                onClick={() => handleSideChange('Opposition')}
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
      <div className="bg-[#1E293B] dark:bg-slate-900 p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            Your Speech Turn Input
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Dual-Agent Parallel Evaluation</span>
        </div>

        <textarea
          rows={3}
          value={inputTurn}
          onChange={(e) => setInputTurn(e.target.value)}
          placeholder="e.g. Universal basic income establishes a safety floor that fosters long-term venture creation without systemic poverty risk..."
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={handleSimulateRecordSpeech}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
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
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isLoading ? 'Agents Processing...' : 'Submit Turn to Dual Agents'}</span>
          </button>
        </div>
      </div>

      {/* Transcript Log Section showing Turn History */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Debate Session Transcript & Dual-Agent Telemetry Log ({turns.length} Turns)
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            Real-time Feed
          </span>
        </div>

        <div className="space-y-4">
          {turns.map((turn, idx) => (
            <div key={turn.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                <span className="font-bold text-indigo-300 font-mono">Turn #{idx + 1} ({turn.timestamp})</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Pace: {turn.wpm} WPM ({turn.paceStatus})
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-700 font-bold">
                    Arg Score: {turn.argumentScore}/100
                  </span>
                </div>
              </div>

              {/* Dynamic Score Breakdown Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Argument Quality</span>
                  <span className="font-bold text-indigo-400 font-mono text-xs">{turn.argumentScore}/100</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Evidence Weight</span>
                  <span className="font-bold text-sky-400 font-mono text-xs">{Math.min(Math.max(turn.argumentScore - 3, 50), 96)}/100</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Persuasiveness</span>
                  <span className="font-bold text-purple-400 font-mono text-xs">{Math.min(Math.max(turn.argumentScore + 2, 50), 98)}/100</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Referee Deduction</span>
                  <span className={`font-bold font-mono text-xs ${turn.fallacyMetrics.fallacy_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {turn.fallacyMetrics.fallacy_detected ? '-18 pts' : '0 pts'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* User Input & Agent 1 Audit */}
                <div className="space-y-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Speech Transcript</span>
                  <p className="text-slate-200 font-medium">"{turn.userText}"</p>
                  
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                      Agent 1 Referee Audit
                    </span>
                    <p className={`text-[11px] p-2 rounded ${
                      turn.fallacyMetrics.fallacy_detected ? 'bg-rose-950/50 text-rose-300 border border-rose-800' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                    }`}>
                      {turn.fallacyMetrics.fallacy_detected 
                        ? `FOUL: ${turn.fallacyMetrics.fallacy_type} - ${turn.fallacyMetrics.explanation}`
                        : `PASSED: ${turn.fallacyMetrics.explanation}`
                      }
                    </p>
                  </div>
                </div>

                {/* Agent 2 Rebuttal */}
                <div className="space-y-2 p-3 bg-amber-950/20 rounded-lg border border-amber-900/40">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Agent 2 Rival Rebuttal
                  </span>
                  <p className="text-amber-100 italic font-serif leading-relaxed">
                    "{turn.aiRebuttal}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                Debate Round Completed
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2">Evaluation Report Saved!</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Your practice session on <span className="text-white font-semibold">"{selectedTopic}"</span> has been marked as completed. All {turns.length} turns are evaluated and archived to your past debates.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Average Score</p>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  {turns.length > 0 ? Math.round(turns.reduce((sum, t) => sum + t.argumentScore, 0) / turns.length) : 88}/100
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Turns</p>
                <p className="text-lg font-black text-indigo-400 font-mono">{turns.length}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCompletedModalOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
            >
              Continue Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
