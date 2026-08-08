import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Presentation, 
  FileText, 
  BarChart3, 
  Zap, 
  Sparkles, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Award,
  Download,
  Flame,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentAvatar from '../components/AgentAvatar';
import AudioVisualizer from '../components/AudioVisualizer';
import { triggerCelebration } from '../components/ConfettiTrigger';


export default function SpeechStudio() {
  const { authFetch } = useAuth();
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('Speech Rehearsal');
  
  // Real-time live stats
  const [fillerCounts, setFillerCounts] = useState({});
  const [wpm, setWpm] = useState(0);
  
  // Fallbacks & audio visualization
  const [speechSupported, setSpeechSupported] = useState(true);
  const [textMode, setTextMode] = useState(false);

  // Analysis result
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  // Refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);

  // Web Speech API word lists for scanning
  const FILLER_WORDS = ["um", "uh", "ah", "like", "basically", "you know", "actually", "literally", "so"];

  useEffect(() => {
    // 1. Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setTextMode(true);
    }
    
    // Fetch past history
    fetchHistory();
    
    return () => {
      stopAllMedia();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      if (!authFetch) return;
      const res = await authFetch('/presentation/history');
      if (res && res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  const stopAllMedia = () => {
    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Stop Web Speech
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    // Stop canvas animation
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    // Close Audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // -----------------------------------------------------------------
  // Audio Waveform Visualization
  // -----------------------------------------------------------------
  const startCanvasVisualization = (stream) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      if (!canvas) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#030712'; // Match app background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      // Dynamic colors for the waves
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06b6d4'); // sky blue
      gradient.addColorStop(0.5, '#a855f7'); // purple
      gradient.addColorStop(1, '#f43f5e'); // rose
      
      ctx.fillStyle = gradient;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.0;
        
        // Draw bars symmetrically
        ctx.fillRect(x, canvas.height/2 - barHeight/2, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    
    draw();
  };

  // -----------------------------------------------------------------
  // Recording controls
  // -----------------------------------------------------------------
  const handleStartRecording = async () => {
    setError('');
    setTranscript('');
    setDuration(0);
    setFillerCounts({});
    setWpm(0);
    setAnalysis(null);
    setIsRecording(true);

    if (textMode) {
      // Direct text rehearsal entry mode
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return;
    }

    try {
      // 1. Get Microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Start Canvas waveform
      startCanvasVisualization(stream);
      
      // 2. Initialize Web Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      
      rec.onresult = (event) => {
        let currentTrans = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTrans += event.results[i][0].transcript + ' ';
        }
        if (currentTrans) {
          setTranscript(currentTrans);
          analyzeLiveStats(currentTrans);
        }
      };
      
      rec.onerror = (e) => {
        console.error("Speech Recognition Error", e);
        if (e.error === 'not-allowed') {
          setError("Microphone access was denied. Switching to manual writing rehearsal.");
          setTextMode(true);
        }
      };

      rec.onend = () => {
        // Handle unexpected stop: restart if user didn't hit stop
        if (isRecording && streamRef.current) {
          try { rec.start(); } catch (err) {}
        }
      };

      rec.start();
      recognitionRef.current = rec;

      // Start timing
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Failed to gain microphone access. Try testing with Manual text mode instead.");
      setTextMode(true);
      
      // Timer setup for manual mode
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const analyzeLiveStats = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const count = words.length;
    
    // Live WPM
    if (duration > 0) {
      setWpm(Math.round(count / (duration / 60.0)));
    }
    
    // Live filler counts
    const fillers = {};
    FILLER_WORDS.forEach(f => {
      const reg = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = text.match(reg);
      if (matches) {
        fillers[f] = matches.length;
      }
    });
    setFillerCounts(fillers);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopAllMedia();
    
    if (textMode && !transcript.trim()) {
      setError("Please write some text to analyze your manual speech rehearsal.");
      return;
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!transcript.trim()) {
      setError("No speech recorded or typed. Cannot run analysis.");
      return;
    }

    setAnalyzing(true);
    setError('');
    
    try {
      // Send parameters to backend
      const res = await authFetch('/presentation/analyze', {
        method: 'POST',
        body: {
          title,
          transcript,
          duration: parseFloat(duration) || 10.0,
          confidence_score: 85.0 // Base pitch stability factor
        }
      });
      
      if (res.ok) {
        triggerCelebration();
        const data = await res.json();
        setAnalysis(data);
        fetchHistory(); // refresh sidebar list
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process speech analytics. Try submitting again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await authFetch(`/presentation/history/${id}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speech_report_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("PDF download error", err);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await authFetch('/presentation/export/excel');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speech_analytics_summary.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Excel download error", err);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Back to Dashboard</Link>

      <div style={styles.header}>
        <div>
          <h2 style={styles.mainTitle}>Speech Rehearsal Studio</h2>
          <p style={styles.mainSub}>Record vocal keynotes or draft transcripts. Analyze pacing, confidence markers, and fallacies.</p>
        </div>
        {history.length > 0 && (
          <button className="btn-secondary" onClick={handleDownloadExcel} style={{ fontSize: '0.85rem' }}>
            📊 Export History (Excel)
          </button>
        )}
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.workspace}>
        {/* Left Side: Recorder / Input Panel */}
        <div className="glass-panel" style={styles.recordPanel}>
          <div style={styles.panelHeader}>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={styles.titleInput}
              disabled={isRecording}
            />
            
            {!textMode && speechSupported && (
              <button 
                className="btn-secondary" 
                onClick={() => setTextMode(true)}
                style={styles.toggleModeBtn}
                disabled={isRecording}
              >
                ⌨️ Manual Writing
              </button>
            )}
            {textMode && speechSupported && (
              <button 
                className="btn-secondary" 
                onClick={() => setTextMode(false)}
                style={styles.toggleModeBtn}
                disabled={isRecording}
              >
                🎙️ Microphone Rehearsal
              </button>
            )}
          </div>

          {!textMode ? (
            <div style={styles.visualizerArea}>
              <canvas ref={canvasRef} width="600" height="150" style={styles.canvas}></canvas>
              {isRecording && <div style={styles.recordingIndicator}>🔴 RECORDING LIVE</div>}
            </div>
          ) : (
            <textarea 
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                analyzeLiveStats(e.target.value);
              }}
              placeholder="Paste or write your speech arguments here. Once finished, click 'Trigger Delivery Analysis'..."
              style={styles.textArea}
              disabled={isRecording && !textMode}
            />
          )}

          {/* Controls Bar */}
          <div style={styles.controlsRow}>
            <div style={styles.timerDisplay}>
              <span>⏱️ Duration: <b>{formatTime(duration)}</b></span>
              <span style={{ marginLeft: '20px' }}>🏃 Pace: <b>{wpm} WPM</b></span>
            </div>

            <div style={styles.controlButtons}>
              {!isRecording ? (
                <button className="btn-primary" onClick={handleStartRecording}>
                  🎙️ Start Rehearsal
                </button>
              ) : (
                <button className="btn-accent" onClick={handleStopRecording}>
                  🛑 Stop and Finalize
                </button>
              )}

              {!isRecording && transcript.trim().length > 0 && (
                <button className="btn-primary" onClick={handleTriggerAnalysis} disabled={analyzing}>
                  {analyzing ? 'Analyzing Speech...' : 'Analyze Argument Delivery'}
                </button>
              )}
            </div>
          </div>

          {/* Real-time word checks */}
          {transcript.trim().length > 0 && (
            <div style={styles.liveMetrics}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px' }}>Live Filler Word Counter</h4>
              <div style={styles.fillersRow}>
                {FILLER_WORDS.map(f => {
                  const count = fillerCounts[f] || 0;
                  return (
                    <span 
                      key={f} 
                      style={{
                        ...styles.fillerBadge,
                        borderColor: count > 3 ? '#f43f5e' : count > 0 ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                        backgroundColor: count > 3 ? 'rgba(244,63,94,0.1)' : count > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.01)',
                      }}
                    >
                      {f}: <b>{count}</b>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Analysis Results or History List */}
        <div style={styles.analysisCol}>
          {analysis ? (
            <div className="glass-panel animate-slide-in" style={styles.analysisReport}>
              <div style={styles.reportHeader}>
                <h3 style={styles.cardTitle}>Speech Delivery Feedback</h3>
                <button className="btn-secondary" onClick={() => handleDownloadPDF(analysis.id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  📄 Export Report PDF
                </button>
              </div>

              {/* Core Score Ring */}
              <div style={styles.overallRingCard}>
                <div style={styles.ringScore}>
                  <span style={styles.ringNum}>{analysis.overall_score}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Overall Score</span>
                </div>
                <div style={styles.scoresGrid}>
                  <div style={styles.subScoreItem}>
                    <span style={styles.subScoreLabel}>Confidence</span>
                    <span style={{ ...styles.subScoreVal, color: '#10b981' }}>{analysis.confidence_score} %</span>
                  </div>
                  <div style={styles.subScoreItem}>
                    <span style={styles.subScoreLabel}>Clarity</span>
                    <span style={{ ...styles.subScoreVal, color: 'var(--color-primary)' }}>{analysis.clarity_score} %</span>
                  </div>
                  <div style={styles.subScoreItem}>
                    <span style={styles.subScoreLabel}>Pacing Speed</span>
                    <span style={{ ...styles.subScoreVal, color: '#c084fc' }}>{analysis.pace} WPM</span>
                  </div>
                </div>
              </div>

              {/* Detected Fallacies */}
              <div style={styles.fallaciesSection}>
                <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '12px' }}>Reasoning & Fallacy Check</h4>
                {analysis.fallacies_json?.length === 0 ? (
                  <p style={{ color: '#10b981', fontSize: '0.85rem' }}>✓ Perfect! No logical reasoning fallacies detected in this rehearsal.</p>
                ) : (
                  <div style={styles.fallacyList}>
                    {analysis.fallacies_json.map((f, idx) => (
                      <div key={idx} style={styles.fallacyItem}>
                        <h5 style={styles.fallacyName}>⚠️ {f.fallacy}</h5>
                        <p style={styles.fallacyText}><b>Match:</b> "<i>{f.occurrences?.[0]?.match}</i>"</p>
                        <p style={styles.fallacyText}><b>Explanation:</b> {f.explanation}</p>
                        <p style={{ ...styles.fallacyText, color: 'var(--color-primary)' }}><b>Coaching Tip:</b> {f.correction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={styles.historyCard}>
              <h3 style={styles.cardTitle}>Recent Speech Reports</h3>
              <p style={styles.cardSub}>Select a past attempt to review your progress.</p>
              
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <p>No rehearsals logged yet.</p>
                  <p style={{ fontSize: '0.8rem' }}>Start recording your first presentation now!</p>
                </div>
              ) : (
                <div style={styles.historyList}>
                  {history.slice(0, 4).map((h) => (
                    <div key={h.id} style={styles.historyItem} onClick={() => setAnalysis(h)}>
                      <div style={styles.historyHeader}>
                        <span style={styles.historyTitle}>{h.title}</span>
                        <span style={styles.historyScore}>{h.overall_score}%</span>
                      </div>
                      <div style={styles.historyFooter}>
                        <span>{formatTime(Math.round(h.duration))}</span>
                        <span>{h.pace} WPM</span>
                        <button 
                          className="btn-secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(h.id);
                          }}
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  backLink: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: '25px',
    transition: 'var(--transition-smooth)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
  },
  mainTitle: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  mainSub: {
    color: '#94a3b8',
    fontSize: '1.05rem',
  },
  workspace: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '35px',
  },
  recordPanel: {
    padding: '35px',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    boxShadow: 'var(--glass-shadow)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'center',
  },
  titleInput: {
    border: 'none',
    background: 'none',
    fontSize: '1.55rem',
    fontWeight: '800',
    color: '#f8fafc',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    padding: '6px 0',
    borderRadius: '0',
    width: '65%',
    transition: 'var(--transition-smooth)',
  },
  titleInputFocus: {
    borderBottomColor: 'var(--color-primary)',
  },
  toggleModeBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  },
  visualizerArea: {
    height: '190px',
    backgroundColor: '#020617',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  recordingIndicator: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(244,63,94,0.12)',
    color: '#f43f5e',
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: '99px',
    fontWeight: '800',
    border: '1px solid rgba(244,63,94,0.25)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  textArea: {
    height: '260px',
    resize: 'none',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  timerDisplay: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  controlButtons: {
    display: 'flex',
    gap: '14px',
  },
  liveMetrics: {
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    padding: '20px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  fillersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  fillerBadge: {
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#f8fafc',
    fontWeight: '600',
  },
  analysisCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  analysisReport: {
    padding: '35px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    boxShadow: 'var(--glass-shadow)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardSub: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '25px',
  },
  overallRingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    padding: '24px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  ringScore: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    border: '4px solid var(--color-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.25), inset 0 0 10px rgba(6, 182, 212, 0.05)',
  },
  ringNum: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: '1',
  },
  scoresGrid: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subScoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  subScoreLabel: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  subScoreVal: {
    fontWeight: '700',
    color: '#f8fafc',
  },
  fallaciesSection: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '25px',
  },
  fallacyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fallacyItem: {
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'rgba(244,63,94,0.03)',
    border: '1px solid rgba(244,63,94,0.1)',
  },
  fallacyName: {
    color: '#f43f5e',
    fontSize: '0.95rem',
    fontWeight: '700',
    marginBottom: '6px',
  },
  fallacyText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.45',
    marginBottom: '4px',
  },
  historyCard: {
    padding: '35px',
    boxShadow: 'var(--glass-shadow)',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  historyItem: {
    padding: '20px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  historyItemHover: {
    borderColor: 'var(--color-primary)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(6, 182, 212, 0.08)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  historyTitle: {
    fontWeight: '700',
    color: '#f8fafc',
    fontSize: '0.95rem',
  },
  historyScore: {
    color: 'var(--color-primary)',
    fontWeight: '800',
    fontSize: '0.95rem',
  },
  historyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  errorAlert: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    color: '#f43f5e',
    padding: '20px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    marginBottom: '35px',
    fontSize: '0.95rem',
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-app)',
  },
  spinner: {
    width: '45px',
    height: '45px',
    border: '3px solid rgba(6, 182, 212, 0.1)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)',
  }
};

// Window sizing adjustments
if (typeof window !== 'undefined') {
  const matchMedia = window.matchMedia('(min-width: 960px)');
  const handleResize = () => {
    if (matchMedia.matches) {
      styles.workspace.gridTemplateColumns = '1.5fr 1fr';
    } else {
      styles.workspace.gridTemplateColumns = '1fr';
    }
  };
  handleResize();
  matchMedia.addEventListener('change', handleResize);
}
