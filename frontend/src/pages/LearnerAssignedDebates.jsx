import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getAssignedDebates
} from "../services/learnerAssignedDebateService";


function LearnerAssignedDebates() {

    const navigate = useNavigate();

    const [debates, setDebates] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

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
                "Unable to load assigned debates."
            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // START DEBATE
    // ==========================================

    function startDebate(debate) {

        navigate(
            "/create-session",
            {

                state: {

                    topic:
                        debate.topic,

                    difficulty:
                        debate.difficulty,

                    category:
                        debate.category,

                    assigned: true,

                    assignment_id:
                        debate.id

                }

            }
        );

    }


    return (

        <Layout>

            <div
                className="dashboard-page"
                style={{
                    padding: "30px"
                }}
            >

                <div
                    className="chart-card"
                >

                    <h1>
                        Assigned Debates
                    </h1>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        Complete the debates assigned
                        to you by your coach.
                    </p>


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
                                margin:
                                    "20px 0"
                            }}
                        >

                            {error}

                        </div>

                    )}


                    {loading ? (

                        <div
                            style={{
                                padding:
                                    "40px",
                                textAlign:
                                    "center"
                            }}
                        >

                            Loading assigned debates...

                        </div>

                    ) : debates.length === 0 ? (

                        <div
                            style={{
                                padding:
                                    "50px 20px",
                                textAlign:
                                    "center",
                                color:
                                    "#64748b"
                            }}
                        >

                            <h3>
                                No assigned debates
                            </h3>

                            <p>
                                Your coach has not
                                assigned any debates yet.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                overflowX:
                                    "auto",
                                marginTop:
                                    "25px"
                            }}
                        >

                            <table
                                className="table table-bordered"
                                style={{
                                    width:
                                        "100%"
                                }}
                            >

                                <thead>

                                    <tr>

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

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {debates.map(
                                        (debate) => (

                                            <tr
                                                key={
                                                    debate.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        debate.topic
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        debate.category ||
                                                        "General"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        debate.difficulty
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        debate.due_date ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        debate.status
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() =>
                                                            startDebate(
                                                                debate
                                                            )
                                                        }
                                                        disabled={
                                                            debate.status ===
                                                            "Completed"
                                                        }
                                                    >

                                                        {debate.status ===
                                                        "Completed"
                                                            ? "Completed"
                                                            : "Start Debate"}

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

            </div>

        </Layout>

    );

}


export default LearnerAssignedDebates;