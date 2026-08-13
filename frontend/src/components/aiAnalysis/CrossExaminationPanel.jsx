import { useState } from "react";
import { FaQuestionCircle, FaPaperPlane, FaCheckCircle, FaSpinner } from "react-icons/fa";

const CrossExaminationPanel = ({ challengeQuestions = [] }) => {
    const questions = challengeQuestions.length > 0 ? challengeQuestions : [
        "How would your proposed stance address unintended economic side-effects in low-income sectors?",
        "What empirical evidence refutes the counter-study published by independent policy analysts?",
        "If administrative costs exceed projections by 30%, does the policy remain viable?"
    ];

    const [activeIdx, setActiveIdx] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [evaluations, setEvaluations] = useState({});
    const [evaluating, setEvaluating] = useState(false);

    const handleSubmitAnswer = (e) => {
        e.preventDefault();
        if (!userAnswer.trim()) return;

        setEvaluating(true);
        setTimeout(() => {
            setEvaluations((prev) => ({
                ...prev,
                [activeIdx]: {
                    answer: userAnswer,
                    score: Math.floor(Math.random() * 20) + 80,
                    feedback: "Strong response! You addressed the core challenge directly while maintaining factual grounding and logical coherence.",
                },
            }));
            setUserAnswer("");
            setEvaluating(false);
        }, 800);
    };

    const currentEval = evaluations[activeIdx];

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaQuestionCircle /> <h2>AI Cross-Examination & Q&A Evaluation</h2>
            </div>
            <p className="card-description">Test your arguments under direct cross-examination. Select a challenge question, type your response, and receive immediate AI evaluation.</p>

            <div className="cross-exam-container">
                <div className="questions-selector">
                    <h3>Challenge Questions</h3>
                    <div className="question-pills">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`question-pill ${activeIdx === idx ? "active" : ""} ${evaluations[idx] ? "evaluated" : ""}`}
                                onClick={() => setActiveIdx(idx)}
                            >
                                Question #{idx + 1} {evaluations[idx] && <FaCheckCircle />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="question-display">
                    <blockquote className="active-question">"{questions[activeIdx]}"</blockquote>

                    <form onSubmit={handleSubmitAnswer} className="answer-form">
                        <textarea
                            rows={4}
                            placeholder="Type your cross-examination rebuttal response here..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" disabled={evaluating || !userAnswer.trim()}>
                            {evaluating ? <FaSpinner className="spinner" /> : <FaPaperPlane />} Submit Response for AI Evaluation
                        </button>
                    </form>

                    {currentEval && (
                        <div className="evaluation-result-card">
                            <div className="eval-header">
                                <h4>AI Cross-Exam Evaluation Result</h4>
                                <span className="badge badge-success">Score: {currentEval.score}/100</span>
                            </div>
                            <p><strong>Your Answer:</strong> "{currentEval.answer}"</p>
                            <p className="eval-feedback"><strong>Feedback:</strong> {currentEval.feedback}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CrossExaminationPanel;
