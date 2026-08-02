import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../services/authService";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "Learner",
        experience: "Beginner"
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await registerUser(form);

            alert("Registration Successful!");

            navigate("/login");

        } catch {

            setError("Registration failed.");

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-box">

                <h1>Create Your Account 🚀</h1>

                <p
                    style={{
                        marginBottom: "25px",
                        color: "#9ca3af"
                    }}
                >

                    Join the AI Debate Coach Platform.

                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="Learner">Learner</option>
                        <option value="Coach">Coach</option>
                        <option value="Educator">Educator</option>
                        <option value="Admin">Admin</option>
                    </select>

                    <select
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                    </select>

                    {error && <p className="error">{error}</p>}

                    <button type="submit">

                        Register

                    </button>

                </form>

                <Link to="/login">

                    Already have an account?

                </Link>

            </div>

        </div>

    );

}

export default Register;