import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getArgumentReview
} from "../services/argumentService";


function ArgumentReviewDetails() {

    const { id } = useParams();

    const [review, setReview] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadReview();

    }, [id]);


    async function loadReview() {

        try {

            const data =
                await getArgumentReview(id);

            setReview(data);

        }

        catch (error) {

            console.error(
                "Failed to load argument review:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <CoachLayout>

                <div className="coach-page">

                    <h1>
                        Argument Review
                    </h1>

                    <div className="coach-empty-card">
                        Loading...
                    </div>

                </div>

            </CoachLayout>

        );

    }


    if (!review) {

        return (

            <CoachLayout>

                <div className="coach-page">

                    <h1>
                        Argument Review
                    </h1>

                    <div className="coach-empty-card">
                        Review not found.
                    </div>

                </div>

            </CoachLayout>

        );

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Argument Review
                </h1>


                <div className="coach-empty-card">

                    <h2>
                        Learner
                    </h2>

                    <p>
                        {review.learner_name}
                    </p>


                    <h2>
                        Original Argument
                    </h2>

                    <p>
                        {review.argument}
                    </p>


                    <h2>
                        Main Claim
                    </h2>

                    <p>
                        {review.claim}
                    </p>


                    <h2>
                        Supporting Points
                    </h2>

                    <ul>

                        {review.supporting_points?.map(
                            (item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>


                    <h2>
                        Strengths
                    </h2>

                    <ul>

                        {review.strengths?.map(
                            (item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>


                    <h2>
                        Weaknesses
                    </h2>

                    <ul>

                        {review.weaknesses?.map(
                            (item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>


                    <h2>
                        Suggestions
                    </h2>

                    <ul>

                        {review.suggestions?.map(
                            (item, index) => (

                                <li key={index}>
                                    {item}
                                </li>

                            )
                        )}

                    </ul>

                </div>

            </div>

        </CoachLayout>

    );

}


export default ArgumentReviewDetails;