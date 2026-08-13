import { FaCheckCircle, FaSpinner, FaBrain, FaExclamationTriangle, FaShieldAlt, FaUserNinja, FaGavel, FaGraduationCap, FaLightbulb, FaRoute } from "react-icons/fa";
import "./MultiAgentPipeline.css";

const AGENTS = [
    { id: "argument_analysis", name: "Argument Analysis Agent", icon: <FaBrain />, role: "Claims & Evidence Analysis" },
    { id: "logical_fallacy_detection", name: "Fallacy Detection Agent", icon: <FaExclamationTriangle />, role: "Logic Flaw Identification" },
    { id: "counterargument_generation", name: "Counterargument Agent", icon: <FaShieldAlt />, role: "Multi-Perspective Rebuttals" },
    { id: "ai_debate_opponent", name: "AI Debate Opponent Agent", icon: <FaUserNinja />, role: "Turn Strategy & Challenges" },
    { id: "performance_scoring", name: "Judge Scoring Agent", icon: <FaGavel />, role: "Deterministic 5-Criteria Evaluation" },
    { id: "coaching", name: "Coaching Agent", icon: <FaGraduationCap />, role: "Personalized Skill Feedback" },
    { id: "recommendations", name: "Recommendation Agent", icon: <FaLightbulb />, role: "Practice Plans & Exercises" },
    { id: "learning_path", name: "Learning Path Agent", icon: <FaRoute />, role: "Skill Roadmap Tracking" },
];

const MultiAgentPipeline = ({ currentStage, completedStages = [], isStreaming = false }) => {
    const isStageCompleted = (agentId) => {
        if (!isStreaming) return true;
        return completedStages.includes(agentId);
    };

    const isStageActive = (agentId) => {
        if (!isStreaming) return false;
        return currentStage === agentId;
    };

    return (
        <section className="multi-agent-pipeline">
            <div className="pipeline-header">
                <h2>LangGraph Multi-Agent Execution Pipeline</h2>
                <span className="pipeline-status">
                    {isStreaming ? (
                        <>
                            <FaSpinner className="spinner" /> Orchestrating Graph Agents...
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className="text-success" /> All 8 AI Agents Executed Successfully
                        </>
                    )}
                </span>
            </div>

            <div className="agents-grid">
                {AGENTS.map((agent) => {
                    const completed = isStageCompleted(agent.id);
                    const active = isStageActive(agent.id);

                    return (
                        <div
                            key={agent.id}
                            className={`agent-card ${completed ? "completed" : ""} ${active ? "active" : ""}`}
                        >
                            <div className="agent-icon-wrapper">
                                {agent.icon}
                                {completed && <FaCheckCircle className="badge-check" />}
                                {active && <FaSpinner className="badge-spinner spinner" />}
                            </div>
                            <div className="agent-info">
                                <h3>{agent.name}</h3>
                                <p>{agent.role}</p>
                            </div>
                            <span className="agent-status-tag">
                                {active ? "Running" : completed ? "Complete" : "Queued"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default MultiAgentPipeline;
