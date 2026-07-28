import "./Login.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import { loginUser } from "../services/authService";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        const result = await loginUser({
            email,
            password,
        });

        if (result.access_token) {

            localStorage.setItem("token", result.access_token);
            localStorage.setItem("role", result.role);
            localStorage.setItem("username", result.username);

            if (rememberMe) {
                localStorage.setItem("remember", "true");
            }

            alert("Login Successful!");

            switch (result.role) {
                case "Learner":
                    navigate("/learner");
                    break;

                case "Coach":
                    navigate("/coach");
                    break;

                case "Educator":
                    navigate("/educator");
                    break;

                case "Admin":
                    navigate("/admin");
                    break;

                default:
                    navigate("/dashboard");
            }

        } else {
            alert("Invalid Email or Password");
        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>🧠 AI Debate Coach</h1>

                <p className="subtitle">
                    Welcome Back
                </p>

                <form onSubmit={handleLogin}>

                    <div className="input-group">

                        <FaEnvelope className="icon" />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <FaLock className="icon" />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <span
                            className="eye"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <div className="options">

                        <label className="remember-label">

                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                            />

                            <span>Remember Me</span>

                        </label>

                        <Link
                            to="#"
                            className="forgot-link"
                        >
                            Forgot Password?
                        </Link>

                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>

                <div className="divider">
                    OR
                </div>

                <Link
                    to="/register"
                    className="register-btn"
                >
                    Create New Account
                </Link>

            </div>

        </div>
    );
}