import { useEffect, useState } from "react";

import CoachLayout from "../components/coach/CoachLayout";

import {
    createCoachingPlan,
    getCoachingPlans,
    updateCoachingPlanStatus
} from "../services/coachingPlanService";


function CoachingPlans() {

    const [plans, setPlans] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [form, setForm] = useState({

        learner_id: "",

        title: "",

        goal: "",

        focus_area: "",

        activities: "",

        due_date: ""

    });


    useEffect(() => {

        loadPlans();

    }, []);


    async function loadPlans() {

        try {

            const data =
                await getCoachingPlans();

            setPlans(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(error);

            setPlans([]);

        } finally {

            setLoading(false);

        }

    }


    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value

        });

    }


    async function handleSubmit(e) {

        e.preventDefault();

        if (
            !form.learner_id ||
            !form.title ||
            !form.goal
        ) {

            alert(
                "Learner ID, title and goal are required."
            );

            return;

        }


        try {

            await createCoachingPlan({

                learner_id:
                    Number(form.learner_id),

                title:
                    form.title,

                goal:
                    form.goal,

                focus_area:
                    form.focus_area,

                activities:
                    form.activities,

                due_date:
                    form.due_date

            });


            alert(
                "Coaching plan created successfully."
            );


            setForm({

                learner_id: "",

                title: "",

                goal: "",

                focus_area: "",

                activities: "",

                due_date: ""

            });


            loadPlans();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to create coaching plan."
            );

        }

    }


    async function changeStatus(
        id,
        status
    ) {

        try {

            await updateCoachingPlanStatus(
                id,
                status
            );

            loadPlans();

        } catch (error) {

            console.error(error);

            alert(
                "Failed to update status."
            );

        }

    }


    return (

        <CoachLayout>

            <div className="coach-page">

                <h1>
                    Coaching Plans
                </h1>

                <p className="coach-page-subtitle">
                    Create personalized development plans for learners.
                </p>


                <div
                    className="chart-card"
                    style={{
                        marginBottom: "30px"
                    }}
                >

                    <h2>
                        Create Coaching Plan
                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <input
                            className="form-control mb-3"
                            name="learner_id"
                            type="number"
                            placeholder="Learner ID"
                            value={
                                form.learner_id
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <input
                            className="form-control mb-3"
                            name="title"
                            placeholder="Plan Title"
                            value={
                                form.title
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <textarea
                            className="form-control mb-3"
                            name="goal"
                            rows="3"
                            placeholder="Goal"
                            value={
                                form.goal
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <input
                            className="form-control mb-3"
                            name="focus_area"
                            placeholder="Focus Area"
                            value={
                                form.focus_area
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <textarea
                            className="form-control mb-3"
                            name="activities"
                            rows="4"
                            placeholder="Activities"
                            value={
                                form.activities
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <input
                            className="form-control mb-3"
                            name="due_date"
                            type="date"
                            value={
                                form.due_date
                            }
                            onChange={
                                handleChange
                            }
                        />


                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Create Plan
                        </button>

                    </form>

                </div>


                <div>

                    <h2>
                        Existing Plans
                    </h2>


                    {loading ? (

                        <div className="coach-empty-card">
                            Loading...
                        </div>

                    ) : plans.length === 0 ? (

                        <div className="coach-empty-card">
                            No coaching plans created yet.
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
                                            Title
                                        </th>

                                        <th>
                                            Focus Area
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

                                    {plans.map(
                                        (plan) => (

                                            <tr
                                                key={
                                                    plan.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        plan.learner_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        plan.title
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        plan.focus_area ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        plan.due_date ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        plan.status
                                                    }
                                                </td>

                                                <td>

                                                    {plan.status ===
                                                        "Active" ? (

                                                        <button
                                                            className="coach-view-btn"
                                                            onClick={() =>
                                                                changeStatus(
                                                                    plan.id,
                                                                    "Completed"
                                                                )
                                                            }
                                                        >
                                                            Complete
                                                        </button>

                                                    ) : (

                                                        <button
                                                            className="coach-view-btn"
                                                            onClick={() =>
                                                                changeStatus(
                                                                    plan.id,
                                                                    "Active"
                                                                )
                                                            }
                                                        >
                                                            Activate
                                                        </button>

                                                    )}

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

        </CoachLayout>

    );

}


export default CoachingPlans;