import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Swords, 
  Clock, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Lightbulb, 
  CheckCircle2, 
  Zap, 
  Play, 
  Square, 
  RotateCcw,
  Volume2,
  ChevronRight,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentAvatar from '../components/AgentAvatar';
import AudioVisualizer from '../components/AudioVisualizer';
import { triggerCelebration } from '../components/ConfettiTrigger';


export default function DebateRoom() {
  const { user, authFetch } = useAuth();
  const location = useLocation();

  // Debate Staging & Setup
  const [inDebate, setInDebate] = useState(false);
  const [topic, setTopic] = useState('Artificial Intelligence will replace human artists');
  const [format, setFormat] = useState('Oxford Debate');
  const [userPosition, setUserPosition] = useState('Pro');
  const [aiPersonality, setAiPersonality] = useState('Socrates');
  const [provider, setProvider] = useState('Local Simulation Engine');

  // Coach & Educator Student Hub State
  const [studentsList, setStudentsList] = useState([]);
  const [targetStudentId, setTargetStudentId] = useState('all');
  const [topicType, setTopicType] = useState('select');
  const [customTopic, setCustomTopic] = useState('');

  // Topics & Sessions List
  const [topicsList, setTopicsList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Topic Creation Form State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Technology & Society');
  const [newTopicFormat, setNewTopicFormat] = useState('One-on-One Debate');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState('Intermediate');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // Session Schedule Form State
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState(30);

  // Active Session Details
  const [sessionId, setSessionId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState('User');
  const [turnTimer, setTurnTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Rebuttals & Tactical Advice
  const [rebuttals, setRebuttals] = useState([]);
  const [loadingRebuttals, setLoadingRebuttals] = useState(false);

  // Speech input & transcribing
  const [userText, setUserText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [coachAdvice, setCoachAdvice] = useState([]);

  // Refs
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const autoStartHandledRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    fetchTopics();
    fetchSessions();
    if (user?.role && user?.role !== 'Learner') {
      fetchStudents();
    }

    return () => {
      stopTimer();
      stopSpeech();
    };
  }, [user?.role]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramSessionId = params.get('session_id') || location.state?.sessionId;
    const paramTab = params.get('tab');
    const stateTopic = location.state?.topic || params.get('topic');
    const stateFormat = location.state?.format || params.get('format');
    const autoStart = location.state?.autoStart || params.get('autoStart') === 'true';

    if (paramSessionId && !autoStartHandledRef.current) {
      autoStartHandledRef.current = true;
      resumeDebateSession(parseInt(paramSessionId));
    } else if (stateTopic && autoStart && !autoStartHandledRef.current) {
      autoStartHandledRef.current = true;
      startDebateWithTopic(stateTopic, stateFormat);
    } else if (stateTopic) {
      setTopic(stateTopic);
      if (stateFormat) setFormat(stateFormat);
    }

    if (paramTab === 'student_hub') {
      setTimeout(() => {
        document.getElementById('student-debate-hub')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.search, location.state]);

  const fetchStudents = async () => {
    try {
      const res = await authFetch('/auth/users');
      if (res.ok) {
        const data = await res.json();
        const learnerStudents = data.filter(u => u.role === 'Learner');
        setStudentsList(learnerStudents);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch user directory for debate hub', err);
    }

    setStudentsList([
      { id: 901, name: 'Usha Sharma', email: 'usha@example.com', role: 'Learner' },
      { id: 902, name: 'Arjun Verma', email: 'arjun@example.com', role: 'Learner' },
      { id: 903, name: 'Riya Patel', email: 'riya@example.com', role: 'Learner' },
      { id: 904, name: 'Karan Mehta', email: 'karan@example.com', role: 'Learner' },
      { id: 905, name: 'Sneha Kulkarni', email: 'sneha@example.com', role: 'Learner' }
    ]);
  };

  const handleLaunchStudentDebate = async (e) => {
    e.preventDefault();
    setError('');
    const finalTopic = topicType === 'select' ? topic : customTopic;
    if (!finalTopic || !finalTopic.trim()) {
      setError('Please specify a valid debate topic/motion.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        topic: finalTopic,
        format: format,
        user_position: userPosition,
        position_role: userPosition,
        ai_personality: aiPersonality,
        provider: provider,
        target_all: targetStudentId === 'all',
        student_id: targetStudentId === 'all' ? -1 : parseInt(targetStudentId)
      };

      const res = await authFetch('/debates/sessions', {
        method: 'POST',
        body: payload
      });

      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setTopic(session.topic);
        setTurns([]);
        setInDebate(true);
        setActiveSpeaker('User');
        setCoachAdvice([
          targetStudentId === 'all'
            ? "🚀 Live Debate Session broadcast to ALL enrolled students! Opening round is ready."
            : "🚀 Live Debate Session assigned & initialized! Opening round is ready."
        ]);
        startTimer();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.detail || 'Could not initialize live student debate session.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to launch live student debate session.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await authFetch('/debates/topics');
      if (res.ok) {
        const data = await res.json();
        setTopicsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch debate topics', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await authFetch('/debates/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessionsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch debate sessions', err);
    }
  };

  const resumeDebateSession = async (sid) => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/debates/sessions/${sid}`);
      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setTopic(session.topic);
        setFormat(session.format);
        setUserPosition(session.user_position);
        setAiPersonality(session.ai_personality);
        setProvider(session.provider);
        setTurns(session.turns || []);
        setInDebate(true);
        setActiveSpeaker('User');
        setCoachAdvice(["Resumed assigned debate session! Construct your next argument and submit it below."]);
        startTimer();
      }
    } catch (err) {
      console.error(err);
      setError('Could not load assigned debate session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [turns]);

  // Timers & Speech Recognition
  const startTimer = () => {
    stopTimer();
    setTurnTimer(120);
    setIsTimerActive(true);
    timerIntervalRef.current = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const stopSpeech = () => {
    setIsMicActive(false);
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  const toggleMicTrans = () => {
    if (isMicActive) {
      stopSpeech();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError('');
    setIsMicActive(true);
    setIsRecording(true);
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let finalSpeech = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript + ' ';
        }
      }
      if (finalSpeech) {
        setUserText(prev => prev + finalSpeech);
      }
    };

    rec.onerror = (e) => {
      console.error(e);
      setIsMicActive(false);
      setIsRecording(false);
    };

    rec.start();
    recognitionRef.current = rec;
  };

  const startDebateWithTopic = async (selectedTopic, selectedFormat) => {
    setError('');
    setLoading(true);
    const chosenTopic = selectedTopic || topic;
    const chosenFormat = selectedFormat || format || 'Oxford Debate';
    setTopic(chosenTopic);
    setFormat(chosenFormat);

    try {
      const res = await authFetch('/debates/sessions', {
        method: 'POST',
        body: {
          topic: chosenTopic,
          format: chosenFormat,
          user_position: userPosition,
          position_role: userPosition,
          ai_personality: aiPersonality,
          provider: provider
        }
      });

      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setTurns([]);
        setInDebate(true);
        setActiveSpeaker('User');
        setCoachAdvice([`The debate on "${chosenTopic}" is open! Present your opening constructive argument below.`]);
        startTimer();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.detail || 'Could not initialize debate session.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not initialize debate session.');
    } finally {
      setLoading(false);
    }
  };

  // Staging Actions
  const handleStartDebate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await startDebateWithTopic(topic, format);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    try {
      const res = await authFetch('/debates/topics', {
        method: 'POST',
        body: {
          title: newTopicTitle,
          category: newTopicCategory,
          target_format: newTopicFormat,
          difficulty: newTopicDifficulty,
          description: newTopicDesc
        }
      });
      if (res.ok) {
        const created = await res.json();
        setTopic(created.title);
        setFormat(created.target_format || 'One-on-One Debate');
        setShowTopicModal(false);
        setNewTopicTitle('');
        setNewTopicDesc('');
        fetchTopics();
      }
    } catch (err) {
      console.error(err);
      setError('Could not create custom debate topic.');
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!scheduleDateTime) return;
    try {
      const res = await authFetch('/debates/sessions/schedule', {
        method: 'POST',
        body: {
          topic,
          format,
          user_position: userPosition,
          scheduled_at: scheduleDateTime,
          duration_minutes: parseInt(scheduleDuration),
          ai_personality: aiPersonality
        }
      });
      if (res.ok) {
        setShowScheduleModal(false);
        alert(`Debate Session scheduled for ${new Date(scheduleDateTime).toLocaleString()}!`);
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to schedule debate session.');
    }
  };

  const handleSwapPosition = async (newPos) => {
    setUserPosition(newPos);
    if (sessionId) {
      try {
        await authFetch(`/debates/sessions/${sessionId}/assign-position`, {
          method: 'POST',
          body: {
            session_id: sessionId,
            user_position: newPos,
            position_role: newPos
          }
        });
      } catch (err) {
        console.error('Failed to update position on backend', err);
      }
    }
  };

  const handleSubmitSpeech = async (e) => {
    e.preventDefault();
    if (!userText.trim()) return;

    setSubmitting(true);
    setError('');
    setRebuttals([]);
    stopTimer();
    stopSpeech();

    const currentText = userText;
    setUserText('');

    try {
      const res = await authFetch(`/debates/sessions/${sessionId}/turns`, {
        method: 'POST',
        body: { text: currentText }
      });

      if (res.ok) {
        const addedTurns = await res.json();
        setTurns(prev => [...prev, ...addedTurns]);
        
        const userTurnAnalysis = addedTurns[0].analysis_json || {};
        if (userTurnAnalysis.rebuttal_hints) {
          setCoachAdvice(userTurnAnalysis.rebuttal_hints);
        }
        
        setActiveSpeaker('User');
        startTimer();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit argument.');
      setUserText(currentText);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchRebuttalStrategies = async () => {
    try {
      setLoadingRebuttals(true);
      setError('');
      const res = await authFetch(`/debates/sessions/${sessionId}/rebuttals`);
      if (res.ok) {
        const data = await res.json();
        setRebuttals(data);
      } else {
        setError('Could not generate rebuttal suggestions.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with counterargument service.');
    } finally {
      setLoadingRebuttals(false);
    }
  };

  const handleCompleteDebate = async () => {
    setCompleting(true);
    stopTimer();
    stopSpeech();

    try {
      const res = await authFetch(`/debates/sessions/${sessionId}/complete`, {
        method: 'PUT'
      });

      if (res.ok) {
        triggerCelebration();
        setInDebate(false);
        setSessionId(null);
        alert("Debate Completed! Performance metrics updated in profile skills.");
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to close session.');
    } finally {
      setCompleting(false);
    }
  };

  const getFormatDetails = (fmt) => {
    switch (fmt) {
      case 'Parliamentary Debate':
        return {
          roles: ['Government (Prime Minister)', 'Opposition (Leader of Opp)'],
          structure: 'Formal parliamentary rules with Points of Information (POIs).',
          badge: '🏛️ Parliamentary'
        };
      case 'Oxford Debate':
        return {
          roles: ['Affirmative (Proposing Motion)', 'Negative (Opposing Motion)'],
          structure: 'Academic motion evaluation, data-heavy, pre and post voting.',
          badge: '🎓 Oxford Style'
        };
      case 'Policy Debate':
        return {
          roles: ['Affirmative (Policy Plan)', 'Negative (Status Quo Defender)'],
          structure: 'Policy plan, harms, solvency, disadvantages, and counter-plans.',
          badge: '📜 Policy Debate'
        };
      case 'Public Forum Debate':
        return {
          roles: ['Pro', 'Con'],
          structure: 'Constructive, Rebuttal, Crossfire, Summary, and Final Focus.',
          badge: '🗣️ Public Forum'
        };
      case 'AI Debate Simulation':
        return {
          roles: ['User Role', 'AI Opponent Persona'],
          structure: 'Dynamic multi-turn AI reasoning simulation.',
          badge: '🤖 AI Simulation'
        };
      default:
        return {
          roles: ['Pro (Affirmative)', 'Con (Negative)'],
          structure: 'Direct adversarial counter-points.',
          badge: '⚔️ One-on-One'
        };
    }
  };

  const getPersonaAvatar = (persona) => {
    switch (persona) {
      case 'Socrates': return '🦉';
      case 'Pragmatist': return '📊';
      case 'Aggressor': return '⚡';
      default: return '👤';
    }
  };

  const formatTimerVal = (val) => {
    const mins = Math.floor(val / 60);
    const secs = val % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportTranscript = () => {
    const lines = turns.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}\n`);
    const blob = new Blob([`DEBATE SESSION TRANSCRIPT\nTopic: ${topic}\nFormat: ${format}\nPosition: ${userPosition}\n\n` + lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate_transcript_session_${sessionId || 'recording'}.txt`;
    a.click();
  };

  // -----------------------------------------------------------------
  // STAGING VIEW (NOT IN DEBATE)
  // -----------------------------------------------------------------
  if (!inDebate) {
    const fmtDetails = getFormatDetails(format);

    return (
      <div style={styles.container}>
        <Link to="/" style={styles.backLink}>← Back to Dashboard</Link>
        
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.mainTitle}>Debate Session Management</h2>
            <p style={styles.mainSub}>Configure topics, format rules, position assignments, or schedule upcoming debates.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setShowTopicModal(true)}>
              ➕ Create Topic
            </button>
            <button className="btn-secondary" onClick={() => setShowScheduleModal(true)}>
              📅 Schedule Session
            </button>
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {/* Coach & Educator Live Student Debate Hub Section */}
        {user?.role && user?.role !== 'Learner' && (
          <div 
            id="student-debate-hub"
            className="glass-panel pulse-glow" 
            style={{ 
              padding: '30px', 
              borderRadius: '24px', 
              background: 'rgba(15, 23, 42, 0.75)', 
              border: '1px solid rgba(6, 182, 212, 0.4)',
              marginBottom: '32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}>
                <Swords size={26} color="#020617" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                  👨‍🏫 Coach & Educator Live Student Debate Hub
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
                  Create and launch a live debate session for a particular student or broadcast to all enrolled students at once.
                </p>
              </div>
            </div>

            <form onSubmit={handleLaunchStudentDebate} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              {/* Target Student & Topic Source Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#06b6d4', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Target Student(s)
                  </label>
                  <select 
                    value={targetStudentId} 
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <option value="all">🌟 ALL Enrolled Students (Broadcast Live Debate to Everyone)</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>
                        👤 {s.name || s.email.split('@')[0]} ({s.email}) — [{s.experience_level || 'Learner'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#06b6d4', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Debate Motion Source
                  </label>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '46px' }}>
                    <label style={{ fontSize: '0.9rem', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="radio" name="hubTopicType" checked={topicType === 'select'} onChange={() => setTopicType('select')} />
                      <span>Topic Bank</span>
                    </label>
                    <label style={{ fontSize: '0.9rem', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="radio" name="hubTopicType" checked={topicType === 'custom'} onChange={() => setTopicType('custom')} />
                      <span>Custom Motion</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Motion Input */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Debate Motion / Topic
                </label>
                {topicType === 'select' ? (
                  <select 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  >
                    {topicsList.map(t => (
                      <option key={t.id} value={t.title}>{t.title} ({t.category || 'General'})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Mandatory Carbon Tax Systems Should Be Implemented Globally..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                )}
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Debate Format
                  </label>
                  <select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc'
                    }}
                  >
                    <option value="One-on-One Debate">One-on-One Debate</option>
                    <option value="Parliamentary Debate">Parliamentary Debate</option>
                    <option value="Oxford Debate">Oxford Debate</option>
                    <option value="Policy Debate">Policy Debate</option>
                    <option value="Public Forum Debate">Public Forum Debate</option>
                    <option value="AI Debate Simulation">AI Debate Simulation</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Assigned Stance
                  </label>
                  <select 
                    value={userPosition} 
                    onChange={(e) => setUserPosition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc'
                    }}
                  >
                    <option value="Pro">Pro / Affirmative</option>
                    <option value="Con">Con / Opposition</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    AI Opponent Persona
                  </label>
                  <select 
                    value={aiPersonality} 
                    onChange={(e) => setAiPersonality(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc'
                    }}
                  >
                    <option value="Socrates">Socrates (Philosophical)</option>
                    <option value="Machiavelli">Machiavelli (Pragmatist)</option>
                    <option value="Carl Sagan">Carl Sagan (Empirical)</option>
                    <option value="Winston Churchill">Winston Churchill (Eloquence)</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', height: '52px', justifyContent: 'center' }}>
                <Swords size={20} />
                <span>{loading ? 'Initializing Live Session...' : '🚀 Launch Live Student Debate Session'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TOPIC CREATION MODAL */}
        {showTopicModal && (
          <div style={styles.modalBackdrop}>
            <div className="glass-panel" style={styles.modalCard}>
              <h3 style={styles.cardTitle}>➕ Create Custom Debate Topic</h3>
              <form onSubmit={handleCreateTopic}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Topic Motion / Title</label>
                  <input
                    type="text"
                    required
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="e.g. Mandatory Carbon Tax Systems Should Be Implemented Globally"
                  />
                </div>
                <div style={styles.setupRow}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Category</label>
                    <select value={newTopicCategory} onChange={(e) => setNewTopicCategory(e.target.value)}>
                      <option value="Technology & Society">Technology & Society</option>
                      <option value="Economics & Policy">Economics & Policy</option>
                      <option value="Ethics & Philosophy">Ethics & Philosophy</option>
                      <option value="Environment & Global">Environment & Global</option>
                    </select>
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Target Format</label>
                    <select value={newTopicFormat} onChange={(e) => setNewTopicFormat(e.target.value)}>
                      <option value="One-on-One Debate">One-on-One Debate</option>
                      <option value="Parliamentary Debate">Parliamentary Debate</option>
                      <option value="Oxford Debate">Oxford Debate</option>
                      <option value="Policy Debate">Policy Debate</option>
                      <option value="Public Forum Debate">Public Forum Debate</option>
                      <option value="AI Debate Simulation">AI Debate Simulation</option>
                    </select>
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Difficulty</label>
                    <select value={newTopicDifficulty} onChange={(e) => setNewTopicDifficulty(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Motion Description / Background</label>
                  <textarea
                    rows="2"
                    value={newTopicDesc}
                    onChange={(e) => setNewTopicDesc(e.target.value)}
                    placeholder="Brief background context for the motion..."
                  />
                </div>
                <div style={styles.modalActions}>
                  <button type="button" className="btn-secondary" onClick={() => setShowTopicModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Topic</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SESSION SCHEDULING MODAL */}
        {showScheduleModal && (
          <div style={styles.modalBackdrop}>
            <div className="glass-panel" style={styles.modalCard}>
              <h3 style={styles.cardTitle}>📅 Schedule Debate Session</h3>
              <form onSubmit={handleScheduleSession}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Debate Topic</label>
                  <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {topicsList.map(t => (
                      <option key={t.id} value={t.title}>{t.title} ({t.category || 'General'})</option>
                    ))}
                  </select>
                </div>
                <div style={styles.setupRow}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Duration (Minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="120"
                      value={scheduleDuration}
                      onChange={(e) => setScheduleDuration(e.target.value)}
                    />
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" className="btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Schedule Debate</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STANDARD LEARNER DEBATE SETUP CARD (Hidden for Coach & Educator) */}
        {(!user?.role || user?.role === 'Learner') && (
          <form onSubmit={handleStartDebate} className="glass-panel animate-slide-in" style={styles.setupCard}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Debate Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} style={styles.selectLarge}>
                {topicsList.length > 0 ? (
                  topicsList.map(t => (
                    <option key={t.id} value={t.title}>{t.title} — [{t.category || 'General'}]</option>
                  ))
                ) : (
                  <option value="Artificial Intelligence will replace human artists">Artificial Intelligence will replace human artists</option>
                )}
              </select>
            </div>

            <div style={styles.setupRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Debate Format (Module 3)</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="One-on-One Debate">One-on-One Debate</option>
                  <option value="Parliamentary Debate">Parliamentary Debate</option>
                  <option value="Oxford Debate">Oxford Debate</option>
                  <option value="Policy Debate">Policy Debate</option>
                  <option value="Public Forum Debate">Public Forum Debate</option>
                  <option value="AI Debate Simulation">AI Debate Simulation</option>
                </select>
              </div>

              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Position Role Assignment</label>
                <select value={userPosition} onChange={(e) => setUserPosition(e.target.value)}>
                  <option value="Pro">Pro / Affirmative / Government</option>
                  <option value="Con">Con / Negative / Opposition</option>
                </select>
              </div>

              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>AI Opponent Persona</label>
                <select value={aiPersonality} onChange={(e) => setAiPersonality(e.target.value)}>
                  <option value="Socrates">Socrates (Philosophical & Inquisitive)</option>
                  <option value="Pragmatist">Pragmatist (Data & Feasibility Focused)</option>
                  <option value="Aggressor">Aggressor (Assertive & Refutational)</option>
                </select>
              </div>
            </div>

            {/* Format Info & Position Matrix */}
            <div style={styles.formatRuleBox}>
              <div style={styles.badgeLabel}>{fmtDetails.badge}</div>
              <p style={{ margin: '6px 0 0 0', color: '#e2e8f0', fontSize: '0.9rem' }}>
                <strong>Roles:</strong> {fmtDetails.roles.join(' VS ')} | <strong>Rules:</strong> {fmtDetails.structure}
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={styles.startBtn}>
              {loading ? 'Initializing Session...' : '🚀 Launch Debate Session'}
            </button>
          </form>
        )}

        {/* RECENT SESSIONS TABLE */}
        {sessionsList.length > 0 && (
          <div className="glass-panel" style={{ marginTop: '24px', padding: '20px' }}>
            <h3 style={styles.cardTitle}>📋 Scheduled & Recent Debate Sessions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Format</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map(s => (
                    <tr key={s.id}>
                      <td style={{ color: '#f8fafc', fontWeight: 500 }}>{s.topic}</td>
                      <td><span style={styles.tableBadge}>{s.format}</span></td>
                      <td>{s.user_position}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: s.status === 'completed' ? '#059669' : (s.status === 'scheduled' ? '#d97706' : '#2563eb'),
                          color: '#fff'
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        {s.status !== 'completed' && (
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => resumeDebateSession(s.id)}>
                            Resume Session
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------------------------------
  // ACTIVE DEBATE ROOM VIEW
  // -----------------------------------------------------------------
  const latestUserTurn = [...turns].reverse().find(t => t.speaker === 'User');
  const latestAnalysis = latestUserTurn?.analysis_json || {};
  const scores = latestAnalysis.scores || {};
  const fallacies = latestAnalysis.fallacies || [];
  const claims = latestAnalysis.extracted_claims || [];
  const evidence = latestAnalysis.evaluated_evidence || [];
  const reasoningQuality = latestAnalysis.reasoning_quality || '';
  const credibilityScore = latestAnalysis.credibility_score ?? 100;

  return (
    <div style={styles.container}>
      {/* HEADER BAR */}
      <div className="glass-panel" style={styles.headerBar}>
        <div>
          <span style={styles.formatTag}>{getFormatDetails(format).badge}</span>
          <h2 style={styles.activeTopic}>{topic}</h2>
          <div style={styles.metaRow}>
            <span>Role: <strong>{userPosition}</strong></span>
            <span>AI Opponent: <strong>{getPersonaAvatar(aiPersonality)} {aiPersonality}</strong></span>
            <span>Session ID: #{sessionId}</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.timerBadge}>
            ⏱️ Turn Timer: <span style={{ color: turnTimer < 30 ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>{formatTimerVal(turnTimer)}</span>
          </div>
          <button className="btn-secondary" onClick={exportTranscript} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            📥 Export Recording
          </button>
          <button className="btn-secondary" onClick={handleCompleteDebate} disabled={completing} style={styles.finishBtn}>
            {completing ? 'Concluding...' : 'Finish Debate'}
          </button>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.debateGrid}>
        {/* LEFT COLUMN: DIALOGUE HISTORY & USER INPUT */}
        <div style={styles.mainCol}>
          <div className="glass-panel" style={styles.chatBox} ref={scrollContainerRef}>
            {turns.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>🎤 The stage is set!</p>
                <p style={{ color: '#64748b' }}>Submit your opening constructive speech to begin the debate.</p>
              </div>
            ) : (
              turns.map((turn, index) => {
                const isUser = turn.speaker === 'User';
                return (
                  <div key={index} style={isUser ? styles.userBubbleWrap : styles.aiBubbleWrap}>
                    <div style={isUser ? styles.userAvatar : styles.aiAvatar}>
                      {isUser ? '👤' : getPersonaAvatar(aiPersonality)}
                    </div>
                    <div style={isUser ? styles.userBubble : styles.aiBubble}>
                      <div style={styles.speakerTitle}>{isUser ? `You (${userPosition})` : `${aiPersonality} (${userPosition === 'Pro' ? 'Con' : 'Pro'})`}</div>
                      <p style={styles.turnText}>{turn.text}</p>

                      {/* Display quick inline metric pill if present */}
                      {isUser && turn.analysis_json?.scores && (
                        <div style={styles.turnScorePill}>
                          <span>Persuasiveness: <strong>{turn.analysis_json.scores.persuasiveness}</strong>/100</span>
                          {turn.analysis_json.fallacies?.length > 0 && (
                            <span style={{ color: '#ef4444' }}> ⚠️ {turn.analysis_json.fallacies[0].fallacy}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {submitting && (
              <div style={styles.aiBubbleWrap}>
                <div style={styles.aiAvatar}>{getPersonaAvatar(aiPersonality)}</div>
                <div style={{ ...styles.aiBubble, opacity: 0.7 }}>
                  <div style={styles.speakerTitle}>{aiPersonality} is thinking & analyzing...</div>
                  <div className="typing-dots"><span>.</span><span>.</span><span>.</span></div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT FORM & RECORDING CONTROLS */}
          <form onSubmit={handleSubmitSpeech} className="glass-panel" style={styles.inputArea}>
            <div style={styles.recordingStatusRow}>
              <button
                type="button"
                onClick={toggleMicTrans}
                className={isMicActive ? "btn-danger" : "btn-secondary"}
                style={styles.micBtn}
                title={speechSupported ? "Toggle Microphone Speech-to-Text" : "Browser speech recognition not supported"}
              >
                {isMicActive ? '🛑 Stop Recording' : '🎤 Speech Mic'}
              </button>
              {isRecording && <span style={styles.recBadge}>🔴 Recording Speech Transcript...</span>}
            </div>

            <textarea
              rows="3"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="State your claim, introduce statistical/empirical evidence, and logically connect your conclusion..."
              style={styles.textarea}
            />

            <div style={styles.submitRow}>
              <div style={styles.positionSwitchGroup}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Stance:</span>
                <button type="button" className={userPosition === 'Pro' ? 'btn-primary' : 'btn-secondary'} onClick={() => handleSwapPosition('Pro')} style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Pro</button>
                <button type="button" className={userPosition === 'Con' ? 'btn-primary' : 'btn-secondary'} onClick={() => handleSwapPosition('Con')} style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Con</button>
              </div>

              <button
                type="button"
                onClick={fetchRebuttalStrategies}
                disabled={loadingRebuttals || turns.length === 0}
                className="btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                {loadingRebuttals ? 'Generating...' : '💡 Tactical Hints'}
              </button>

              <button
                type="submit"
                disabled={submitting || !userText.trim()}
                className="btn-primary"
                style={{ padding: '8px 24px' }}
              >
                {submitting ? 'Evaluating...' : 'Submit Argument 🚀'}
              </button>
            </div>
          </form>

          {/* REBUTTAL STRATEGIES DRAWER */}
          {rebuttals.length > 0 && (
            <div className="glass-panel animate-slide-in" style={{ marginTop: '16px', padding: '16px' }}>
              <h4 style={styles.cardTitle}>🎯 Counterargument Rebuttal Strategies</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '10px' }}>
                {rebuttals.map((strat, idx) => (
                  <div key={idx} style={styles.rebuttalCard}>
                    <h5 style={{ margin: '0 0 6px 0', color: '#38bdf8' }}>{strat.strategy_name}</h5>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 8px 0' }}>{strat.description}</p>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', width: '100%' }}
                      onClick={() => setUserText(strat.starter_text)}
                    >
                      Use Strategy Starter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MODULE 4 (ARGUMENT ANALYSIS) & MODULE 5 (FALLACY FILTER) */}
        <div style={styles.sideCol}>
          {/* MODULE 4: ARGUMENT ANALYSIS ENGINE PANEL */}
          <div className="glass-panel" style={styles.analysisPanel}>
            <h3 style={styles.panelTitle}>📊 Module 4: Argument Analysis</h3>
            
            {scores.clarity !== undefined ? (
              <>
                <div style={styles.scoresGrid}>
                  <div style={styles.scoreItem}>
                    <span>Clarity</span>
                    <div style={styles.meterBar}><div style={{ ...styles.meterFill, width: `${scores.clarity}%`, background: '#38bdf8' }}></div></div>
                    <strong>{scores.clarity}/100</strong>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Relevance</span>
                    <div style={styles.meterBar}><div style={{ ...styles.meterFill, width: `${scores.relevance}%`, background: '#818cf8' }}></div></div>
                    <strong>{scores.relevance}/100</strong>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Evidence</span>
                    <div style={styles.meterBar}><div style={{ ...styles.meterFill, width: `${scores.evidence_strength}%`, background: '#34d399' }}></div></div>
                    <strong>{scores.evidence_strength}/100</strong>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Consistency</span>
                    <div style={styles.meterBar}><div style={{ ...styles.meterFill, width: `${scores.logical_consistency}%`, background: '#fbbf24' }}></div></div>
                    <strong>{scores.logical_consistency}/100</strong>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Persuasiveness</span>
                    <div style={styles.meterBar}><div style={{ ...styles.meterFill, width: `${scores.persuasiveness}%`, background: '#f43f5e' }}></div></div>
                    <strong>{scores.persuasiveness}/100</strong>
                  </div>
                </div>

                {/* CLAIMS & EVIDENCE EXTRACTED */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={styles.subLabel}>🎯 Identified Claims ({claims.length})</h4>
                  {claims.map((c, idx) => (
                    <div key={idx} style={styles.claimBadge}>
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>[{c.type}]</span> {c.claim}
                    </div>
                  ))}

                  <h4 style={{ ...styles.subLabel, marginTop: '12px' }}>📑 Evaluated Evidence ({evidence.length})</h4>
                  {evidence.map((e, idx) => (
                    <div key={idx} style={styles.evidenceBadge}>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>[{e.type}]</span> {e.evidence_text}
                    </div>
                  ))}

                  {reasoningQuality && (
                    <div style={styles.reasoningBox}>
                      <strong>Reasoning Analysis:</strong> {reasoningQuality}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Submit an argument to trigger real-time Module 4 structural extraction & 5-criteria analysis.</p>
            )}
          </div>

          {/* MODULE 5: LOGICAL FALLACY DETECTION ENGINE PANEL */}
          <div className="glass-panel" style={{ ...styles.analysisPanel, marginTop: '16px' }}>
            <h3 style={styles.panelTitle}>🛡️ Module 5: Fallacy Detection Filter</h3>
            
            <div style={styles.credibilityRow}>
              <span>Credibility Score:</span>
              <span style={{
                color: credibilityScore >= 80 ? '#34d399' : (credibilityScore >= 50 ? '#fbbf24' : '#ef4444'),
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {credibilityScore}/100
              </span>
            </div>

            {fallacies.length > 0 ? (
              <div style={{ marginTop: '12px' }}>
                <div style={styles.foulBanner}>
                  ⚠️ LOGICAL FOUL DETECTED ({fallacies.length})
                </div>
                {fallacies.map((f, idx) => (
                  <div key={idx} style={styles.fallacyCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#ef4444' }}>{f.fallacy}</h4>
                      <span style={styles.sevBadge}>{f.severity || 'High'}</span>
                    </div>
                    <p style={{ margin: '6px 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <strong>Offending Phrase:</strong> "{f.match || f.offending_text}"
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {f.explanation}
                    </p>
                    <div style={styles.fixBox}>
                      💡 <strong>Correction:</strong> {f.correction}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '8px', marginTop: '12px', fontSize: '0.85rem', color: '#34d399' }}>
                ✅ Quality Filter Clear. Speech passed all 8 logical fallacy checks (Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring).
              </div>
            )}
          </div>

          {/* COACH ADVICE BOX */}
          {coachAdvice.length > 0 && (
            <div className="glass-panel" style={{ ...styles.analysisPanel, marginTop: '16px', borderColor: '#38bdf8' }}>
              <h3 style={{ ...styles.panelTitle, color: '#38bdf8' }}>💡 Coach Strategy Advice</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {coachAdvice.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#f8fafc'
  },
  backLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    marginBottom: '16px',
    display: 'inline-block'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  mainTitle: {
    fontSize: '2rem',
    margin: '0 0 6px 0',
    color: '#f8fafc'
  },
  mainSub: {
    color: '#94a3b8',
    margin: 0
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  setupCard: {
    padding: '24px',
    borderRadius: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  label: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    fontWeight: 600
  },
  selectLarge: {
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '8px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#fff'
  },
  setupRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  formatRuleBox: {
    background: 'rgba(56, 189, 248, 0.08)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px'
  },
  badgeLabel: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    background: '#0284c7',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  startBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '1.05rem',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    marginTop: '10px'
  },
  tableBadge: {
    background: '#334155',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    marginBottom: '20px',
    borderRadius: '16px'
  },
  formatTag: {
    fontSize: '0.8rem',
    color: '#38bdf8',
    fontWeight: 'bold'
  },
  activeTopic: {
    margin: '4px 0',
    fontSize: '1.3rem'
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: '#94a3b8'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  timerBadge: {
    background: '#0f172a',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    border: '1px solid #334155'
  },
  finishBtn: {
    background: '#ef4444',
    border: 'none',
    color: '#fff',
    padding: '6px 14px',
    fontSize: '0.85rem'
  },
  debateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '20px'
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  chatBox: {
    minHeight: '400px',
    maxHeight: '520px',
    overflowY: 'auto',
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  emptyState: {
    textAlign: 'center',
    margin: 'auto 0'
  },
  userBubbleWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  aiBubbleWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px'
  },
  userAvatar: {
    order: 2,
    fontSize: '1.4rem'
  },
  aiAvatar: {
    order: 1,
    fontSize: '1.4rem'
  },
  userBubble: {
    order: 1,
    maxWidth: '75%',
    background: '#0284c7',
    color: '#fff',
    padding: '14px 18px',
    borderRadius: '16px 16px 2px 16px'
  },
  aiBubble: {
    order: 2,
    maxWidth: '75%',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '14px 18px',
    borderRadius: '16px 16px 16px 2px'
  },
  speakerTitle: {
    fontSize: '0.75rem',
    opacity: 0.8,
    marginBottom: '4px',
    fontWeight: 'bold'
  },
  turnText: {
    margin: 0,
    lineHeight: '1.5',
    fontSize: '0.95rem'
  },
  turnScorePill: {
    marginTop: '8px',
    fontSize: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  inputArea: {
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  recordingStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  micBtn: {
    padding: '6px 14px',
    fontSize: '0.85rem'
  },
  recBadge: {
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    animation: 'pulse 1.5s infinite'
  },
  textarea: {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    resize: 'vertical'
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  positionSwitchGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  rebuttalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px'
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  analysisPanel: {
    padding: '18px',
    borderRadius: '16px'
  },
  panelTitle: {
    fontSize: '1rem',
    margin: '0 0 14px 0',
    color: '#f8fafc'
  },
  scoresGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  scoreItem: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr 45px',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#cbd5e1'
  },
  meterBar: {
    height: '6px',
    background: '#0f172a',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    borderRadius: '3px'
  },
  subLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: '0 0 6px 0',
    textTransform: 'uppercase'
  },
  claimBadge: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '0.8rem',
    marginBottom: '4px'
  },
  evidenceBadge: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '0.8rem',
    marginBottom: '4px'
  },
  reasoningBox: {
    marginTop: '10px',
    padding: '8px',
    background: '#0f172a',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  credibilityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#cbd5e1'
  },
  foulBanner: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  fallacyCard: {
    background: '#0f172a',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '8px'
  },
  sevBadge: {
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  fixBox: {
    marginTop: '6px',
    padding: '6px',
    background: 'rgba(56, 189, 248, 0.1)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#38bdf8'
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalCard: {
    width: '90%',
    maxWidth: '560px',
    padding: '24px',
    borderRadius: '16px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  }
};
