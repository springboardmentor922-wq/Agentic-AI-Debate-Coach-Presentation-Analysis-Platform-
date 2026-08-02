import { useNavigate } from "react-router-dom";

import { logout } from "../../utils/auth";

function Topbar({ user }) {

    const navigate = useNavigate();

    const role = user?.role || "Learner";

    const userName =
        user?.name ||
        user?.username ||
        "User";

    function getTitle() {

        switch (role.toLowerCase()) {

            case "admin":
                return "Admin Dashboard";

            case "coach":
                return "Coach Dashboard";

            case "educator":
                return "Educator Dashboard";

            default:
                return "Learner Dashboard";

        }

    }

    function handleLogout() {

        logout();

        navigate("/login");

    }

    return (

        <header className="topbar">

            <div className="topbar-left">

                <button
                    className="topbar-menu-button"
                    type="button"
                >
                    ☰
                </button>

                <div>

                    <h2>
                        {getTitle()}
                    </h2>

                    <p>
                        Debate. Analyze. Improve.
                    </p>

                </div>

            </div>

            <div className="topbar-center">

                <div className="topbar-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search debates, topics, sessions..."
                    />

                </div>

            </div>

            <div className="topbar-actions">

                <button
                    className="notification-button"
                    type="button"
                >
                    ♧

                    <span className="notification-dot">
                        3
                    </span>

                </button>

                <div className="topbar-profile">

                    <div className="profile-avatar">

                        {userName
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div className="profile-information">

                        <strong>
                            {userName}
                        </strong>

                        <span>
                            {role}
                        </span>

                    </div>

                </div>

                <button
                    className="topbar-logout"
                    onClick={handleLogout}
                    type="button"
                >
                    Logout
                </button>

            </div>

        </header>

    );

}

export default Topbar;