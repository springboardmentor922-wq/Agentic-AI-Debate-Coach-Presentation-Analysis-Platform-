import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaBell,
    FaMoon,
    FaSun,
    FaBars,
    FaUserCircle,
} from "react-icons/fa";

import "../styles/navbar.css";

function Navbar() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {

        if (darkMode) {

            document.body.classList.add(
                "dark-theme"
            );

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            document.body.classList.remove(
                "dark-theme"
            );

            localStorage.setItem(
                "theme",
                "light"
            );
        }

    }, [darkMode]);


    return (

        <header className="navbar">

            {/* LEFT */}

            <div className="navbar-left">

                <div className="menu-icon">
                    <FaBars />
                </div>

                <div className="dashboard-title">

                    <h2>
                        Dashboard
                    </h2>

                    <p>
                        {user?.role || "User"} Dashboard
                    </p>

                </div>

            </div>


            {/* SEARCH */}

            <div className="navbar-search">

                <FaSearch
                    className="search-icon"
                />

                <input
                    type="text"
                    placeholder="Search debates, topics, reports..."
                />

            </div>


            {/* RIGHT */}

            <div className="navbar-right">

                {/* DARK MODE */}

                <button
                    className="icon-btn"
                    onClick={() =>
                        setDarkMode(!darkMode)
                    }
                >

                    {darkMode
                        ? <FaSun />
                        : <FaMoon />
                    }

                </button>


                {/* NOTIFICATIONS */}

                <button className="icon-btn">

                    <FaBell />

                    <span className="notification-count">
                        3
                    </span>

                </button>


                {/* PROFILE */}

                <div
                    className="profile-box"
                    onClick={() =>
                        navigate("/profile")
                    }
                    style={{
                        cursor: "pointer",
                    }}
                    title="View Profile"
                >

                    <FaUserCircle
                        className="profile-icon"
                    />

                    <div>

                        <h4>
                            {user?.full_name}
                        </h4>

                        <span>
                            {user?.role}
                        </span>

                    </div>

                </div>

            </div>

        </header>

    );
}

export default Navbar;