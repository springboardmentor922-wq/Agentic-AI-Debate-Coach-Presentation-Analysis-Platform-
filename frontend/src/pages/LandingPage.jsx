import "./LandingPage.css";
import { Link } from "react-router-dom";

import {
    FaRobot,
    FaChartLine,
    FaMicrophone,
    FaUsers
} from "react-icons/fa";

export default function LandingPage() {
    return (
        <div className="landing">

            {/* Hero Section */}

            <section className="hero">

                <h1>🧠 AI Debate Coach</h1>

                <p>
                    Improve your debating, public speaking,
                    presentation and communication skills
                    using Artificial Intelligence.
                </p>

                <div className="buttons">

                    <Link
                        to="/login"
                        className="btn primary"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="btn secondary"
                    >
                        Create Account
                    </Link>

                </div>

            </section>

            {/* Features */}

            <section className="features">

                <div className="card">
                    <FaRobot size={42} />
                    <h3>AI Coaching</h3>
                    <p>
                        Receive instant AI-powered debate
                        feedback and personalized coaching.
                    </p>
                </div>

                <div className="card">
                    <FaChartLine size={42} />
                    <h3>Analytics</h3>
                    <p>
                        Monitor your debate performance
                        and improvement over time.
                    </p>
                </div>

                <div className="card">
                    <FaMicrophone size={42} />
                    <h3>Presentation Analysis</h3>
                    <p>
                        Improve confidence, speaking
                        clarity and presentation skills.
                    </p>
                </div>

                <div className="card">
                    <FaUsers size={42} />
                    <h3>Role Based Access</h3>
                    <p>
                        Separate experiences for
                        Learners, Coaches,
                        Educators and Admins.
                    </p>
                </div>

            </section>

        </div>
    );
}