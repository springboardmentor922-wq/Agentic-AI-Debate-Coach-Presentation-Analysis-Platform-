import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getPresentationReviews
} from "../services/presentationService";


function PresentationReviews() {

    const [reviews, setReviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const navigate = useNavigate();


    useEffect(() => {

        loadReviews();

    }, []);


    async function loadReviews() {

        try {

            const data =
                await getPresentationReviews();

            setReviews(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(error);

            setReviews([]);

        } finally {

            setLoading(false);

        }

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Presentation Reviews
                </h1>

                <p className="coach-page-subtitle">
                    Review learner presentation performance.
                </p>


                {loading ? (

                    <div className="coach-empty-card">
                        Loading...
                    </div>

                ) : reviews.length === 0 ? (

                    <div className="coach-empty-card">
                        No presentation reviews available.
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
                                        Clarity
                                    </th>

                                    <th>
                                        Confidence
                                    </th>

                                    <th>
                                        Communication
                                    </th>

                                    <th>
                                        Overall
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
                                                {
                                                    review.learner_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    review.clarity
                                                }/10
                                            </td>

                                            <td>
                                                {
                                                    review.confidence
                                                }/10
                                            </td>

                                            <td>
                                                {
                                                    review.communication
                                                }/10
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        review.overall
                                                    }/10
                                                </strong>
                                            </td>

                                            <td>

                                                <button
                                                    className="coach-view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/coach/presentation-reviews/${review.id}`
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


export default PresentationReviews;