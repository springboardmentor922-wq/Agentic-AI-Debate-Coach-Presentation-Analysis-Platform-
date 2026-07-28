import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProfile } from "../services/profileService";
import { getSessions } from "../services/sessionService";

export default function Profile() {

    const [profile, setProfile] = useState(null);
    const [sessionCount, setSessionCount] = useState(0);

    useEffect(() => {

        async function loadProfile() {

            try {

                const profileData = await getProfile();

                const sessions = await getSessions();

                setProfile(profileData);

                if (Array.isArray(sessions)) {
                    setSessionCount(sessions.length);
                }

            } catch (error) {

                console.error("Error loading profile:", error);

            }

        }

        loadProfile();

    }, []);

    if (!profile) {
        return (
            <DashboardLayout>
                <h2>Loading Profile...</h2>
            </DashboardLayout>
        );
    }

    return (

        <DashboardLayout>

            <h1>My Profile</h1>

            <hr />

            <h3>Username</h3>
            <p>{profile.username}</p>

            <h3>Email</h3>
            <p>{profile.email}</p>

            <h3>Role</h3>
            <p>{profile.role}</p>

            <hr />

            <h2>Skill Tracking</h2>

            <h3>Debates Completed</h3>
            <p>{sessionCount}</p>

            <h3>Current Skill Level</h3>
            <p>Intermediate</p>

            <h3>Average Score</h3>
            <p>82%</p>

            <h3>Strongest Skill</h3>
            <p>Confidence</p>

            <h3>Needs Improvement</h3>
            <p>Rebuttal</p>

        </DashboardLayout>

    );

}