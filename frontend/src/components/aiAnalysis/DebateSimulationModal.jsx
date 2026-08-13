import { useState } from "react";
import { FaUserNinja, FaPaperPlane, FaTimes, FaGavel, FaSpinner, FaCogs } from "react-icons/fa";
import "./DebateSimulationModal.css";

const FORMATS = ["Oxford Debate", "Policy Debate", "Public Forum", "Parliamentary", "One-on-One"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Master"];

const DebateSimulationModal = ({ isOpen, onClose, opponentData, topicTitle = "Debate Session Simulation" }) => {
    if (!isOpen) return null;

    const initialOpponentTurn = opponentData?.opponent_response || "I challenge your core assertion. The empirical data shows significant implementation risks that outweigh the stated benefits.";

    const [turns, setTurns] = useState([
        { role: "opponent", text: initialOpponentTurn, round: 1 },
    ]);
    const [userInput, setUserInput] = useState("");
    const [currentRound, setCurrentRound] = useState(1);
    const [simulating, setSimulating] = useState(false);
    const [format, setFormat] = useState("Oxford Debate");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [judgeScores, setJudgeScores] = useState([
        { round: 1, argumentQuality: 86, rebuttalEffectiveness: 84, overall: 85 }
    ]);

    const handleSendTurn = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const currentSpeech = userInput.trim();
        const updatedTurns = [...turns, { role: "user", text: currentSpeech, round: currentRound }];
        setTurns(updatedTurns);
        setUserInput("");
        setSimulating(true);

        try {
            const { executeSimulationTurn } = await import("../../services/simulationService");
            const response = await executeSimulationTurn({
                session_id: `sim-${Date.now()}`,
                user_speech: currentSpeech,
                round_number: currentRound,
                difficulty: difficulty
            });

            const nextRoundNum = currentRound + 1;
            const newOpponentTurn = response.ai_opponent_argument || `In Round ${nextRoundNum} (${format} - ${difficulty} Mode), while your points are noted, structural constraints remain. How do you address the policy evidence?`;

            setTurns([...updatedTurns, { role: "opponent", text: newOpponentTurn, round: nextRoundNum }]);
            setCurrentRound(nextRoundNum);

            const scores = response.live_scores || {};
            setJudgeScores((prev) => [
                ...prev,
                {
                    round: currentRound,
                    argumentQuality: Math.round(scores.argument_quality || 84),
                    rebuttalEffectiveness: Math.round(scores.rebuttal_effectiveness || 80),
                    overall: Math.round(scores.overall_score || 82),
                }
            ]);
        } catch (error) {
            console.error("Simulation turn error:", error);
            const nextRoundNum = currentRound + 1;
            setTurns([
                ...updatedTurns,
                {
                    role: "opponent",
                    text: `While your argument is compelling, counter-arguments highlight potential resource allocation issues under ${difficulty} conditions.`,
                    round: nextRoundNum
                }
            ]);
            setCurrentRound(nextRoundNum);
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="simulation-modal">
                <div className="modal-header">
                    <div>
                        <h2><FaUserNinja /> AI Debate Simulation Room</h2>
                        <span>{topicTitle} — Round {currentRound}</span>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Step 8 Format & Difficulty Controls */}
                <div className="simulation-controls-bar">
                    <div className="control-group">
                        <label><FaCogs /> Debate Format:</label>
                        <select value={format} onChange={(e) => setFormat(e.target.value)}>
                            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>AI Difficulty:</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="simulation-body">
                    <div className="chat-container">
                        {turns.map((turn, idx) => (
                            <div key={idx} className={`turn-bubble ${turn.role}`}>
                                <div className="turn-label">
                                    {turn.role === "user" ? "You (Learner)" : `AI Opponent (${difficulty})`} — Round {turn.round}
                                </div>
                                <div className="turn-content">{turn.text}</div>
                            </div>
                        ))}
                        {simulating && (
                            <div className="turn-bubble opponent simulating">
                                <FaSpinner className="spinner" /> AI Opponent ({difficulty}) is formulating counter-response...
                            </div>
                        )}
                    </div>

                    <div className="sidebar-eval">
                        <h3><FaGavel /> Round-by-Round Judge Evaluation</h3>
                        {judgeScores.map((score) => (
                            <div key={score.round} className="judge-score-card">
                                <h4>Round #{score.round} Score</h4>
                                <div className="score-row"><span>Argument Quality:</span> <strong>{score.argumentQuality}/100</strong></div>
                                <div className="score-row"><span>Rebuttal Power:</span> <strong>{score.rebuttalEffectiveness}/100</strong></div>
                                <div className="score-row overall"><span>Overall Score:</span> <strong>{score.overall}/100</strong></div>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSendTurn} className="simulation-footer">
                    <input
                        type="text"
                        placeholder="Enter your speech response for the next round..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={simulating}
                    />
                    <button type="submit" className="btn-primary" disabled={simulating || !userInput.trim()}>
                        <FaPaperPlane /> Send Speech
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DebateSimulationModal;
