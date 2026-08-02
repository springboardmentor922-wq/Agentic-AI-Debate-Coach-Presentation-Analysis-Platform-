import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import { getCurrentUser } from "../services/userService";

function AppShell({ children, user }) {

    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {

        if (currentUser) return;

        async function loadUser() {

            try {

                const data = await getCurrentUser();

                setCurrentUser(data);

            }

            catch (error) {

                console.error(error);

            }

        }

        loadUser();

    }, [currentUser]);

    if (!currentUser) {

        return <h2>Loading...</h2>;

    }

    return (

        <div className="app-shell">

            <Sidebar user={currentUser} />

            <div className="workspace">

                <Topbar user={currentUser} />

                <main className="page-content">

                    {children}

                </main>

            </div>

        </div>

    );

}

export default AppShell;