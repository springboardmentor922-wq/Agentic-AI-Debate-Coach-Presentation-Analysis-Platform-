import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../services/authService";
import { saveToken } from "../utils/auth";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await loginUser({
                email,
                password
            });

            saveToken(response.data.access_token);

            window.location.href = "/dashboard";

        } catch {

            setError("Invalid email or password.");

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-box">

                <h1>Welcome Back 👋</h1>

                <p
                    style={{
                        marginBottom: "25px",
                        color: "#9ca3af"
                    }}
                >

                    Sign in to continue your learning journey.

                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit">

                        Login

                    </button>

                </form>

                <Link to="/register">

                    Create Account

                </Link>

            </div>

        </div>

    );

}

export default Login;