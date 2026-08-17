import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getFallacyReports
} from "../services/fallacyService";


function FallacyReports() {

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    useEffect(() => {

        loadReports();

    }, []);


    async function loadReports() {

        try {

            const data =
                await getFallacyReports();

            console.log(
                "FALLACY REPORTS:",
                data
            );

            setReports(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load fallacy reports:",
                error
            );

            setReports([]);

        } finally {

            setLoading(false);

        }

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Fallacy Reports
                </h1>

                <p className="coach-page-subtitle">
                    Review logical fallacies detected in learner arguments.
                </p>


                {loading ? (

                    <div className="coach-empty-card">
                        Loading...
                    </div>

                ) : reports.length === 0 ? (

                    <div className="coach-empty-card">
                        No fallacy reports available.
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
                                        Argument
                                    </th>

                                    <th>
                                        Fallacies
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {reports.map(
                                    (report) => (

                                        <tr
                                            key={report.id}
                                        >

                                            <td>
                                                {report.learner_name}
                                            </td>

                                            <td>
                                                {report.argument}
                                            </td>

                                            <td>

                                                {report.detected_fallacies
                                                    ?.join(", ")}

                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="coach-view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/coach/fallacy-reports/${report.id}`
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


export default FallacyReports;