import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import { submitCoachReview } from "../services/coachReviewService";

function CoachReview() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        grammar: 0,
        logic: 0,
        confidence: 0,
        communication: 0,
        overall: 0,
        strengths: "",
        improvements: "",
        feedback: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]:
                ["grammar", "logic", "confidence", "communication", "overall"]
                    .includes(name)
                    ? Number(value)
                    : value
        });
    };

    const submitReview = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setMessage("");

            await submitCoachReview(id, form);

            setMessage("Review submitted successfully.");

            setTimeout(() => {
                navigate("/coach/ai-queue");
            }, 1000);

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.detail ||
                "Failed to submit review."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>Coach Evaluation</h1>

                <div
                    style={{
                        background: "#ffffff",
                        padding: "30px",
                        borderRadius: "16px",
                        marginTop: "25px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        maxWidth: "900px"
                    }}
                >

                    <form onSubmit={submitReview}>

                        <div className="evaluation-grid">

                            <div className="evaluation-field">
                                <label>Grammar</label>
                                <input
                                    type="number"
                                    name="grammar"
                                    min="0"
                                    max="10"
                                    value={form.grammar}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="evaluation-field">
                                <label>Logic</label>
                                <input
                                    type="number"
                                    name="logic"
                                    min="0"
                                    max="10"
                                    value={form.logic}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="evaluation-field">
                                <label>Confidence</label>
                                <input
                                    type="number"
                                    name="confidence"
                                    min="0"
                                    max="10"
                                    value={form.confidence}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="evaluation-field">
                                <label>Communication</label>
                                <input
                                    type="number"
                                    name="communication"
                                    min="0"
                                    max="10"
                                    value={form.communication}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="evaluation-field">
                                <label>Overall Score</label>
                                <input
                                    type="number"
                                    name="overall"
                                    min="0"
                                    max="10"
                                    value={form.overall}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <div className="evaluation-textarea">
                            <label>Strengths</label>

                            <textarea
                                name="strengths"
                                placeholder="Enter learner strengths..."
                                value={form.strengths}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="evaluation-textarea">
                            <label>Areas for Improvement</label>

                            <textarea
                                name="improvements"
                                placeholder="Enter areas for improvement..."
                                value={form.improvements}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="evaluation-textarea">
                            <label>Detailed Feedback</label>

                            <textarea
                                name="feedback"
                                placeholder="Write detailed feedback..."
                                value={form.feedback}
                                onChange={handleChange}
                            />
                        </div>

                        {message && (
                            <p
                                style={{
                                    marginTop: "15px",
                                    fontWeight: "600"
                                }}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="coach-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting..."
                                : "Submit Evaluation"}
                        </button>

                    </form>

                </div>

            </div>

        </CoachLayout>
    );
}

export default CoachReview;