import "./Navbar.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {

    FaBell,

    FaSearch,

    FaCog,

    FaSignOutAlt

} from "react-icons/fa";

const Navbar = () => {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const today = new Date().toLocaleDateString("en-US", {

        weekday: "long",

        month: "long",

        day: "numeric",

        year: "numeric"

    });

    const handleLogout = () => {

        logout();

        navigate("/login");

    };

    return (

        <header className="navbar">

            {/* ================================
                    LEFT SECTION
            ================================= */}

            <div className="navbar-left">

                <div className="search-box">

                    <FaSearch />

                    <input

                        type="text"

                        placeholder="Search..."

                    />

                </div>

            </div>

            {/* ================================
                    RIGHT SECTION
            ================================= */}

            <div className="navbar-right">

                <div className="current-date">

                    {today}

                </div>

                <button className="icon-btn">

                    <FaBell />

                </button>

                <button className="icon-btn">

                    <FaCog />

                </button>

                <div className="profile-box">

                    <div className="navbar-avatar">

                        {

                            user?.full_name

                                ?.charAt(0)

                                ?.toUpperCase() || "G"

                        }

                    </div>

                    <div className="profile-info">

                        <h4>

                            {

                                user?.full_name ||

                                "Guest"

                            }

                        </h4>

                        <span>

                            {

                                user?.role ||

                                ""

                            }

                        </span>

                    </div>

                </div>

                <button

                    className="logout-icon"

                    onClick={handleLogout}

                >

                    <FaSignOutAlt />

                </button>

            </div>

        </header>

    );

};

export default Navbar;