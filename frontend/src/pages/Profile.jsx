import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";
import Panel from "../components/ui/Panel";

import { getCurrentUser } from "../services/userService";

function Profile() {

    const [user, setUser] = useState(null);

    useEffect(() => {

        async function loadUser() {

            try {

                const data = await getCurrentUser();

                setUser(data);

            } catch (err) {

                console.error(err);

            }

        }

        loadUser();

    }, []);

    if (!user) {

        return <h2>Loading...</h2>;

    }

    return (

        <AppShell>

            <h1>My Profile</h1>

            <br />

            <Panel title="User Information">

                <p><strong>Name:</strong> {user.full_name}</p>

                <p><strong>Email:</strong> {user.email}</p>

                <p><strong>Role:</strong> {user.role}</p>

                <p><strong>Experience:</strong> {user.experience}</p>

                <br />

                <button disabled>

                    Edit Profile (Coming Soon)

                </button>

            </Panel>

        </AppShell>

    );

}

export default Profile;