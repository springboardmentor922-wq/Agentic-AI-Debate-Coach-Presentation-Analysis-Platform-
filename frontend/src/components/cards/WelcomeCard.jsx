import "./DashboardCards.css";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, TrendingUp } from "lucide-react";

const WelcomeCard = ({ user }) => {
    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    return (
        <motion.div
            className="welcome-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="welcome-left">

                <span className="welcome-badge">
                    <Sparkles size={16} />
                    AI Debate Coach
                </span>

                <h1>
                    {greeting},{" "}
                    <span>
                        {user?.full_name || "Learner"}
                    </span>
                    👋
                </h1>

                <p>
                    Continue sharpening your communication,
                    argument building and presentation skills.
                    Your AI coach is ready to help you improve.
                </p>

                <div className="welcome-stats">

                    <div className="mini-stat">
                        <BrainCircuit size={18} />
                        <div>
                            <strong>12</strong>
                            <span>Practice Sessions</span>
                        </div>
                    </div>

                    <div className="mini-stat">
                        <TrendingUp size={18} />
                        <div>
                            <strong>82%</strong>
                            <span>Weekly Progress</span>
                        </div>
                    </div>

                </div>

            </div>

            <div className="welcome-right">

                <div className="ai-circle">
                    🤖
                </div>

            </div>

        </motion.div>
    );
};

export default WelcomeCard;