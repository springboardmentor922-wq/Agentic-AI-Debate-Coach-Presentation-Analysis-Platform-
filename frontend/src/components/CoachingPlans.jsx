import { useEffect, useState } from "react";

import {
    getMyCoachingPlans
} from "../services/coachingPlanService";


function CoachingPlans() {

    const [plans, setPlans] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadPlans();

    }, []);


    async function loadPlans() {

        try {

            const data =
                await getMyCoachingPlans();

            setPlans(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load coaching plans:",
                error
            );

            setPlans([]);

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (
            <div className="chart-card">
                <h2>My Coaching Plans</h2>
                <p>Loading...</p>
            </div>
        );

    }


    return (

        <div className="chart-card">

            <h2>
                My Coaching Plans
            </h2>

            {plans.length === 0 ? (

                <p>
                    No coaching plans assigned yet.
                </p>

            ) : (

                plans.map((plan) => (

                    <div
                        key={plan.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "18px",
                            marginTop: "15px"
                        }}
                    >

                        <h3>
                            {plan.title}
                        </h3>

                        <p>
                            <strong>Goal:</strong>{" "}
                            {plan.goal}
                        </p>

                        <p>
                            <strong>Focus Area:</strong>{" "}
                            {plan.focus_area || "-"}
                        </p>

                        <p>
                            <strong>Activities:</strong>{" "}
                            {plan.activities || "-"}
                        </p>

                        <p>
                            <strong>Due Date:</strong>{" "}
                            {plan.due_date || "-"}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {plan.status}
                        </p>

                    </div>

                ))

            )}

        </div>

    );

}


export default CoachingPlans;