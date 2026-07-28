import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Learner");

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
                navigate("/");
            } else {
                alert(data.detail || "Registration Failed");
            }

        } catch (error) {
            console.error(error);
            alert("Server Error");
        }
    }

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:
                    "linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)"
            }}
        >
            <form
                onSubmit={handleRegister}
                style={{
                    width: "420px",
                    background: "white",
                    padding: "35px",
                    borderRadius: "18px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.25)"
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "5px",
                        color: "#2563eb"
                    }}
                >
                    AI Debate Coach
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "25px"
                    }}
                >
                    Create your account
                </p>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={inputStyle}
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={inputStyle}
                >
                    <option value="Learner">Learner</option>
                    <option value="Educator">Educator</option>
                    <option value="Coach">Coach</option>
                    <option value="Admin">Admin</option>
                </select>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "14px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "16px",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Create Account
                </button>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}
                >
                    Already have an account?{" "}
                    <Link to="/">Login</Link>
                </p>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box"
};