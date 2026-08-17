import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../components/Layout";
import { getCoachFeedbacks } from "../services/coachFeedbackService";

function CoachFeedback() {

    const [reviews, setReviews] = useState([]);

    useEffect(() => {

        loadReviews();

    }, []);

    async function loadReviews() {

    try {

        const data = await getCoachFeedbacks();

setReviews(data);

    } catch (err) {

        console.log(err);

    }

}
    console.log(reviews);
    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>👨‍🏫 Coach Feedback</h2>

                    <br />

                    {reviews.length === 0 ? (

                        <p>No coach reviews available.</p>

                    ) : (

                        reviews.map((review) => (

                            <div
                                key={review.review_id || review.session_id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    marginBottom: "20px",
                                    background: "#fff"
                                }}
                            >

                                <h3>{review.topic}</h3>

                                <p>

                                    <b>Coach :</b> {review.coach_name}

                                </p>

                                <p>

                                    <b>Overall :</b> {review.overall}/10

                                </p>

                                <p>

                                    <b>Status :</b> {review.status}

                                </p>

                                <p>

                                    <b>Reviewed :</b>{" "}

                                    {new Date(
                                        review.reviewed_at
                                    ).toLocaleString()}

                                </p>

                                <Link

                                    className="btn btn-primary"

                                    to={`/coach-feedback/${review.review_id}`}

                                >

                                    View Feedback

                                </Link>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </Layout>

    );

}

export default CoachFeedback;