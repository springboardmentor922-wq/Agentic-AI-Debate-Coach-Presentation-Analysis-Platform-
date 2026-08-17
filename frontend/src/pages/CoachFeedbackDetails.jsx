import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../services/api";

function CoachFeedbackDetails() {

    const { id } = useParams();

    const [review, setReview] = useState(null);

    useEffect(() => {

        loadReview();

    }, []);

    async function loadReview() {

        try {

            const response = await api.get(
                `/learner-feedback/${id}`
            );

            setReview(response.data);

        }

        catch (err) {

            console.log(err);

        }

    }

    if (!review) {

        return (

            <Layout>

                <h2>Loading...</h2>

            </Layout>

        );

    }

    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>📋 Coach Feedback Report</h2>

                    <br />

                    <h3>{review.topic}</h3>

                    <p>

                        <b>Coach :</b> {review.coach_name}

                    </p>

                    <p>

                        <b>Reviewed On :</b>{" "}

                        {new Date(
                            review.reviewed_at
                        ).toLocaleString()}

                    </p>

                    <hr />

                    <h3>Scores</h3>

                    <table
                        className="table table-bordered"
                    >

                        <tbody>

                            <tr>

                                <td>Grammar</td>

                                <td>{review.grammar}/10</td>

                            </tr>

                            <tr>

                                <td>Logic</td>

                                <td>{review.logic}/10</td>

                            </tr>

                            <tr>

                                <td>Confidence</td>

                                <td>{review.confidence}/10</td>

                            </tr>

                            <tr>

                                <td>Communication</td>

                                <td>{review.communication}/10</td>

                            </tr>

                            <tr>

                                <td><b>Overall</b></td>

                                <td>

                                    <b>{review.overall}/10</b>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <hr />

                    <h3>Strengths</h3>

                    <p>{review.strengths}</p>

                    <hr />

                    <h3>Areas for Improvement</h3>

                    <p>{review.improvements}</p>

                    <hr />

                    <h3>Coach Feedback</h3>

                    <p>{review.feedback}</p>

                </div>

            </div>

        </Layout>

    );

}

export default CoachFeedbackDetails;