import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import {
    getEvaluationDetails,
    submitCoachReview
} from "../services/aiEvaluationService";

function AIEvaluationReview() {

    const { sessionId } = useParams();

    const navigate = useNavigate();

    const [session, setSession] = useState(null);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [review, setReview] = useState({
        grammar: 0,
        logic: 0,
        confidence: 0,
        communication: 0,
        overall: 0,
        strengths: "",
        improvements: "",
        feedback: ""
    });

    useEffect(() => {

        loadSession();

    }, [sessionId]);

    async function loadSession() {

        try {

            const data = await getEvaluationDetails(sessionId);

            console.log("Evaluation Details:", data);

            setSession(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    function handleChange(event) {

        const { name, value } = event.target;

        setReview({
            ...review,
            [name]: value
        });

    }

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            setSubmitting(true);

            await submitCoachReview(
                sessionId,
                {
                    grammar: Number(review.grammar),
                    logic: Number(review.logic),
                    confidence: Number(review.confidence),
                    communication: Number(review.communication),
                    overall: Number(review.overall),
                    strengths: review.strengths,
                    improvements: review.improvements,
                    feedback: review.feedback
                }
            );

            alert("Coach review submitted successfully.");

            navigate("/coach/ai-queue");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to submit review."
            );

        } finally {

            setSubmitting(false);

        }

    }

    if (loading) {

        return (
            <CoachLayout>
                <h2>Loading evaluation...</h2>
            </CoachLayout>
        );

    }

    if (!session) {

        return (
            <CoachLayout>

                <div className="coach-page">

                    <h2>Evaluation Not Found</h2>

                    <p>
                        The selected debate session could not be found.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/coach/ai-queue")}
                    >
                        Back to Evaluation Queue
                    </button>

                </div>

            </CoachLayout>
        );

    }

    return (

        <CoachLayout>

            <div className="coach-page">

                <h2>AI Evaluation Review</h2>

                <p>
                    Review the learner's debate and provide your coaching feedback.
                </p>

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "25px",
                        marginTop: "25px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h3>Debate Information</h3>

                    <p>
                        <strong>Learner:</strong>{" "}
                        {session.learner_name || session.learner?.name}
                    </p>

                    <p>
                        <strong>Topic:</strong>{" "}
                        {session.topic}
                    </p>

                    <p>
                        <strong>Category:</strong>{" "}
                        {session.category || "General"}
                    </p>

                    <p>
                        <strong>Difficulty:</strong>{" "}
                        {session.difficulty || "Not specified"}
                    </p>

                    <p>
                        <strong>AI Score:</strong>{" "}
                        {session.ai_score ?? session.overall_score ?? 0}/100
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "25px",
                        marginTop: "25px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h3>Coach Evaluation</h3>

                    <div className="coach-form-grid">

                        <div>

                            <label>Grammar</label>

                            <input
                                type="number"
                                name="grammar"
                                min="0"
                                max="10"
                                value={review.grammar}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div>

                            <label>Logic</label>

                            <input
                                type="number"
                                name="logic"
                                min="0"
                                max="10"
                                value={review.logic}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div>

                            <label>Confidence</label>

                            <input
                                type="number"
                                name="confidence"
                                min="0"
                                max="10"
                                value={review.confidence}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div>

                            <label>Communication</label>

                            <input
                                type="number"
                                name="communication"
                                min="0"
                                max="10"
                                value={review.communication}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div>

                            <label>Overall Score</label>

                            <input
                                type="number"
                                name="overall"
                                min="0"
                                max="10"
                                value={review.overall}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    <div style={{ marginTop: "20px" }}>

                        <label>Strengths</label>

                        <textarea
                            name="strengths"
                            value={review.strengths}
                            onChange={handleChange}
                            placeholder="Enter learner strengths..."
                            rows="4"
                            required
                        />

                    </div>


                    <div style={{ marginTop: "20px" }}>

                        <label>Areas for Improvement</label>

                        <textarea
                            name="improvements"
                            value={review.improvements}
                            onChange={handleChange}
                            placeholder="Enter areas for improvement..."
                            rows="4"
                            required
                        />

                    </div>


                    <div style={{ marginTop: "20px" }}>

                        <label>Coach Feedback</label>

                        <textarea
                            name="feedback"
                            value={review.feedback}
                            onChange={handleChange}
                            placeholder="Write detailed feedback..."
                            rows="6"
                            required
                        />

                    </div>


                    <div style={{ marginTop: "25px" }}>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >

                            {submitting
                                ? "Submitting..."
                                : "Submit Coach Review"}

                        </button>


                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ marginLeft: "10px" }}
                            onClick={() =>
                                navigate("/coach/ai-queue")
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </CoachLayout>

    );

}

export default AIEvaluationReview;