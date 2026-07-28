import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
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

                <Link
                    to="/login"
                    className="login-btn"
                >
                    Login
                </Link>

                <Link
                    to="/register"
                    className="register-btn"
                >
                    Create Account
                </Link>

            </div>

        </nav>
    );
}