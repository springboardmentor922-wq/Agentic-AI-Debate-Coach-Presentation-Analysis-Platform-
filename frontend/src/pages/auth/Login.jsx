import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Login.css";

import heroImage from "../../assets/hero.png";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // ============================================
    // Handle Input Change
    // ============================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({

            ...formData,

            [name]: value

        });

    };

    // ============================================
    // Handle Login
    // ============================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setLoading(true);

        try {

            const response = await loginUser(formData);

            login(

                response.access_token,

                response.user

            );

            switch (response.user.role) {

                case "Learner":

                    navigate("/learner/dashboard");

                    break;

                case "Debate Coach":

                    navigate("/coach/dashboard");

                    break;

                case "Educator":

                    navigate("/educator/dashboard");

                    break;

                case "Administrator":

                    navigate("/admin/dashboard");

                    break;

                default:

                    navigate("/");

            }

        }

        catch (err) {

            setError(

                err.detail ||

                "Invalid email or password."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-container">

            {/* Left Side */}

            <div className="login-left">

                <img

                    src={heroImage}

                    alt="Hero"

                    className="hero-image"

                />

                <h1>

                    AI Debate Coach

                </h1>

                <p>

                    Improve your communication,

                    debating and presentation

                    skills using AI-powered

                    coaching.

                </p>

            </div>

            {/* Right Side */}

            <div className="login-right">

                <div className="login-card">

                    <h2>

                        Welcome Back

                    </h2>

                    <p>

                        Sign in to continue your

                        learning journey.

                    </p>

                    {

                        error &&

                        <div className="error-box">

                            {error}

                        </div>

                    }

                    <form

                        onSubmit={handleSubmit}

                    >

                        <label>

                            Email Address

                        </label>

                        <input

                            type="email"

                            name="email"

                            value={formData.email}

                            onChange={handleChange}

                            placeholder="Enter your email"

                            required

                        />

                        <label>

                            Password

                        </label>

                        <div className="password-wrapper">

                            <input

                                type={

                                    showPassword

                                        ? "text"

                                        : "password"

                                }

                                name="password"

                                value={formData.password}

                                onChange={handleChange}

                                placeholder="Enter your password"

                                required

                            />

                            <button

                                type="button"

                                className="show-password"

                                onClick={() =>

                                    setShowPassword(

                                        !showPassword

                                    )

                                }

                            >

                                {

                                    showPassword

                                        ? "🙈"

                                        : "👁"

                                }

                            </button>

                        </div>

                        <div className="login-options">

                            <label>

                                <input

                                    type="checkbox"

                                />

                                Remember Me

                            </label>

                            <span>

                                Forgot Password?

                            </span>

                        </div>

                        <button

                            type="submit"

                            className="login-btn"

                            disabled={loading}

                        >

                            {

                                loading

                                    ? "Logging In..."

                                    : "Login"

                            }

                        </button>

                    </form>

                    <div className="divider">

                        OR

                    </div>

                    <button

                        className="google-btn"

                    >

                        Continue with Google

                    </button>

                    <p className="register-text">

                        Don't have an account?

                    </p>

                    <Link

                        to="/register"

                        className="register-btn"

                    >

                        Register

                    </Link>

                    <small>

                        Secure JWT Authentication

                        & Role-Based Access Control

                    </small>

                </div>

            </div>

        </div>

    );

};

export default Login;