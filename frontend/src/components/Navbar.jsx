import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("remember");

        navigate("/");

    }

    return (

        <nav className="navbar">

            <div className="logo">
                🧠 AI Debate Coach
            </div>

            <ul className="nav-links">

                <li>
                    <a href="#home">Home</a>
                </li>

                <li>
                    <a href="#features">Features</a>
                </li>

                <li>
                    <a href="#about">About</a>
                </li>

                <li>
                    <a href="#contact">Contact</a>
                </li>

            </ul>

            <div className="nav-buttons">

                {!token ? (

                    <>
                        <Link
                            to="/login"
                            className="nav-login-btn"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="nav-register-btn"
                        >
                            Create Account
                        </Link>
                    </>

                ) : (

                    <>
                        <div className="user-info">

                            <span className="username">
                                Welcome, {username}
                            </span>

                            <span className="role">
                                {role}
                            </span>

                        </div>

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}

            </div>

        </nav>

    );

}