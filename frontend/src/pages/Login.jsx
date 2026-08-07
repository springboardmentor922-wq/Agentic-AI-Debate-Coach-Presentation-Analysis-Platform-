import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import "./styles/Login.css";

/* ============================= */
/* Portal Data (Backend Same) */
/* ============================= */

const PORTALS = [
  {
    to: "/learner/login",
    title: "Learner",
    subtitle: "Students and self-learners building debate skills from scratch.",
    icon: GraduationCap,
    color: "purple",
  },
  {
    to: "/coach/login",
    title: "Debate Coach",
    subtitle:
      "Professional coaches managing teams and improving competitive performance.",
    icon: Users,
    color: "blue",
    popular: true,
  },
  {
    to: "/educator/login",
    title: "Educator",
    subtitle:
      "Teachers integrating AI-powered debate into classrooms and academic programs.",
    icon: BookOpen,
    color: "green",
  },
  {
    to: "/admin/login",
    title: "Administrator",
    subtitle:
      "Institution-wide management with enterprise security and analytics.",
    icon: ShieldCheck,
    color: "orange",
  },
];

/* ============================= */
/* Login */
/* ============================= */

export default function Login() {
  return (
    <div className="login-page">
      {/* Background */}

      <div className="login-grid"></div>

      <div className="login-glow glow-left"></div>

      <div className="login-glow glow-right"></div>

      <section className="portal-section">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="portal-header"
        >
          <div className="portal-badge">
            <BrainCircuit size={18} />
            <span>Secure Role Authentication</span>
          </div>

          <h1 className="portal-title">
            Choose Your
            <span> Sign In Portal</span>
          </h1>

          <p className="portal-description">
            Select the portal that matches your responsibilities. Every role has
            its own dedicated authentication, permissions and dashboard.
          </p>
        </motion.div>

        {/* Portal Cards */}

        <div className="portal-grid">
          {PORTALS.map((portal, index) => {
            const Icon = portal.icon;

            return (
              <motion.div
                key={portal.to}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                }}
              >
                <Link to={portal.to} className={`portal-card ${portal.color}`}>
                  {portal.popular && (
                    <div className="popular-badge">MOST POPULAR</div>
                  )}

                  <div className="portal-icon">
                    <Icon size={42} />
                  </div>

                  <h3 className="portal-role-title">{portal.title}</h3>

                  <p className="portal-subtitle">{portal.subtitle}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="portal-footer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="portal-footer"
          >
            <p>New to AI Debate Coach?</p>

            <Link to="/register" className="portal-register-link">
              Create a Learner Account
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
