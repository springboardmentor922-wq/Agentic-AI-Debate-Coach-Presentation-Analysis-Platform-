import { useEffect, useState } from "react";
import AppShell from "../layouts/AppShell";

import { getCurrentUser } from "../services/userService";

import LearnerDashboard from "../components/dashboard/LearnerDashboard";
import CoachDashboard from "../components/dashboard/CoachDashboard";
import EducatorDashboard from "../components/dashboard/EducatorDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

function Dashboard() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        async function loadUser() {

            try {

                const data = await getCurrentUser();

                setUser(data);

            } catch (error) {

                console.error(error);

            }

        }

        loadUser();

    }, []);

    if (!user) {

        return <h2>Loading...</h2>;

    }

    return (

        <AppShell user={user}>

            {user.role === "Learner" && <LearnerDashboard />}

            {user.role === "Coach" && <CoachDashboard />}

            {user.role === "Educator" && <EducatorDashboard />}

            {user.role === "Admin" && <AdminDashboard />}

        </AppShell>

    );

}

export default Dashboard;