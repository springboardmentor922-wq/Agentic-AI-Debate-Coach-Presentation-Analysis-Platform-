import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getPresentationReview
} from "../services/presentationService";


function PresentationReviewDetails() {

    const { id } = useParams();

    const [review, setReview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadReview();

    }, [id]);


    async function loadReview() {

        try {

            const data =
                await getPresentationReview(id);

            setReview(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <CoachLayout>

                <div className="coach-page">

                    <h1>
                        Presentation Review
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
                        Presentation Review
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
                    Presentation Review
                </h1>


                <div className="coach-empty-card">

                    <h2>
                        Learner
                    </h2>

                    <p>
                        {review.learner_name}
                    </p>


                    <h2>
                        Presentation
                    </h2>

                    <p>
                        {review.presentation}
                    </p>


                    <h2>
                        Scores
                    </h2>

                    <p>
                        Clarity: {review.clarity}/10
                    </p>

                    <p>
                        Confidence: {review.confidence}/10
                    </p>

                    <p>
                        Communication: {
                            review.communication
                        }/10
                    </p>

                    <p>
                        Structure: {
                            review.structure
                        }/10
                    </p>

                    <p>
                        Overall: {
                            review.overall
                        }/10
                    </p>


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


export default PresentationReviewDetails;