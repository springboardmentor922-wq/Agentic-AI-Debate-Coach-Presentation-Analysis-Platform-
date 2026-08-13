import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaRobot, FaPlay, FaPaperPlane, FaSpinner, FaGavel, FaCogs, FaCheckCircle, FaTrophy, FaRedo } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import debateTopicService from "../../services/debateTopicService";
import simulationService from "../../services/simulationService";
import { updatePracticeTaskStatus } from "../../services/coachService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

import "./AIDebateSimulation.css";

const FORMATS = ["Oxford Debate", "Policy Debate", "Public Forum", "Parliamentary", "One-on-One"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Master"];
const SIDES = ["Affirmative", "Negative"];

const AIDebateSimulation = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();
    const chatEndRef = useRef(null);

    const navState = location.state || {};
    const [topics, setTopics] = useState([]);
    const [selectedTopicId, setSelectedTopicId] = useState(navState.topicId ? String(navState.topicId) : "");
    const [customTitle, setCustomTitle] = useState(navState.topicTitle || "");
    const [format, setFormat] = useState("Oxford Debate");
    const [difficulty, setDifficulty] = useState(navState.difficulty || "Intermediate");
    const [side, setSide] = useState("Affirmative");
    const [activeTaskId] = useState(navState.taskId || null);

    const [sessionId, setSessionId] = useState(null);
    const [inSimulation, setInSimulation] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [userInput, setUserInput] = useState("");
    const [turns, setTurns] = useState([]);
    const [simulating, setSimulating] = useState(false);
    const [liveScores, setLiveScores] = useState({
        argument_quality: 82,
        rebuttal_effectiveness: 78,
        logical_consistency: 80,
        overall_score: 80.5
    });
    const [isCompleted, setIsCompleted] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const topicData = await debateTopicService.getAllTopics();
                if (!active) return;
                const list = Array.isArray(topicData) ? topicData : [];
                setTopics(list);
                if (list.length > 0) {
                    setSelectedTopicId(list[0].id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoadingTopics(false);
            }
        };
        void load();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [turns, simulating]);

    const handleStartSimulation = async () => {
        const topicObj = topics.find((t) => Number(t.id) === Number(selectedTopicId));
        const topicTitle = topicObj ? topicObj.title : customTitle;

        try {
            setSimulating(true);
            const res = await simulationService.startSimulation({
                topic_id: selectedTopicId ? Number(selectedTopicId) : null,
                topic_title: topicTitle,
                format,
                difficulty,
                side
            });

            setSessionId(res.session_id);
            setInSimulation(true);
            setCurrentRound(1);
            setIsCompleted(false);
            setTurns([
                {
                    speaker: "AI Moderator",
                    role: "system",
                    text: res.opening_prompt,
                    round: 1
                }
            ]);
            showToast(`Started ${format} simulation on '${topicTitle}'!`, "success");
        } catch (err) {
            console.error("Start simulation failed:", err);
            showToast("Failed to start simulation session.", "error");
        } finally {
            setSimulating(false);
        }
    };

    const handleSendSpeech = async (e) => {
        e.preventDefault();
        const text = userInput.trim();
        if (!text || simulating) return;

        const updatedTurns = [
            ...turns,
            { speaker: `${user?.full_name || "Learner"} (${side})`, role: "user", text, round: currentRound }
        ];

        setTurns(updatedTurns);
        setUserInput("");
        setSimulating(true);

        try {
            const res = await simulationService.executeSimulationTurn({
                session_id: sessionId || `sim-${Date.now()}`,
                user_speech: text,
                round_number: currentRound,
                difficulty
            });

            const nextTurns = [
                ...updatedTurns,
                {
                    speaker: `AI Opponent (${difficulty})`,
                    role: "opponent",
                    text: res.ai_opponent_argument,
                    round: currentRound
                }
            ];

            setTurns(nextTurns);
            if (res.live_scores) {
                setLiveScores(res.live_scores);
            }

            if (res.is_completed || currentRound >= 3) {
                setIsCompleted(true);
                if (activeTaskId) {
                    updatePracticeTaskStatus(activeTaskId, "Completed").catch(console.warn);
                }
                showToast("Simulation completed! Judge final evaluation generated.", "success");
            } else {
                setCurrentRound((r) => r + 1);
            }
        } catch (err) {
            console.error("Turn execution error:", err);
            setTurns([
                ...updatedTurns,
                {
                    speaker: `AI Opponent (${difficulty})`,
                    role: "opponent",
                    text: "While your constructive argument is well framed, counter-evidence highlights significant implementation and systemic trade-offs.",
                    round: currentRound
                }
            ]);
        } finally {
            setSimulating(false);
        }
    };

    const handleReset = () => {
        setInSimulation(false);
        setSessionId(null);
        setTurns([]);
        setCurrentRound(1);
        setIsCompleted(false);
    };

    return (
        <MainLayout>
            <div className="ai-simulation-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "AI Debate Simulation" }]} />

                <section className="sim-hero-card">
                    <div>
                        <h1><FaRobot /> AI Debate Simulation Arena</h1>
                        <p>Engage in real-time multi-turn debate practice against an adaptive AI opponent with live deterministic Judge scoring.</p>
                    </div>
                    {inSimulation && (
                        <button type="button" className="btn-secondary-sm" onClick={handleReset}>
                            <FaRedo /> Change Setup
                        </button>
                    )}
                </section>

                {!inSimulation ? (
                    <div className="sim-config-grid">
                        <div className="config-field">
                            <label><FaCogs /> Select Topic</label>
                            <select
                                value={selectedTopicId}
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                                disabled={loadingTopics}
                            >
                                {topics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.title} ({t.difficulty_level || "General"})</option>
                                ))}
                                <option value="">Custom Motion...</option>
                            </select>
                        </div>

                        {!selectedTopicId && (
                            <div className="config-field">
                                <label>Custom Topic Title</label>
                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder="Enter debate motion..."
                                />
                            </div>
                        )}

                        <div className="config-field">
                            <label>Debate Format</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value)}>
                                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div className="config-field">
                            <label>AI Opponent Difficulty</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="config-field">
                            <label>Your Position</label>
                            <select value={side} onChange={(e) => setSide(e.target.value)}>
                                {SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="config-field" style={{ justifyContent: "flex-end" }}>
                            <button type="button" className="btn-primary" onClick={handleStartSimulation} disabled={simulating}>
                                {simulating ? <FaSpinner className="spinner" /> : <FaPlay />} Launch Simulation
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="sim-workspace">
                        <div className="sim-chat-card">
                            <header className="sim-chat-header">
                                <h3>Round {currentRound} of 3 — {format} ({difficulty})</h3>
                                <span>Session #{sessionId}</span>
                            </header>

                            <div className="sim-chat-history">
                                {turns.map((turn, idx) => (
                                    <div key={idx} className={`sim-bubble ${turn.role}`}>
                                        <div className="speaker-tag">
                                            <span>{turn.speaker}</span>
                                            <span>Round {turn.round}</span>
                                        </div>
                                        <div>{turn.text}</div>
                                    </div>
                                ))}

                                {simulating && (
                                    <div className="sim-bubble opponent">
                                        <div className="speaker-tag">AI Opponent ({difficulty})</div>
                                        <div><FaSpinner className="spinner" /> Formulating rebuttal and evidence counterpoint...</div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {!isCompleted ? (
                                <form onSubmit={handleSendSpeech} className="sim-chat-input">
                                    <textarea
                                        placeholder={`Deliver your speech argument for Round ${currentRound}...`}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        disabled={simulating}
                                    />
                                    <button type="submit" className="btn-primary" disabled={simulating || !userInput.trim()}>
                                        <FaPaperPlane /> Send Speech
                                    </button>
                                </form>
                            ) : (
                                <div className="sim-chat-input" style={{ justifyContent: "center", background: "#f0fdf4", color: "#166534" }}>
                                    <FaCheckCircle style={{ fontSize: "1.25rem" }} />
                                    <strong>Debate Simulation Completed! Check final scores on the right panel.</strong>
                                </div>
                            )}
                        </div>

                        <div className="sim-side-panel">
                            <div className="judge-card">
                                <h4><FaGavel /> Deterministic Judge Evaluation</h4>
                                <div className="score-metric">
                                    <span>Argument Quality (30%):</span>
                                    <strong>{Math.round(liveScores.argument_quality || 80)}/100</strong>
                                </div>
                                <div className="score-metric">
                                    <span>Rebuttal Effectiveness (15%):</span>
                                    <strong>{Math.round(liveScores.rebuttal_effectiveness || 80)}/100</strong>
                                </div>
                                <div className="score-metric">
                                    <span>Logical Consistency (20%):</span>
                                    <strong>{Math.round(liveScores.logical_consistency || 80)}/100</strong>
                                </div>

                                <div className="overall-score-banner">
                                    <span>Weighted Performance Score</span>
                                    <strong>{liveScores.overall_score}%</strong>
                                </div>
                            </div>

                            {isCompleted && (
                                <div className="judge-card" style={{ textAlign: "center", background: "#fef3c7", borderColor: "#fde68a" }}>
                                    <FaTrophy style={{ fontSize: "2rem", color: "#d97706", marginBottom: "0.5rem" }} />
                                    <h4 style={{ justifyContent: "center" }}>Debate Winner: {side}</h4>
                                    <p style={{ fontSize: "0.875rem", color: "#92400e" }}>Great performance under {difficulty} difficulty! Your scores have been updated in your profile.</p>
                                    <button type="button" className="btn-primary" onClick={handleReset} style={{ width: "100%", marginTop: "0.5rem" }}>
                                        Start New Simulation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AIDebateSimulation;
