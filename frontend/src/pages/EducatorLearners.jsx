import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { getEducatorLearners } from "../services/educatorLearnersService";

import {
    FaUsers,
    FaSearch,
    FaEye,
    FaChartLine
} from "react-icons/fa";


function EducatorLearners() {

    const navigate = useNavigate();

    const [learners, setLearners] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadLearners();

    }, []);


    async function loadLearners() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getEducatorLearners();

            setLearners(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load learners:",
                err
            );

            setError(
                "Unable to load learners."
            );

        } finally {

            setLoading(false);

        }

    }


    const filteredLearners =
        learners.filter((learner) => {

            const searchText =
                search.toLowerCase();

            return (

                learner.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                learner.email
                    ?.toLowerCase()
                    .includes(searchText)

            );

        });


    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="dashboard-header">

                    <div>

                        <h1>
                            Learners
                        </h1>

                        <p>
                            Monitor and review your learners'
                            debate performance.
                        </p>

                    </div>


                    <div
                        className="dashboard-stat-icon purple"
                        style={{
                            width: "55px",
                            height: "55px"
                        }}
                    >

                        <FaUsers />

                    </div>

                </div>


                {/* SEARCH */}

                <div
                    className="chart-card"
                    style={{
                        marginBottom: "25px"
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            maxWidth: "450px"
                        }}
                    >

                        <FaSearch
                            style={{
                                position: "absolute",
                                left: "15px",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                color: "#9CA3AF"
                            }}
                        />

                        <input
                            className="form-control"
                            style={{
                                paddingLeft: "42px"
                            }}
                            placeholder="Search learner by name or email..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* CONTENT */}

                <div className="chart-card">


                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <h2>
                            All Learners
                        </h2>

                        <span>
                            {filteredLearners.length} learner
                            {filteredLearners.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div
                            style={{
                                padding: "40px",
                                textAlign: "center"
                            }}
                        >

                            <h3>
                                Loading learners...
                            </h3>

                        </div>

                    )}


                    {/* ERROR */}

                    {!loading && error && (

                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center"
                            }}
                        >

                            <p>
                                {error}
                            </p>

                            <button
                                className="btn btn-primary"
                                onClick={loadLearners}
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        filteredLearners.length === 0 && (

                            <div
                                style={{
                                    padding: "50px",
                                    textAlign: "center"
                                }}
                            >

                                <FaUsers
                                    size={45}
                                    style={{
                                        color: "#9CA3AF",
                                        marginBottom: "15px"
                                    }}
                                />

                                <h3>
                                    No learners found
                                </h3>

                                <p>
                                    {search
                                        ? "Try a different search."
                                        : "No learner accounts are available yet."
                                    }
                                </p>

                            </div>

                        )}


                    {/* TABLE */}

                    {!loading &&
                        !error &&
                        filteredLearners.length > 0 && (

                            <div
                                style={{
                                    overflowX: "auto"
                                }}
                            >

                                <table
                                    className="table"
                                    style={{
                                        width: "100%"
                                    }}
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                Learner
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Debates
                                            </th>

                                            <th>
                                                Average Score
                                            </th>

                                            <th>
                                                Latest Debate
                                            </th>

                                            <th>
                                                Latest Score
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredLearners.map(
                                            (learner) => (

                                                <tr
                                                    key={
                                                        learner.id
                                                    }
                                                >

                                                    {/* NAME */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                learner.name
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* EMAIL */}

                                                    <td>

                                                        {
                                                            learner.email
                                                        }

                                                    </td>


                                                    {/* DEBATES */}

                                                    <td>

                                                        {
                                                            learner.total_debates
                                                        }

                                                    </td>


                                                    {/* AVERAGE */}

                                                    <td>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "6px"
                                                            }}
                                                        >

                                                            <FaChartLine />

                                                            {
                                                                learner.average_score
                                                            }
                                                            %

                                                        </div>

                                                    </td>


                                                    {/* TOPIC */}

                                                    <td>

                                                        {
                                                            learner.latest_topic
                                                            ||
                                                            "No debate yet"
                                                        }

                                                    </td>


                                                    {/* SCORE */}

                                                    <td>

                                                        {
                                                            learner.latest_score
                                                            !== null
                                                            &&
                                                            learner.latest_score
                                                            !== undefined
                                                                ? `${learner.latest_score}%`
                                                                : "N/A"
                                                        }

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/educator/learner/${learner.id}`
                                                                )
                                                            }
                                                        >

                                                            <FaEye />

                                                            {" "}
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

            </div>

        </Layout>

    );

}


export default EducatorLearners;