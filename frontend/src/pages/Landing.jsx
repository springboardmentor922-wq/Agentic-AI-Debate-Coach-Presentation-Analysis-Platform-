import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRobot,
  FaChartLine,
  FaUsers,
  FaBrain,
  FaArrowRight,
  FaMicrophoneAlt,
  FaLightbulb,
  FaAward,
} from "react-icons/fa";

import "../styles/landing.css";

function Landing() {
  const features = [
    {
      icon: <FaRobot />,
      title: "AI Debate Coach",
      desc: "Practice debates with intelligent AI and receive instant feedback.",
    },
    {
      icon: <FaChartLine />,
      title: "Performance Analytics",
      desc: "Track your progress with detailed reports and skill graphs.",
    },
    {
      icon: <FaMicrophoneAlt />,
      title: "Presentation Analysis",
      desc: "Upload audio/video and improve your speaking confidence.",
    },
    {
      icon: <FaBrain />,
      title: "Critical Thinking",
      desc: "Strengthen reasoning, logic, and argument construction.",
    },
    {
      icon: <FaUsers />,
      title: "Coach Review",
      desc: "Receive personalized feedback from debate coaches.",
    },
    {
      icon: <FaAward />,
      title: "Skill Tracking",
      desc: "Monitor communication and leadership skills over time.",
    },
  ];

  return (
    <div className="landing">

      {/* NAVBAR */}

      <nav className="landing-navbar">

        <div className="logo">
          🤖 Agentic AI Debate Coach
        </div>

        <div className="nav-buttons">

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Register
          </Link>

        </div>

      </nav>

      {/* HERO */}

      <section className="hero">

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-left"
        >

          <span className="tag">
            AI Powered Debate Platform
          </span>

          <h1>

            Improve Your
            <span> Public Speaking </span>

            with Artificial Intelligence

          </h1>

          <p>

            Practice debates, analyze presentations,
            receive AI-powered feedback,
            and improve your communication skills.

          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Get Started
            </Link>

            <Link to="/login" className="secondary-btn">
              Login
            </Link>

          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="hero-right"
        >

          <div className="hero-card">

            <FaRobot size={80} />

            <h2>AI Debate Coach</h2>

            <p>
              Practice • Analyze • Improve
            </p>

          </div>

        </motion.div>

      </section>

      {/* STATS */}

      <section className="stats">

        <div className="stat-card">
          <h2>1500+</h2>
          <p>Debates Conducted</p>
        </div>

        <div className="stat-card">
          <h2>500+</h2>
          <p>Active Learners</p>
        </div>

        <div className="stat-card">
          <h2>3000+</h2>
          <p>AI Reports</p>
        </div>

        <div className="stat-card">
          <h2>50+</h2>
          <p>Professional Coaches</p>
        </div>

      </section>

      {/* FEATURES */}

      <section className="features">

        <h2>Everything You Need</h2>

        <div className="feature-grid">

          {features.map((feature, index) => (

            <motion.div
              whileHover={{ scale: 1.05 }}
              key={index}
              className="feature-card"
            >

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.desc}</p>

            </motion.div>

          ))}

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="how">

        <h2>How It Works</h2>

        <div className="steps">

          <div className="step">
            <span>1</span>
            Choose Debate Topic
          </div>

          <FaArrowRight />

          <div className="step">
            <span>2</span>
            Debate Session
          </div>

          <FaArrowRight />

          <div className="step">
            <span>3</span>
            AI Analysis
          </div>

          <FaArrowRight />

          <div className="step">
            <span>4</span>
            Improve Skills
          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="cta">

        <h2>

          Ready to become
          a better speaker?

        </h2>

        <Link to="/register" className="primary-btn">

          Start Free Today

        </Link>

      </section>

      <footer>

        © 2026 Agentic AI Debate Coach

      </footer>

    </div>
  );
}

export default Landing;