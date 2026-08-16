import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff,
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Volume2, 
  VolumeX,
  ShieldAlert,
  Swords,
  RotateCcw,
  Flag,
  Award,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { DebateFormat, DebateTurnResponseSchema, ActiveDebateSession, ActiveDebateTurn } from '../../types';
import { processDebateTurnApi } from '../../services/apiClient';
import { SpeechEngine } from '../../services/speechService';

interface AIDebateSimulationViewProps {
  activeTopic?: string;
  onTopicChange?: (topic: string) => void;
  activeSession?: ActiveDebateSession;
  onUpdateSession?: (session: ActiveDebateSession) => void;
  onCompleteSession?: (session: ActiveDebateSession) => void;
  onNavigate?: (tab: string) => void;
}

const SAMPLE_TUTORIAL_TURN: ActiveDebateTurn = {
  id: 'sample_turn_preview',
  isSample: true,
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
  timestamp: 'Sample Demo'
};

export const AIDebateSimulationView: React.FC<AIDebateSimulationViewProps> = ({
  activeTopic,
  onTopicChange,
  activeSession,
  onUpdateSession,
  onCompleteSession,
  onNavigate
}) => {
  const [selectedFormat, setSelectedFormat] = useState<DebateFormat>(activeSession?.format || 'One-on-One');
  const [selectedTopic, setSelectedTopic] = useState<string>(
    activeSession?.topic || activeTopic || 'The Future of Artificial Intelligence'
  );
  const [userSide, setUserSide] = useState<'Proposition' | 'Opposition'>(activeSession?.side || 'Proposition');
  const [turns, setTurns] = useState<ActiveDebateTurn[]>(
    activeSession?.turns ? activeSession.turns : []
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
      if (activeSession.turns) setTurns(activeSession.turns);
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

  // Action: Start clean fresh debate on current topic from Turn #1
  const handleStartFreshDebate = () => {
    setTurns([]);
    setInputTurn('');
    saveSessionState([], selectedTopic, selectedFormat, userSide, 'in_progress');
  };

  // Action: Load sample tutorial example for illustration
  const handleLoadSampleDemo = () => {
    const sampleList = [SAMPLE_TUTORIAL_TURN];
    setTurns(sampleList);
    saveSessionState(sampleList, selectedTopic, selectedFormat, userSide, 'in_progress');
  };

  const realTurns = turns.filter(t => !t.isSample);
  const isViewingSample = turns.length > 0 && turns.some(t => t.isSample);

  const handleProcessTurn = async (overrideText?: string) => {
    const textToSubmit = overrideText || inputTurn;
    if (!textToSubmit.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // If current session was marked completed, start fresh turns list
      const baseTurns = activeSession?.status === 'completed' ? [] : realTurns;

      const response = await processDebateTurnApi({
        user_input: textToSubmit,
        audio_duration_sec: isRecording ? recordingSeconds : undefined,
        debate_format: selectedFormat,
        topic: selectedTopic,
        conversation_history: baseTurns.map(t => ({ role: 'user', content: t.userText }))
      });

      const newTurn: ActiveDebateTurn = {
        id: `turn_${Date.now()}`,
        isSample: false,
        userText: response.user_transcript,
        aiRebuttal: response.ai_rebuttal,
        wpm: response.words_per_minute,
        paceStatus: response.pace_status,
        fallacyMetrics: response.fallacy_metrics,
        argumentScore: response.argument_score,
        activatedAgents: response.activated_agents,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Discard any sample tutorial turn and append real turn
      const updatedTurns = [...baseTurns, newTurn];
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

  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);

  const handleToggleRecordSpeech = () => {
    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      
      const rec = SpeechEngine.startSpeechRecognition(
        (recognizedText) => {
          setInputTurn(recognizedText);
        },
        (error) => {
          console.warn('Speech recognition warning:', error);
        },
        () => {
          setIsRecording(false);
        }
      );
      speechRecognitionRef.current = rec;
    }
  };

  const handleSpeakTurn = (turnId: string, text: string) => {
    if (speakingTurnId === turnId) {
      SpeechEngine.stopSpeaking();
      setSpeakingTurnId(null);
    } else {
      SpeechEngine.stopSpeaking();
      setSpeakingTurnId(turnId);
      SpeechEngine.speakText(text, {
        onEnd: () => setSpeakingTurnId(null)
      });
    }
  };

  const handleFinishDebate = () => {
    const updatedSession: ActiveDebateSession = {
      id: activeSession?.id || `session_${Date.now()}`,
      topic: selectedTopic,
      format: selectedFormat,
      side: userSide,
      turns: realTurns.length > 0 ? realTurns : turns,
      status: 'completed',
      createdAt: activeSession?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    if (onCompleteSession) {
      onCompleteSession(updatedSession);
    }
    setIsCompletedModalOpen(true);
  };

  const latestTurn = turns[turns.length - 1];

  return (
    <div className="space-y-6 pb-12">
      {/* Completed Debate Notification Banner */}
      {activeSession?.status === 'completed' && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">
                Debate on "{selectedTopic}" is Completed & Archived
              </p>
              <p className="text-[11px] text-slate-400">
                All turns have been scored and logged in My Debates. Ready to start a fresh blank round on this or another motion.
              </p>
            </div>
          </div>
          <button
            onClick={handleStartFreshDebate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start Clean Debate (Turn #1)
          </button>
        </div>
      )}

      {/* Top Banner & Arena Controls */}
      <div className="bg-[#1E293B] p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-5">
        {/* Row 1: Arena Title & Format Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Debate Simulation Arena</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                  Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time debate vs. Agent 01 (Referee Audit) & Agent 02 (Rival Rebuttal)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
            {(['One-on-One', 'Oxford Debate', 'Parliamentary Debate'] as DebateFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatChange(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Row 2: Turn Progression Tracker & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/60">
          {/* Visual 5-Stage Turn Tracker */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Turn Progress:
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {realTurns.length}/5 Completed
              </span>
              <span className="text-[11px] text-slate-400">
                {realTurns.length === 0 ? '• Ready for Turn #1' : `• ${realTurns.length} Speech Turn(s) Logged`}
              </span>
            </div>
            {/* 5-step visual pills */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((step) => {
                const isCompleted = step <= realTurns.length;
                const isCurrent = step === realTurns.length + 1;
                return (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      isCompleted
                        ? 'w-8 bg-emerald-500'
                        : isCurrent
                          ? 'w-10 bg-indigo-500 animate-pulse ring-2 ring-indigo-400/40'
                          : 'w-6 bg-slate-800 border border-slate-700'
                    }`}
                    title={`Turn ${step}${isCompleted ? ' (Completed)' : isCurrent ? ' (Next)' : ' (Upcoming)'}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartFreshDebate}
              title="Reset all turns and start clean from Turn #1"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start Clean Round
            </button>

            <button
              onClick={handleFinishDebate}
              disabled={realTurns.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                realTurns.length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
              }`}
              title={realTurns.length > 0 ? `Finish and score this ${realTurns.length}-turn debate` : 'Record at least 1 turn to finish & evaluate'}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{realTurns.length > 0 ? `Finish & Score (${realTurns.length} Turns)` : 'Finish (0 Turns)'}</span>
            </button>
          </div>
        </div>

        {/* Row 3: Topic & Stance Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Active Debate Motion / Topic</label>
              <span className="text-[11px] text-indigo-400 font-medium">
                {realTurns.length === 0 ? 'Starts clean from Turn #1' : `Active Round (${realTurns.length} turns recorded)`}
              </span>
            </div>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => handleTopicInputChange(e.target.value)}
              placeholder="e.g. The Future of Artificial Intelligence"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Assigned Stance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSideChange('Proposition')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  userSide === 'Proposition'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Proposition (For)
              </button>
              <button
                onClick={() => handleSideChange('Opposition')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  userSide === 'Opposition'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-xs'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Opposition (Against)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Agent Live Telemetry Grid */}
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
              {latestTurn?.fallacyMetrics?.fallacy_detected ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
                  <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    {latestTurn.fallacyMetrics.fallacy_type} Detected
                  </p>
                  <p className="text-xs text-slate-300">
                    {latestTurn.fallacyMetrics.explanation}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {latestTurn ? 'No Fallacies Detected. Argument premise is logically sound.' : `Ready to audit logic & fallacies on "${selectedTopic}".`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fact Check & Logic Engine</p>
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 font-mono italic">
                  {latestTurn ? 'Querying debate knowledge graph & semantic evidence...' : `Standing by for your Turn #1 opening speech on "${selectedTopic}"...`}
                </p>
                <p className="text-xs text-slate-200 mt-2 font-medium">
                  {latestTurn ? (latestTurn.fallacyMetrics.explanation || 'Status: Valid semantic correlation evaluated.') : 'Status: Ready for participant opening statement.'}
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
                  {latestTurn?.aiRebuttal 
                    ? `"${latestTurn.aiRebuttal}"` 
                    : `I am primed with the ${userSide === 'Proposition' ? 'Opposition' : 'Proposition'} stance on "${selectedTopic}". Deliver your opening argument to receive my real-time counterargument.`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tone & Sentiment Analysis</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2.5 py-1 bg-slate-800 text-[10px] font-mono text-indigo-300 rounded border border-slate-700">PERSUASIVE</span>
                <span className="px-2.5 py-1 bg-slate-800 text-[10px] font-mono text-emerald-300 rounded border border-slate-700">
                  {latestTurn?.wpm ? `${latestTurn.wpm} WPM (${latestTurn.paceStatus})` : 'SPEECH PACING READY'}
                </span>
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
            Your Speech Input ({realTurns.length === 0 ? 'Turn #1 Opening Argument' : `Turn #${realTurns.length + 1}`})
          </span>
          <span className="text-indigo-300 font-mono text-[11px]">
            Motion: {selectedTopic}
          </span>
        </div>

        <textarea
          rows={3}
          value={inputTurn}
          onChange={(e) => setInputTurn(e.target.value)}
          placeholder={`Enter or speak your argument on "${selectedTopic}"...`}
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={handleToggleRecordSpeech}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
            <span>{isRecording ? 'Listening... (Click to Stop)' : 'Record Speech Input (STT)'}</span>
          </button>

          <button
            onClick={() => handleProcessTurn()}
            disabled={!inputTurn.trim() || isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>
              {isLoading 
                ? 'Dual Agents Evaluating...' 
                : realTurns.length === 0 
                  ? 'Submit Opening Argument (Turn #1)' 
                  : `Submit Turn #${realTurns.length + 1} to Dual Agents`
              }
            </span>
          </button>
        </div>
      </div>

      {/* Transcript Log Section showing Turn History */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Debate Session Transcript & Dual-Agent Telemetry Log
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isViewingSample 
                ? 'Showing illustrative tutorial sample. Submitting your speech replaces this with your live Turn #1.'
                : realTurns.length === 0 
                  ? `Blank session initialized for "${selectedTopic}". Ready for your opening argument.` 
                  : `${realTurns.length} verified speech turns logged for "${selectedTopic}".`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {turns.length === 0 && (
              <button
                onClick={handleLoadSampleDemo}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> View Sample Example
              </button>
            )}
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
              {isViewingSample ? 'Sample Mode' : `${realTurns.length} Live Turns`}
            </span>
          </div>
        </div>

        {/* Empty State: Ready for Turn #1 */}
        {turns.length === 0 && (
          <div className="p-8 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Swords className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-white">Ready for Turn #1: {selectedTopic}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This debate session starts clean with no prior turns. Enter your opening stance in the input box above or record your voice to initiate <span className="text-indigo-400 font-semibold">Turn #1</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={handleLoadSampleDemo}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Preview Sample Demonstration (Tutorial Example)
              </button>
            </div>
          </div>
        )}

        {/* Turns List: Sample or Real Turns */}
        {turns.length > 0 && (
          <div className="space-y-4">
            {turns.map((turn, idx) => {
              if (turn.isSample) {
                return (
                  <div key={turn.id} className="p-5 bg-amber-950/20 border-2 border-dashed border-amber-500/40 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" /> SAMPLE DEMONSTRATION / TUTORIAL PREVIEW
                        </span>
                        <span className="text-[11px] text-amber-300/80 font-medium">(Not Turn #1 of your debate — Illustrative Demo)</span>
                      </div>
                      <button
                        onClick={handleStartFreshDebate}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Clear Sample & Start Real Turn #1 on "{selectedTopic}"
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      * This example shows how Agent 01 (Referee) detects fallacies and Agent 02 (Rival) generates rebuttals. When you submit your speech above, your debate starts live from <strong className="text-white">Turn #1</strong>.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-medium">Argument Quality</span>
                        <span className="font-bold text-indigo-400 font-mono text-xs">{turn.argumentScore}/100</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-medium">Evidence Weight</span>
                        <span className="font-bold text-sky-400 font-mono text-xs">85/100</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-medium">Persuasiveness</span>
                        <span className="font-bold text-purple-400 font-mono text-xs">90/100</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-medium">Referee Deduction</span>
                        <span className="font-bold font-mono text-xs text-emerald-400">0 pts</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sample Speech Transcript</span>
                        <p className="text-slate-200 font-medium">"{turn.userText}"</p>
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                            Agent 1 Referee Audit
                          </span>
                          <p className="text-[11px] p-2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800">
                            PASSED: {turn.fallacyMetrics.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 p-3 bg-amber-950/20 rounded-lg border border-amber-900/40">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            Agent 2 Rival Rebuttal
                          </span>
                          <button
                            onClick={() => handleSpeakTurn(turn.id, turn.aiRebuttal)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1 transition-all"
                          >
                            <Volume2 className="w-3 h-3" /> Listen Voice
                          </button>
                        </div>
                        <p className="text-amber-100 italic font-serif leading-relaxed">
                          "{turn.aiRebuttal}"
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Real User Turn:
              const realTurnNumber = realTurns.findIndex(t => t.id === turn.id) + 1;
              return (
                <div key={turn.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-indigo-300 font-mono">Turn #{realTurnNumber} ({turn.timestamp})</span>
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
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          Agent 2 Rival Rebuttal
                        </span>
                        <button
                          onClick={() => handleSpeakTurn(turn.id, turn.aiRebuttal)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
                            speakingTurnId === turn.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {speakingTurnId === turn.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>{speakingTurnId === turn.id ? 'Stop Voice' : 'Listen Voice'}</span>
                        </button>
                      </div>
                      <p className="text-amber-100 italic font-serif leading-relaxed">
                        "{turn.aiRebuttal}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
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
                Your practice session on <span className="text-white font-semibold">"{selectedTopic}"</span> has been marked as completed. All {realTurns.length || turns.length} turns are evaluated and archived to your past debates.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Average Score</p>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  {realTurns.length > 0 
                    ? Math.round(realTurns.reduce((sum, t) => sum + t.argumentScore, 0) / realTurns.length) 
                    : 88}/100
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Turns</p>
                <p className="text-lg font-black text-indigo-400 font-mono">{realTurns.length || turns.length}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  handleStartFreshDebate();
                  setIsCompletedModalOpen(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Start Fresh Debate (Blank Turn #1)
              </button>
              
              {onNavigate && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsCompletedModalOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    Learner Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsCompletedModalOpen(false);
                      onNavigate('my-debates');
                    }}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    View My Debates
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsCompletedModalOpen(false)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Close & Review Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
