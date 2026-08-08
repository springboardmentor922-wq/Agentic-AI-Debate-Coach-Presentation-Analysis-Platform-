import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldAlert, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  RotateCcw, 
  Search, 
  Flame, 
  ArrowRight,
  HelpCircle,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentAvatar from '../components/AgentAvatar';
import { triggerCelebration } from '../components/ConfettiTrigger';


export default function FallacyLab() {
  const { authFetch } = useAuth();
  
  // Navigation tabs: 'quiz', 'analyzer'
  const [activeTab, setActiveTab] = useState('quiz');

  // Quiz state
  const [gameState, setGameState] = useState('intro'); // intro, quiz, results
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState('');

  // Live Analyzer State
  const [analyzerInput, setAnalyzerInput] = useState('');
  const [analyzerTopic, setAnalyzerTopic] = useState('Artificial Intelligence & Employment');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const recognitionRef = useRef(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authFetch('/coaching/fallacy-lab/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setCurrentIdx(0);
        setSelectedAnswer(null);
        setScore(0);
        setSubmitResult(null);
        setGameState('quiz');
      } else {
        setError('Failed to load training questions.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with fallacy detection service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
    const correct = questions[currentIdx].correct_fallacy;
    if (option === correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      triggerCelebration();
      setGameState('results');
    }
  };

  const handleSubmitScore = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await authFetch('/coaching/fallacy-lab/submit', {
        method: 'POST',
        body: { score: score }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmitResult(data);
      } else {
        setError('Could not update profile skills.');
      }
    } catch (err) {
      console.error(err);
      setError('Error updating telemetry scores.');
    } finally {
      setSubmitting(false);
    }
  };

  // Live Analyzer Handlers
  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!analyzerInput.trim()) return;

    setAnalyzing(true);
    setError('');
    try {
      const res = await authFetch('/debates/analyze-argument', {
        method: 'POST',
        body: {
          text: analyzerInput,
          topic: analyzerTopic
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        setError('Could not complete argument analysis.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to Argument Analysis Engine.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleMicTrans = () => {
    if (isMicActive) {
      setIsMicActive(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    setIsMicActive(true);
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
        setAnalyzerInput(prev => prev + finalSpeech);
      }
    };

    rec.onerror = () => setIsMicActive(false);
    rec.start();
    recognitionRef.current = rec;
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '15px', color: '#94a3b8' }}>Loading Fallacy Telemetry...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Return to Dashboard</Link>

      <div style={styles.header}>
        <h1 style={styles.mainTitle}>🧠 Logical Fallacy & Argument Lab</h1>
        <p style={styles.mainSub}>Train critical thinking, detect manipulation across 8 fallacies, and evaluate speech reasoning across 5 criteria.</p>
      </div>

      {/* TAB NAVIGATION */}
      <div style={styles.tabBar}>
        <button
          className={activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('quiz')}
          style={{ padding: '10px 20px', borderRadius: '10px 10px 0 0' }}
        >
          🎮 Fallacy Training Quiz
        </button>
        <button
          className={activeTab === 'analyzer' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('analyzer')}
          style={{ padding: '10px 20px', borderRadius: '10px 10px 0 0' }}
        >
          ⚡ Live Speech & Reasoning Analyzer (Module 4 & 5)
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: QUIZ GAME */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'quiz' && (
        <>
          {/* INTRO VIEW */}
          {gameState === 'intro' && (
            <div className="glass-panel animate-slide-in" style={styles.card}>
              <div style={styles.introIcon}>🎯</div>
              <h2 style={styles.cardTitle}>Train Your Critical Thinking</h2>
              <p style={styles.cardText}>
                Logical fallacies are flaws in reasoning that weaken arguments. In debates, recognizing these traps is just as important as stating solid data.
              </p>
              <p style={styles.cardText}>
                Identify which of the <strong>8 supported logical fallacies</strong> is committed in each sample argument:
              </p>
              <div style={styles.fallaciesGrid}>
                <div style={styles.fallacyBadge}>Ad Hominem</div>
                <div style={styles.fallacyBadge}>Straw Man</div>
                <div style={styles.fallacyBadge}>False Dilemma</div>
                <div style={styles.fallacyBadge}>Slippery Slope</div>
                <div style={styles.fallacyBadge}>Appeal to Authority</div>
                <div style={styles.fallacyBadge}>Circular Reasoning</div>
                <div style={styles.fallacyBadge}>Hasty Generalization</div>
                <div style={styles.fallacyBadge}>Red Herring</div>
              </div>
              <button className="btn-primary" onClick={fetchQuestions} style={styles.startBtn}>
                Begin Practice Session
              </button>
            </div>
          )}

          {/* QUIZ VIEW */}
          {gameState === 'quiz' && questions.length > 0 && (
            <div className="glass-panel animate-slide-in" style={styles.card}>
              <div style={styles.progressRow}>
                <span style={styles.progressText}>Question {currentIdx + 1} of {questions.length}</span>
                <span style={styles.scoreText}>Score: {score} Correct</span>
              </div>

              <div className="quiz-quote-box">
                <span style={styles.quoteIcon}>“</span>
                <p style={styles.quoteText}>{questions[currentIdx].quote}</p>
              </div>

              <h3 style={styles.label}>Select the Detected Fallacy:</h3>
              <div style={styles.optionsGrid}>
                {questions[currentIdx].options.map((option, idx) => {
                  const correct = questions[currentIdx].correct_fallacy;
                  const isSelected = selectedAnswer === option;
                  const showResult = selectedAnswer !== null;
                  
                  let btnStyle = { ...styles.optionBtn };
                  if (showResult) {
                    if (option === correct) {
                      btnStyle = { ...btnStyle, background: 'rgba(52, 211, 153, 0.2)', borderColor: '#34d399', color: '#34d399' };
                    } else if (isSelected) {
                      btnStyle = { ...btnStyle, background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#ef4444' };
                    }
                  }

                  return (
                    <button
                      key={idx}
                      style={btnStyle}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div style={styles.explanationBox}>
                  <h4>{selectedAnswer === questions[currentIdx].correct_fallacy ? '✅ Correct!' : '❌ Incorrect'}</h4>
                  <p>{questions[currentIdx].explanation}</p>
                  <button className="btn-primary" onClick={handleNext} style={{ marginTop: '10px' }}>
                    {currentIdx + 1 < questions.length ? 'Next Question →' : 'See Results'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RESULTS VIEW */}
          {gameState === 'results' && (
            <div className="glass-panel animate-slide-in" style={styles.card}>
              <h2 style={styles.cardTitle}>🏆 Training Complete!</h2>
              <p style={{ fontSize: '1.4rem', color: '#38bdf8', fontWeight: 'bold' }}>
                Your Score: {score} / {questions.length}
              </p>

              {!submitResult ? (
                <button className="btn-primary" onClick={handleSubmitScore} disabled={submitting} style={{ marginTop: '16px' }}>
                  {submitting ? 'Updating Profile...' : 'Sync Score to Skill Matrix'}
                </button>
              ) : (
                <div style={{ marginTop: '16px', color: '#34d399' }}>
                  ✓ Profile skills updated successfully!
                </div>
              )}

              <button className="btn-secondary" onClick={() => setGameState('intro')} style={{ marginTop: '12px' }}>
                Retry Training
              </button>
            </div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: LIVE REASONING & FALLACY ANALYZER */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'analyzer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* INPUT FORM */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={styles.cardTitle}>⚡ Hand-in-Hand Speech Evaluator</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Paste or record any speech argument to run Module 4 (Argument Analysis Engine) and Module 5 (Logical Fallacy Filter) in parallel.
            </p>

            <form onSubmit={handleRunAnalysis}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Debate Motion / Topic Context</label>
                <input
                  type="text"
                  value={analyzerTopic}
                  onChange={(e) => setAnalyzerTopic(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Employment"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>Speech / Argument Text</label>
                  <button
                    type="button"
                    onClick={toggleMicTrans}
                    className={isMicActive ? "btn-danger" : "btn-secondary"}
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    {isMicActive ? '🛑 Stop Recording' : '🎤 Speech Mic'}
                  </button>
                </div>
                <textarea
                  rows="8"
                  required
                  value={analyzerInput}
                  onChange={(e) => setAnalyzerInput(e.target.value)}
                  placeholder="e.g. My opponent is foolish and completely unqualified! Either we ban all AI immediately or we will face total economic destruction..."
                  style={styles.textarea}
                />
              </div>

              <button type="submit" disabled={analyzing || !analyzerInput.trim()} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                {analyzing ? 'Analyzing Reasoning Structure...' : '🔍 Evaluate Argument & Detect Fallacies'}
              </button>
            </form>
          </div>

          {/* RESULTS DISPLAY */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={styles.cardTitle}>📊 Analysis & Quality Control Report</h3>

            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* OVERALL SCORE BADGE */}
                <div style={styles.overallBadge}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Overall Reasoning Score</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>
                      {analysisResult.overall_reasoning_score}/100
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Credibility Score</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: analysisResult.fallacy_detection.credibility_score >= 75 ? '#34d399' : '#ef4444' }}>
                      {analysisResult.fallacy_detection.credibility_score}/100
                    </div>
                  </div>
                </div>

                {/* MODULE 5 FALLACY FILTER */}
                <div style={styles.sectionBox}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>🛡️ Module 5: Fallacy Filter ({analysisResult.fallacy_detection.fallacies_found.length})</h4>
                  {analysisResult.fallacy_detection.fallacies_found.length > 0 ? (
                    analysisResult.fallacy_detection.fallacies_found.map((f, idx) => (
                      <div key={idx} style={styles.fallacyItem}>
                        <div style={{ fontWeight: 'bold', color: '#ef4444' }}>⚠️ {f.fallacy}</div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Offending Section: "{f.offending_text}"</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{f.explanation}</div>
                        <div style={styles.fixPill}>💡 Fix: {f.correction_suggestion}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#34d399', fontSize: '0.85rem' }}>✅ No logical fallacies detected.</div>
                  )}
                </div>

                {/* MODULE 4 ARGUMENT ANALYSIS */}
                <div style={styles.sectionBox}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8' }}>📊 Module 4: 5-Criteria Assessment</h4>
                  <div style={styles.miniScores}>
                    <div>Clarity: <strong>{analysisResult.argument_analysis.scores.clarity}/100</strong></div>
                    <div>Relevance: <strong>{analysisResult.argument_analysis.scores.relevance}/100</strong></div>
                    <div>Evidence: <strong>{analysisResult.argument_analysis.scores.evidence_strength}/100</strong></div>
                    <div>Consistency: <strong>{analysisResult.argument_analysis.scores.logical_consistency}/100</strong></div>
                    <div>Persuasiveness: <strong>{analysisResult.argument_analysis.scores.persuasiveness}/100</strong></div>
                  </div>

                  <h5 style={{ margin: '12px 0 4px 0', color: '#cbd5e1' }}>Extracted Claims</h5>
                  {analysisResult.argument_analysis.extracted_claims.map((c, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• [{c.type}] {c.claim}</div>
                  ))}

                  <h5 style={{ margin: '10px 0 4px 0', color: '#cbd5e1' }}>Reasoning Quality</h5>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{analysisResult.argument_analysis.reasoning_quality}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Enter speech text on the left and click Evaluate to trigger the hand-in-hand analysis pipeline.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
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
  header: {
    marginBottom: '20px'
  },
  mainTitle: {
    fontSize: '2rem',
    margin: '0 0 6px 0'
  },
  mainSub: {
    color: '#94a3b8',
    margin: 0
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #334155',
    marginBottom: '20px'
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#38bdf8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  card: {
    padding: '32px',
    borderRadius: '16px',
    maxWidth: '700px',
    margin: '0 auto'
  },
  introIcon: {
    fontSize: '3rem',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '1.3rem',
    margin: '0 0 12px 0'
  },
  cardText: {
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  fallaciesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
    marginBottom: '24px'
  },
  fallacyBadge: {
    background: '#1e293b',
    border: '1px solid #334155',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    textAlign: 'center',
    color: '#38bdf8'
  },
  startBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem'
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    color: '#94a3b8',
    fontSize: '0.9rem'
  },
  quoteIcon: {
    fontSize: '2rem',
    color: '#38bdf8',
    lineHeight: '1'
  },
  quoteText: {
    fontSize: '1.1rem',
    color: '#f8fafc',
    margin: '8px 0 0 0',
    lineHeight: '1.5'
  },
  label: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    margin: '20px 0 10px 0'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  optionBtn: {
    padding: '12px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem'
  },
  explanationBox: {
    marginTop: '20px',
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '0.9rem'
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '0.9rem',
    resize: 'vertical'
  },
  overallBadge: {
    display: 'flex',
    justifyContent: 'space-around',
    background: '#0f172a',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #334155',
    textAlign: 'center'
  },
  sectionBox: {
    background: '#0f172a',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #334155'
  },
  fallacyItem: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '8px'
  },
  fixPill: {
    marginTop: '6px',
    padding: '4px 8px',
    background: 'rgba(56, 189, 248, 0.1)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#38bdf8'
  },
  miniScores: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#cbd5e1'
  }
};
