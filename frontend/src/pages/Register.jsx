import "./Register.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

export default function Register() {

    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Learner");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleRegister(e) {

        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            const response = await fetch("http://127.0.0.1:8000/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role,
                }),

            });

            const data = await response.json();

            if (response.ok) {

                alert("Registration Successful!");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);

            } else {

                alert(data.detail || "Registration Failed");

            }

        } catch (error) {

            console.error(error);
            alert("Server Error");

        }

    }

    return (

        <div className="login-page">

            <div className="login-card">

                <h1>🧠 AI Debate Coach</h1>

                <p className="subtitle">
                    Create Your Account
                </p>

                <form onSubmit={handleRegister}>

                    <div className="input-group">

                        <FaUser className="icon" />

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <FaUser className="icon" />

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                    </div>

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
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <div className="input-group">

                        <FaLock className="icon" />

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />

                        <span
                            className="eye"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <div className="input-group">

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="role-select"
                        >
                            <option value="Learner">Learner</option>
                            <option value="Coach">Coach</option>
                            <option value="Educator">Educator</option>
                            <option value="Admin">Admin</option>
                        </select>

                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Create Account
                    </button>

                </form>

                <div className="divider">
                    OR
                </div>

                <Link
                    to="/login"
                    className="register-btn"
                >
                    Already have an account? Login
                </Link>

            </div>

        </div>

    );

}