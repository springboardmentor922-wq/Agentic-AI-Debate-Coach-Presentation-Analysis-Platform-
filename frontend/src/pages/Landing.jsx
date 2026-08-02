import { Link } from "react-router-dom";

function Landing() {

    return (

        <div className="landing-page">

            <div className="landing-content">

                <span className="landing-tag">
                    AI Powered Learning Platform
                </span>

                <h1>
                    AI Debate Coach &
                    <br />
                    Presentation Analysis Platform
                </h1>

                <p>

                    Build confidence in public speaking, improve debating
                    skills, monitor your progress, and prepare for real-world
                    presentations through an interactive learning platform.

                </p>

                <div className="landing-buttons">

                    <Link to="/login">

                        <button>Login</button>

                    </Link>

                    <Link to="/register">

                        <button className="secondary-btn">

                            Create Account

                        </button>

                    </Link>

                </div>

            </div>

        </div>

    );

}

export default Landing;