import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import heroImage from "../../assets/hero.png";

import { registerUser } from "../../services/authService";

import "./Register.css";

const Register = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [success, setSuccess] = useState("");

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({

        full_name: "",

        email: "",

        password: "",

        confirmPassword: "",

        role: "Learner",

        agree: false

    });

    // ======================================
    // Handle Input Change
    // ======================================

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]: type === "checkbox" ? checked : value

        }));

    };

    // ======================================
    // Submit
    // ======================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        if (!formData.full_name.trim()) {

            setError("Full name is required.");

            return;

        }

        if (!formData.email.trim()) {

            setError("Email is required.");

            return;

        }

        if (formData.password.length < 8) {

            setError("Password must contain at least 8 characters.");

            return;

        }

        if (formData.password !== formData.confirmPassword) {

            setError("Passwords do not match.");

            return;

        }

        if (!formData.agree) {

            setError("Please accept the Terms & Conditions.");

            return;

        }

        try {

            setLoading(true);

            await registerUser({

                full_name: formData.full_name,

                email: formData.email,

                password: formData.password,

                role: formData.role

            });

            setSuccess("Registration successful! Redirecting to Login...");

            setTimeout(() => {

                navigate("/login");

            }, 2000);

        }

        catch (err) {

            setError(

                err.detail ||

                "Registration failed."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-container">

            {/* Left Side */}

            <div className="auth-left">

                <img

                    src={heroImage}

                    alt="Hero"

                    className="hero-image"

                />

                <h1>Agentic AI Debate Coach</h1>

                <p>

                    Practice debates, improve communication,

                    and track your learning journey with AI.

                </p>

            </div>

            {/* Right Side */}

            <div className="auth-right">

                <div className="auth-card">

                    <h2>Create Account</h2>

                    <p>

                        Join the AI Debate Learning Platform

                    </p>

                    {

                        success &&

                        <div className="success-box">

                            {success}

                        </div>

                    }

                    {

                        error &&

                        <div className="error-box">

                            {error}

                        </div>

                    }

                    <form onSubmit={handleSubmit}>

                        <label>

                            Full Name

                        </label>

                        <input

                            type="text"

                            name="full_name"

                            placeholder="Enter your full name"

                            value={formData.full_name}

                            onChange={handleChange}

                        />

                        <label>

                            Email Address

                        </label>

                        <input

                            type="email"

                            name="email"

                            placeholder="Enter your email"

                            value={formData.email}

                            onChange={handleChange}

                        />

                        <label>

                            Password

                        </label>

                        <div className="password-wrapper">

                            <input

                                type={showPassword ? "text" : "password"}

                                name="password"

                                placeholder="Enter password"

                                value={formData.password}

                                onChange={handleChange}

                            />

                            <span

                                onClick={() =>

                                    setShowPassword(!showPassword)

                                }

                            >

                                👁️

                            </span>

                        </div>

                        <label>

                            Confirm Password

                        </label>

                        <div className="password-wrapper">

                            <input

                                type={showConfirmPassword ? "text" : "password"}

                                name="confirmPassword"

                                placeholder="Confirm password"

                                value={formData.confirmPassword}

                                onChange={handleChange}

                            />

                            <span

                                onClick={() =>

                                    setShowConfirmPassword(!showConfirmPassword)

                                }

                            >

                                👁️

                            </span>

                        </div>

                        <label>

                            Select Role

                        </label>

                        <select

                            name="role"

                            value={formData.role}

                            onChange={handleChange}

                        >

                            <option>

                                Learner

                            </option>

                            <option>

                                Debate Coach

                            </option>

                            <option>

                                Educator

                            </option>

                        </select>

                        <div className="checkbox-row">

                            <input

                                type="checkbox"

                                name="agree"

                                checked={formData.agree}

                                onChange={handleChange}

                            />

                            <span>

                                I agree to the Terms & Conditions

                            </span>

                        </div>

                        <button

                            className="primary-btn"

                            disabled={loading}

                        >

                            {

                                loading

                                    ? "Creating Account..."

                                    : "Create Account"

                            }

                        </button>

                    </form>

                    <div className="divider">

                        Already have an account?

                    </div>

                    <Link

                        to="/login"

                        className="secondary-btn"

                    >

                        Login

                    </Link>

                    <div className="security-text">

                        Administrator accounts are created only by the system.

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Register;