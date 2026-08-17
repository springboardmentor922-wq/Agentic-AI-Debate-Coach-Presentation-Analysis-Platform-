import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";

import {
    getFallacyReport
} from "../services/fallacyService";


function FallacyReportDetails() {

    const { id } = useParams();

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadReport();

    }, [id]);


    async function loadReport() {

        try {

            const data =
                await getFallacyReport(id);

            setReport(data);

        } catch (error) {

            console.error(
                "Failed to load fallacy report:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <CoachLayout>

                <div className="coach-page">

                    <h1>
                        Fallacy Report
                    </h1>

                    <div className="coach-empty-card">
                        Loading...
                    </div>

                </div>

            </CoachLayout>

        );

    }


    if (!report) {

        return (

            <CoachLayout>

                <div className="coach-page">

                    <h1>
                        Fallacy Report
                    </h1>

                    <div className="coach-empty-card">
                        Report not found.
                    </div>

                </div>

            </CoachLayout>

        );

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Fallacy Report
                </h1>


                <div className="coach-empty-card">

                    <h2>
                        Learner
                    </h2>

                    <p>
                        {report.learner_name}
                    </p>


                    <h2>
                        Original Argument
                    </h2>

                    <p>
                        {report.argument}
                    </p>


                    <h2>
                        Detected Fallacies
                    </h2>

                    {report.detected_fallacies?.map(
                        (fallacy, index) => (

                            <div
                                key={index}
                                style={{
                                    marginBottom: "25px"
                                }}
                            >

                                <h3>
                                    {fallacy}
                                </h3>

                                <p>
                                    <strong>
                                        Explanation:
                                    </strong>
                                </p>

                                <p>
                                    {report.explanation?.[index]}
                                </p>

                                <p>
                                    <strong>
                                        How to Improve:
                                    </strong>
                                </p>

                                <p>
                                    {report.suggestions?.[index]}
                                </p>

                            </div>

                        )
                    )}

                </div>

            </div>

        </CoachLayout>

    );

}


export default FallacyReportDetails;