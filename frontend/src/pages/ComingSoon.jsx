import AppShell from "../layouts/AppShell";

import { useLocation } from "react-router-dom";

function ComingSoon() {

    const location = useLocation();

    const page =
        location.pathname
            .replace("/", "")
            .replaceAll("-", " ");

    return (

        <AppShell>

            <div className="hero-card">

                <h1>🚧 {page.toUpperCase()}</h1>

                <p>
                    This module has been planned and designed.
                    It will be fully implemented during
                    Milestone 3.
                </p>

            </div>

            <div className="panel">

                <h2>Current Status</h2>

                <br />

                <p>

                    ✅ UI Structure Completed

                </p>

                <p>

                    ✅ Navigation Added

                </p>

                <p>

                    🚀 Backend & AI Features Coming in Milestone 3

                </p>

            </div>

        </AppShell>

    );

}

export default ComingSoon;