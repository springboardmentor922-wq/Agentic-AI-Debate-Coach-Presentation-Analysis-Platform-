import { motion } from "framer-motion";
import {
  BrainCircuit,
  Target,
  Trophy,
  BookOpen,
  Shield,
  CheckCircle,
} from "lucide-react";
import TopNav from "../components/TopNav";
import "./styles/Landing.css";

const roles = [
  {
    icon: Target,
    title: "Learner",
    color: "purple",
    desc: "Students and self-learners building debate skills from scratch.",
    features: [
      "Personalized learning roadmap",
      "AI practice debates",
      "Progress tracking dashboard",
      "Skill badge system",
    ],
  },
  {
    icon: Trophy,
    title: "Debate Coach",
    color: "blue",
    popular: true,
    desc: "Professional coaches managing teams and improving competitive performance.",
    features: [
      "Multi-student dashboard",
      "Comparative analytics",
      "Practice scheduling",
      "Performance reports",
      "Session recordings",
    ],
  },
  {
    icon: BookOpen,
    title: "Educator",
    color: "green",
    desc: "Teachers integrating AI-powered debate into classrooms and academic programs.",
    features: [
      "Assignment management",
      "Curriculum integration",
      "Rubric-based evaluation",
      "Classroom analytics",
      "Student portfolios",
    ],
  },
  {
    icon: Shield,
    title: "Administrator",
    color: "orange",
    desc: "Institution-wide management with enterprise security and analytics.",
    features: [
      "Role management",
      "Organization analytics",
      "SSO authentication",
      "Enterprise support",
    ],
  },
];

export default function Landing() {
  const debateFormats = [
    {
      title: "One-on-One Debate",
      icon: "⚖️",
      desc: "Practice structured one-on-one debates with AI evaluation, personalized feedback and performance scoring.",
    },
    {
      title: "AI Debate Simulation",
      icon: "🤖",
      desc: "Debate against an intelligent AI opponent that adapts to your arguments and provides real-time coaching.",
    },
    {
      title: "Oxford Debate",
      icon: "🎓",
      desc: "Follow the traditional Oxford debate format with structured speeches and rebuttal rounds.",
    },
    {
      title: "Public Forum Debate",
      icon: "📝",
      desc: "Develop persuasive speaking skills through audience-focused debates.",
    },
    {
      title: "Policy Debate",
      icon: "📑",
      desc: "Construct policy-driven cases with analytical reasoning and evidence evaluation.",
    },
    {
      title: "Parliamentary Debate",
      icon: "🏛️",
      desc: "Experience collaborative parliamentary debates with multiple speakers and role-based speeches.",
    },
  ];

  return (
    <>
      <TopNav />

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-grid"></div>

        <div className="hero-glow hero-glow-left"></div>
        <div className="hero-glow hero-glow-right"></div>

        <div className="hero-dot dot-1"></div>
        <div className="hero-dot dot-2"></div>
        <div className="hero-dot dot-3"></div>
        <div className="hero-dot dot-4"></div>

        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-badge"
          >
            <BrainCircuit size={18} />
            <span>Powered by Agentic AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-title"
          >
            Master Debate,
            <br />
            <span>Presentation & Communication</span>
            <br />
            with Intelligent AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hero-subtitle"
          >
            AI-powered platform that helps learners, educators and professionals
            improve debate, presentation and communication through intelligent
            AI coaching.
          </motion.p>
        </div>
      </section>

      {/* ================= FORMATS ================= */}

      <section className="formats-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="formats-header"
        >
          <div className="formats-badge">🌍 Supported Debate Formats</div>

          <h2 className="formats-title">
            Learn Through
            <span> Multiple Debate Formats</span>
          </h2>

          <p className="formats-description">
            Progress from beginner-friendly one-on-one debates to advanced
            parliamentary debates. DebateAI provides AI-powered evaluation,
            personalized feedback, logical reasoning analysis and performance
            insights across every supported debate format.
          </p>
        </motion.div>

        <div className="formats-grid">
          {debateFormats.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className="format-card"
            >
              <div className="format-icon">{item.icon}</div>

              <h3>{item.title}</h3>

              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= ROLES ================= */}

      <section className="roles-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="roles-header"
        >
          <div className="roles-badge">👥 Built for Every Role</div>

          <h2 className="roles-title">
            One platform,
            <span> every stakeholder</span>
          </h2>

          <p className="roles-description">
            Whether you're a first-time debater, debate coach, educator or
            institution administrator, DebateAI provides specialized AI tools
            designed specifically for your workflow.
          </p>
        </motion.div>

        <div className="roles-grid">
          {roles.map((role, index) => {
            const Icon = role.icon;

            return (
              <motion.div
                key={index}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className={`role-card ${role.color}`}
              >
                {role.popular && (
                  <div className="popular-tag">MOST POPULAR</div>
                )}

                <div className="role-icon">
                  <Icon size={34} />
                </div>

                <h3>{role.title}</h3>

                <p className="role-desc">{role.desc}</p>

                <ul className="role-features">
                  {role.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
