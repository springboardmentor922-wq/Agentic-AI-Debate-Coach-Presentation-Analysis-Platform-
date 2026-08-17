import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getArgumentReviews
} from "../services/argumentService";


function ArgumentReviews() {

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    useEffect(() => {

        loadReviews();

    }, []);


    async function loadReviews() {

        try {

            const data = await getArgumentReviews();

            console.log(
                "ARGUMENT REVIEWS:",
                data
            );

            setReviews(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Failed to load argument reviews:",
                error
            );

            setReviews([]);

        }

        finally {

            setLoading(false);

        }

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Argument Reviews
                </h1>

                <p className="coach-page-subtitle">
                    Review learner arguments and provide coaching insights.
                </p>


                {loading ? (

                    <div className="coach-empty-card">

                        Loading...

                    </div>

                ) : reviews.length === 0 ? (

                    <div className="coach-empty-card">

                        No argument reviews available.

                    </div>

                ) : (

                    <div className="coach-table-container">

                        <table className="coach-table">

                            <thead>

                                <tr>

                                    <th>
                                        Learner
                                    </th>

                                    <th>
                                        Claim
                                    </th>

                                    <th>
                                        Strengths
                                    </th>

                                    <th>
                                        Weaknesses
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {reviews.map(
                                    (review) => (

                                        <tr
                                            key={review.id}
                                        >

                                            <td>
                                                {review.learner_name}
                                            </td>

                                            <td>
                                                {review.claim}
                                            </td>

                                            <td>
                                                {review.strengths?.length || 0}
                                            </td>

                                            <td>
                                                {review.weaknesses?.length || 0}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="coach-view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/coach/argument-reviews/${review.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </CoachLayout>

    );

}


export default ArgumentReviews;