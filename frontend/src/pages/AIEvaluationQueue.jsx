import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import api from "../services/api";

function AIEvaluationQueue() {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        loadReviews();
    }, []);

    async function loadReviews() {

        try {

            const response = await api.get("/coach-review/pending");

            console.log("AI EVALUATION QUEUE:", response.data);

            setReviews(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load AI evaluation queue:",
                error
            );

            setReviews([]);

        } finally {

            setLoading(false);

        }
    }

    function handleReview(sessionId) {

        navigate(`/coach-review/${sessionId}`);

    }

    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>AI Evaluation Queue</h1>

                <p className="coach-page-subtitle">
                    Review learner debates that are waiting for coach evaluation.
                </p>

                {loading ? (

                    <div className="coach-empty-card">
                        Loading...
                    </div>

                ) : reviews.length === 0 ? (

                    <div className="coach-empty-card">
                        No learner debates are waiting for review.
                    </div>

                ) : (

                    <div className="coach-table-container">

                        <table className="coach-table">

                            <thead>

                                <tr>

                                    <th>Learner</th>

                                    <th>Topic</th>

                                    <th>Category</th>

                                    <th>Difficulty</th>

                                    <th>AI Score</th>

                                    <th>Status</th>

                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {reviews.map((review) => (

                                    <tr key={review.id}>

                                        <td>
                                            {review.learner_name ||
                                                review.created_by ||
                                                `Learner ${review.learner_id}`}
                                        </td>

                                        <td>
                                            {review.topic}
                                        </td>

                                        <td>
                                            {review.category || "General"}
                                        </td>

                                        <td>
                                            {review.difficulty || "Easy"}
                                        </td>

                                        <td>
                                            {review.ai_score !== undefined &&
                                            review.ai_score !== null
                                                ? `${Math.round(review.ai_score)}/100`
                                                : "Not Evaluated"}
                                        </td>

                                        <td>
                                            {review.status}
                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                className="coach-view-btn"
                                                onClick={() =>
                                                    handleReview(review.id)
                                                }
                                            >
                                                Review
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </CoachLayout>

    );
}

export default AIEvaluationQueue;