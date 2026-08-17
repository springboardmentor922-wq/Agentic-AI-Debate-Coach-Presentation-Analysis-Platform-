import { useEffect, useState } from "react";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getAssignedDebates,
    assignDebate,
} from "../services/assignedDebateService";

function AssignedDebates() {

    const [debates, setDebates] =
        useState([]);

    const [form, setForm] = useState({

        learner_id: "",

        topic: "",

        category: "",

        difficulty: "Easy",

        due_date: ""

    });

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD ASSIGNMENTS
    // ==========================================

    useEffect(() => {

        loadDebates();

    }, []);


    async function loadDebates() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getAssignedDebates();

            setDebates(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(error);

            setError(
                error?.response?.data?.detail ||
                "Failed to load assignments."
            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // HANDLE FORM
    // ==========================================

    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value

        });

    }


    // ==========================================
    // ASSIGN DEBATE
    // ==========================================

    async function submit() {

        if (!form.learner_id) {

            alert(
                "Please enter the learner ID."
            );

            return;

        }


        if (!form.topic.trim()) {

            alert(
                "Please enter the debate topic."
            );

            return;

        }


        try {

            setSubmitting(true);

            setError("");


            await assignDebate({

                learner_id:
                    Number(
                        form.learner_id
                    ),

                topic:
                    form.topic.trim(),

                category:
                    form.category.trim(),

                difficulty:
                    form.difficulty,

                due_date:
                    form.due_date

            });


            alert(
                "Debate assigned successfully."
            );


            setForm({

                learner_id: "",

                topic: "",

                category: "",

                difficulty: "Easy",

                due_date: ""

            });


            await loadDebates();

        } catch (error) {

            console.error(error);

            alert(
                error?.response?.data?.detail ||
                "Failed to assign debate."
            );

        } finally {

            setSubmitting(false);

        }

    }


    return (

        <CoachLayout>

            <div
                className="assigned-debates-page"
                style={{
                    padding: "30px"
                }}
            >

                <h1>
                    Assigned Debates
                </h1>

                <p
                    style={{
                        color: "#64748b"
                    }}
                >
                    Assign debate tasks to your
                    learners and track their status.
                </p>


                {/* =================================
                    ASSIGN FORM
                ================================= */}

                <div
                    style={{
                        background: "#ffffff",
                        padding: "25px",
                        borderRadius: "14px",
                        marginTop: "25px",
                        marginBottom: "30px",
                        border:
                            "1px solid #e1e5eb"
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0
                        }}
                    >
                        Assign New Debate
                    </h2>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(250px, 1fr))",
                            gap: "18px"
                        }}
                    >

                        <input
                            className="form-control"
                            placeholder="Learner ID"
                            name="learner_id"
                            type="number"
                            value={
                                form.learner_id
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <input
                            className="form-control"
                            placeholder="Debate Topic"
                            name="topic"
                            value={
                                form.topic
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <input
                            className="form-control"
                            placeholder="Category"
                            name="category"
                            value={
                                form.category
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <select
                            className="form-control"
                            name="difficulty"
                            value={
                                form.difficulty
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="Easy">
                                Easy
                            </option>

                            <option value="Medium">
                                Medium
                            </option>

                            <option value="Hard">
                                Hard
                            </option>

                        </select>


                        <input
                            className="form-control"
                            type="date"
                            name="due_date"
                            value={
                                form.due_date
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    <button
                        className="coach-view-btn"
                        style={{
                            marginTop: "20px",
                            padding:
                                "12px 22px"
                        }}
                        onClick={
                            submit
                        }
                        disabled={
                            submitting
                        }
                    >

                        {submitting
                            ? "Assigning..."
                            : "Assign Debate"}

                    </button>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#b91c1c",
                            padding:
                                "15px",
                            borderRadius:
                                "10px",
                            marginBottom:
                                "20px"
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* =================================
                    ASSIGNMENT TABLE
                ================================= */}

                <div
                    className="coach-table-container"
                >

                    <table
                        className="assigned-debates-table"
                    >

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Learner
                                </th>

                                <th>
                                    Topic
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Difficulty
                                </th>

                                <th>
                                    Due Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "30px"
                                        }}
                                    >
                                        Loading assignments...
                                    </td>

                                </tr>

                            ) : debates.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "30px"
                                        }}
                                    >
                                        No assigned debates found.
                                    </td>

                                </tr>

                            ) : (

                                debates.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.learner_name ||
                                                    item.learner_id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.topic
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.category ||
                                                    "General"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.difficulty
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.due_date ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.status
                                                }
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </CoachLayout>

    );

}


export default AssignedDebates;