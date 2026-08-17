import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    getEducatorSubmissions,
    reviewAssignment
} from "../services/assignmentSubmissionService";


function AssignmentReviews() {

    const [submissions, setSubmissions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selected, setSelected] =
        useState(null);

    const [score, setScore] =
        useState("");

    const [feedback, setFeedback] =
        useState("");

    const [saving, setSaving] =
        useState(false);


    useEffect(() => {

        loadSubmissions();

    }, []);


    const loadSubmissions = async () => {

        try {

            const data =
                await getEducatorSubmissions();

            setSubmissions(
                data || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };


    const openReview = (
        submission
    ) => {

        setSelected(
            submission
        );

        setScore(
            submission.score ?? ""
        );

        setFeedback(
            submission.educator_feedback || ""
        );

    };


    const saveReview = async () => {

        if (
            score === "" ||
            Number(score) < 0 ||
            Number(score) > 100
        ) {

            alert(
                "Enter a score between 0 and 100."
            );

            return;

        }


        if (!feedback.trim()) {

            alert(
                "Please enter feedback."
            );

            return;

        }


        try {

            setSaving(true);


            await reviewAssignment(

                selected.id,

                score,

                feedback

            );


            alert(
                "Review submitted successfully!"
            );


            setSelected(null);

            await loadSubmissions();


        } catch (error) {

            alert(

                error?.response?.data?.detail ||

                "Unable to submit review."

            );

        } finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading submissions...
                    </h2>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div
                style={{
                    padding: "30px",
                    maxWidth: "1400px",
                    margin: "auto"
                }}
            >

                <h1>
                    Assignment Reviews
                </h1>

                <p
                    style={{
                        color: "#64748b"
                    }}
                >
                    Review learner submissions,
                    provide a score and feedback.
                </p>


                {submissions.length === 0 ? (

                    <div
                        style={{
                            background:
                                "white",
                            padding:
                                "50px",
                            borderRadius:
                                "16px",
                            textAlign:
                                "center",
                            marginTop:
                                "25px"
                        }}
                    >

                        <h2>
                            No submissions yet
                        </h2>

                        <p>
                            Learner submissions
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            display:
                                "grid",
                            gap:
                                "15px",
                            marginTop:
                                "25px"
                        }}
                    >

                        {submissions.map(
                            submission => (

                                <div
                                    key={
                                        submission.id
                                    }
                                    style={{
                                        background:
                                            "white",
                                        padding:
                                            "22px",
                                        borderRadius:
                                            "15px",
                                        border:
                                            "1px solid #e2e8f0"
                                    }}
                                >

                                    <h2>
                                        {
                                            submission.assignment_title
                                        }
                                    </h2>

                                    <p>

                                        <strong>
                                            Learner:
                                        </strong>{" "}

                                        {
                                            submission.learner_name
                                        }

                                    </p>

                                    <p>

                                        <strong>
                                            Email:
                                        </strong>{" "}

                                        {
                                            submission.learner_email
                                        }

                                    </p>


                                    <div
                                        style={{
                                            background:
                                                "#f8fafc",
                                            padding:
                                                "18px",
                                            borderRadius:
                                                "10px",
                                            margin:
                                                "15px 0",
                                            whiteSpace:
                                                "pre-wrap"
                                        }}
                                    >

                                        {
                                            submission.response
                                        }

                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center"
                                        }}
                                    >

                                        <span>

                                            Status:{" "}

                                            <strong>
                                                {
                                                    submission.status
                                                }
                                            </strong>

                                        </span>


                                        <button
                                            onClick={() =>
                                                openReview(
                                                    submission
                                                )
                                            }
                                            style={{
                                                background:
                                                    "#5b21b6",
                                                color:
                                                    "white",
                                                border:
                                                    "none",
                                                padding:
                                                    "11px 20px",
                                                borderRadius:
                                                    "9px",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            {submission.status ===
                                            "Reviewed"
                                                ? "Edit Review"
                                                : "Give Review"}

                                        </button>

                                    </div>


                                    {submission.score !==
                                        null &&
                                        submission.score !==
                                        undefined && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "15px",
                                                color:
                                                    "#16a34a"
                                            }}
                                        >

                                            Score:{" "}

                                            <strong>
                                                {
                                                    submission.score
                                                }/100
                                            </strong>

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* REVIEW MODAL */}

                {selected && (

                    <div
                        style={{
                            position:
                                "fixed",
                            inset: 0,
                            background:
                                "rgba(0,0,0,.5)",
                            display:
                                "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                            zIndex: 2000
                        }}
                    >

                        <div
                            style={{
                                background:
                                    "white",
                                width:
                                    "90%",
                                maxWidth:
                                    "650px",
                                padding:
                                    "30px",
                                borderRadius:
                                    "18px"
                            }}
                        >

                            <h2>
                                Review Submission
                            </h2>

                            <h3>
                                {
                                    selected.assignment_title
                                }
                            </h3>

                            <p>

                                Learner:{" "}

                                <strong>
                                    {
                                        selected.learner_name
                                    }
                                </strong>

                            </p>


                            <label>
                                Score (0-100)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                    score
                                }
                                onChange={
                                    e =>
                                        setScore(
                                            e.target.value
                                        )
                                }
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "12px",
                                    marginTop:
                                        "8px",
                                    marginBottom:
                                        "18px",
                                    boxSizing:
                                        "border-box",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius:
                                        "9px"
                                }}
                            />


                            <label>
                                Feedback
                            </label>

                            <textarea
                                rows="7"
                                value={
                                    feedback
                                }
                                onChange={
                                    e =>
                                        setFeedback(
                                            e.target.value
                                        )
                                }
                                placeholder="Write constructive feedback for the learner..."
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "12px",
                                    marginTop:
                                        "8px",
                                    boxSizing:
                                        "border-box",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius:
                                        "9px"
                                }}
                            />


                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px",
                                    marginTop:
                                        "20px"
                                }}
                            >

                                <button
                                    onClick={
                                        saveReview
                                    }
                                    disabled={
                                        saving
                                    }
                                    style={{
                                        background:
                                            "#5b21b6",
                                        color:
                                            "white",
                                        border:
                                            "none",
                                        padding:
                                            "12px 22px",
                                        borderRadius:
                                            "9px",
                                        cursor:
                                            "pointer"
                                    }}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Submit Review"}

                                </button>


                                <button
                                    onClick={() =>
                                        setSelected(
                                            null
                                        )
                                    }
                                    style={{
                                        padding:
                                            "12px 22px",
                                        border:
                                            "1px solid #cbd5e1",
                                        background:
                                            "white",
                                        borderRadius:
                                            "9px",
                                        cursor:
                                            "pointer"
                                    }}
                                >

                                    Cancel

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </Layout>

    );

}


export default AssignmentReviews;