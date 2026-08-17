import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import { getLearners } from "../services/coachDashboardService";

function CoachLearners() {

    const navigate = useNavigate();

    const [learners, setLearners] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadLearners();

    }, []);

    async function loadLearners() {

        try {

            const data = await getLearners();

            setLearners(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    }

    const filtered = learners.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <CoachLayout>

            <div className="coach-main">

                <div className="coach-header">

                    <div>

                        <h1>Learners</h1>

                        <p>Manage and review learner debates.</p>

                    </div>

                    <input
                        className="coach-search"
                        placeholder="Search learner..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                {loading ? (

                    <h3>Loading...</h3>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>Name</th>

                                

                                <th>Latest Topic</th>

                                <th>Score</th>

                                <th>Status</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filtered.map((learner) => (

                                <tr key={learner.id}>

                                    <td>{learner.name}</td>

                                    

                                    <td>{learner.latest_topic}</td>

                                    <td>{learner.score}</td>

                                    <td>{learner.status}</td>

                                    <td>

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                navigate(
                                                    `/coach/learner/${learner.id}`
                                                )
                                            }
                                        >

                                            View

                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </CoachLayout>

    );

}

export default CoachLearners;