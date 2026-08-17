import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    getLearnerAssignments,
    submitAssignment
} from "../services/assignmentSubmissionService";


function MyAssignments() {

    const [assignments, setAssignments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selected, setSelected] =
        useState(null);

    const [response, setResponse] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    useEffect(() => {

        loadAssignments();

    }, []);


    const loadAssignments = async () => {

        try {

            const data =
                await getLearnerAssignments();

            setAssignments(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };


    const openAssignment = (
        assignment
    ) => {

        setSelected(assignment);

        setResponse("");

    };


    const handleSubmit = async () => {

        if (!response.trim()) {

            alert(
                "Please enter your response."
            );

            return;

        }


        try {

            setSubmitting(true);


            await submitAssignment(

                selected.id,

                response

            );


            alert(
                "Assignment submitted successfully!"
            );


            setSelected(null);

            setResponse("");

            await loadAssignments();


        } catch (error) {

            alert(

                error?.response?.data?.detail ||

                "Unable to submit assignment."

            );

        } finally {

            setSubmitting(false);

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
                        Loading assignments...
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
                    maxWidth: "1200px",
                    margin: "auto"
                }}
            >

                <h1>
                    My Assignments
                </h1>

                <p
                    style={{
                        color: "#64748b"
                    }}
                >
                    Complete the assignments given
                    by your educator.
                </p>


                {assignments.length === 0 ? (

                    <div
                        style={{
                            background: "white",
                            padding: "50px",
                            borderRadius: "16px",
                            textAlign: "center",
                            marginTop: "25px"
                        }}
                    >

                        <h2>
                            No assignments
                        </h2>

                        <p>
                            You don't have any
                            assignments yet.
                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            display: "grid",
                            gap: "18px",
                            marginTop: "25px"
                        }}
                    >

                        {assignments.map(
                            assignment => (

                                <div
                                    key={
                                        assignment.id
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
                                            assignment.title
                                        }
                                    </h2>

                                    <p>
                                        {
                                            assignment.description
                                        }
                                    </p>

                                    <p>

                                        <strong>
                                            Category:
                                        </strong>{" "}

                                        {
                                            assignment.category ||
                                            "General"
                                        }

                                    </p>

                                    <p>

                                        <strong>
                                            Difficulty:
                                        </strong>{" "}

                                        {
                                            assignment.difficulty
                                        }

                                    </p>

                                    <p>

                                        <strong>
                                            Due Date:
                                        </strong>{" "}

                                        {
                                            assignment.due_date ||
                                            "No due date"
                                        }

                                    </p>


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

                                        <span
                                            style={{
                                                fontWeight:
                                                    "600",
                                                color:
                                                    assignment.submission_status ===
                                                    "Reviewed"
                                                        ? "#16a34a"
                                                        : "#d97706"
                                            }}
                                        >

                                            {
                                                assignment.submission_status
                                            }

                                        </span>


                                        <button
                                            onClick={() =>
                                                openAssignment(
                                                    assignment
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
                                                    "11px 18px",
                                                borderRadius:
                                                    "9px",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            {
                                                assignment.submission_status ===
                                                "Not Submitted"
                                                    ? "Start Assignment"
                                                    : "View / Resubmit"
                                            }

                                        </button>

                                    </div>


                                    {assignment.score !== null &&
                                        assignment.score !== undefined && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "18px",
                                                padding:
                                                    "15px",
                                                background:
                                                    "#f0fdf4",
                                                borderRadius:
                                                    "10px"
                                            }}
                                        >

                                            <strong>
                                                Educator Score:
                                            </strong>{" "}

                                            {
                                                assignment.score
                                            }/100

                                            <br />

                                            <strong>
                                                Feedback:
                                            </strong>{" "}

                                            {
                                                assignment.educator_feedback ||
                                                "No feedback"
                                            }

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* SUBMISSION MODAL */}

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
                                    "700px",
                                padding:
                                    "30px",
                                borderRadius:
                                    "18px"
                            }}
                        >

                            <h2>
                                {
                                    selected.title
                                }
                            </h2>

                            <p>
                                {
                                    selected.description
                                }
                            </p>


                            <textarea
                                rows="10"
                                value={
                                    response
                                }
                                onChange={
                                    e =>
                                        setResponse(
                                            e.target.value
                                        )
                                }
                                placeholder="Write your debate response here..."
                                style={{
                                    width:
                                        "100%",
                                    padding:
                                        "14px",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius:
                                        "10px",
                                    boxSizing:
                                        "border-box"
                                }}
                            />


                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px",
                                    marginTop:
                                        "15px"
                                }}
                            >

                                <button
                                    onClick={
                                        handleSubmit
                                    }
                                    disabled={
                                        submitting
                                    }
                                    style={{
                                        background:
                                            "#5b21b6",
                                        color:
                                            "white",
                                        border:
                                            "none",
                                        padding:
                                            "12px 20px",
                                        borderRadius:
                                            "9px",
                                        cursor:
                                            "pointer"
                                    }}
                                >

                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Assignment"}

                                </button>


                                <button
                                    onClick={() =>
                                        setSelected(
                                            null
                                        )
                                    }
                                    style={{
                                        padding:
                                            "12px 20px",
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


export default MyAssignments;