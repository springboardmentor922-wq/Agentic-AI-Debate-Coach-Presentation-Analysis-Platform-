import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

function Sidebar({ user }) {
    const role = user?.role || "Learner";
    const location = useLocation();

    const navigationRef = useRef(null);
    const scrollPositionRef = useRef(0);

    const learnerLinks = [
        {
            section: "LEARN",
            links: [
                { path: "/dashboard", icon: "⌂", label: "Dashboard" },
                { path: "/history", icon: "♜", label: "My Debates" },
                { path: "/session", icon: "◉", label: "AI Debate Simulation" },
                { path: "/topics", icon: "▣", label: "Practice Topics" },
                { path: "/argument-analyzer", icon: "▤", label: "Argument Analyzer" },
                { path: "/fallacy-detector", icon: "△", label: "Fallacy Detector" },
                { path: "/counterargument", icon: "◌", label: "Counterargument Generator" }
            ]
        },
        {
            section: "ANALYZE",
            links: [
                { path: "/presentation-analysis", icon: "▧", label: "Presentation Analysis" },
                { path: "/analytics", icon: "▥", label: "Performance Scores" }
            ]
        },
        {
            section: "IMPROVE",
            links: [
                { path: "/reports", icon: "◍", label: "Feedback & Coaching" },
                { path: "/recommendations", icon: "☆", label: "Recommended For You" }
            ]
        },
        {
            section: "RESOURCES",
            links: [
                { path: "/resources", icon: "▤", label: "Learning Resources" },
                { path: "/notes", icon: "▧", label: "My Notes" }
            ]
        },
        {
            section: "OTHER",
            links: [
                { path: "/notifications", icon: "♧", label: "Notifications" },
                { path: "/profile", icon: "⚙", label: "Settings" }
            ]
        }
    ];

    const coachLinks = [

        {
            section: "COACHING",
            links: [
                { path: "/dashboard", icon: "⌂", label: "Dashboard" },
                { path: "/learners", icon: "👨‍🎓", label: "Learners" },
                { path: "/session", icon: "🎤", label: "Debate Sessions" },
                { path: "/evaluation-queue", icon: "📋", label: "Evaluation Queue" },
                { path: "/argument-reviews", icon: "📝", label: "Argument Reviews" },
                { path: "/fallacy-reports", icon: "⚠️", label: "Fallacy Reports" },
                { path: "/presentation-reviews", icon: "🎥", label: "Presentation Reviews" }
            ]
        },

        {
            section: "ANALYTICS",
            links: [
                { path: "/analytics", icon: "📊", label: "Performance Analytics" },
                { path: "/reports", icon: "📈", label: "Reports" },
                { path: "/skill-gap", icon: "🎯", label: "Skill Gap Analysis" },
                { path: "/coaching-plans", icon: "🤖", label: "AI Coaching Plans" }
            ]
        },

        {
            section: "COMMUNICATION",
            links: [
                { path: "/messages", icon: "💬", label: "Messages" },
                { path: "/profile", icon: "⚙️", label: "Settings" }
            ]
        }

    ];

    const educatorLinks = [

        {
            section: "ACADEMICS",
            links: [
                { path: "/dashboard", icon: "⌂", label: "Dashboard" },
                { path: "/classes", icon: "🏫", label: "Classes" },
                { path: "/learners", icon: "👨‍🎓", label: "Learners" },
                { path: "/assignments", icon: "📚", label: "Assignments" },
                { path: "/session", icon: "🎤", label: "Debate Sessions" }
            ]
        },

        {
            section: "ANALYTICS",
            links: [
                { path: "/analytics", icon: "📊", label: "Class Analytics" },
                { path: "/reports", icon: "📈", label: "Performance Reports" },
                { path: "/presentation-reports", icon: "🎥", label: "Presentation Reports" },
                { path: "/rubrics", icon: "📑", label: "Rubrics" }
            ]
        },

        {
            section: "COMMUNICATION",
            links: [
                { path: "/announcements", icon: "📢", label: "Announcements" },
                { path: "/messages", icon: "💬", label: "Messages" },
                { path: "/profile", icon: "⚙️", label: "Settings" }
            ]
        }

    ];

    const adminLinks = [

        {
            section: "PLATFORM",
            links: [
                { path: "/dashboard", icon: "⌂", label: "Dashboard" },
                { path: "/users", icon: "👥", label: "User Management" },
                { path: "/roles", icon: "🛡️", label: "Roles & Permissions" },
                { path: "/analytics", icon: "📊", label: "System Analytics" },
                { path: "/session", icon: "🎤", label: "Debate Sessions" }
            ]
        },

        {
            section: "AI & CONTENT",
            links: [
                { path: "/ai-services", icon: "🤖", label: "AI Services" },
                { path: "/content", icon: "📄", label: "Content Management" },
                { path: "/reports", icon: "📈", label: "Reports & Logs" }
            ]
        },

        {
            section: "SYSTEM",
            links: [
                { path: "/settings", icon: "⚙️", label: "System Settings" },
                { path: "/security", icon: "🔒", label: "Security" },
                { path: "/integrations", icon: "🔗", label: "Integrations" },
                { path: "/profile", icon: "👤", label: "Profile" }
            ]
        }

    ];

    function getLinks() {
        const normalizedRole = role.toLowerCase();

        if (normalizedRole === "admin") return adminLinks;
        if (normalizedRole === "coach") return coachLinks;
        if (normalizedRole === "educator") return educatorLinks;

        return learnerLinks;
    }

    const sections = getLinks();

    /*
        Keep sidebar navigation at the same scroll position
        when the route/page changes.
    */
    useEffect(() => {
        const navigation = navigationRef.current;

        if (!navigation) return;

        requestAnimationFrame(() => {
            navigation.scrollTop = scrollPositionRef.current;
        });
    }, [location.pathname]);

    function rememberScrollPosition() {
        const navigation = navigationRef.current;

        if (!navigation) return;

        scrollPositionRef.current = navigation.scrollTop;
    }

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">

                <div className="brand-icon">
                    ◇
                </div>

                <div>
                    <h2>Debate Coach</h2>

                    <span>
                        AI-Powered Debate & Analysis
                    </span>
                </div>

            </div>

            <div className="sidebar-divider" />

            <nav
                ref={navigationRef}
                className="sidebar-navigation"
                onScroll={rememberScrollPosition}
            >

                {sections.map((section) => (

                    <div
                        className="sidebar-section"
                        key={section.section}
                    >

                        <p className="sidebar-section-title">
                            {section.section}
                        </p>

                        {section.links.map((link) => (

                            <NavLink
                                key={link.path + link.label}
                                to={link.path}
                                preventScrollReset={true}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >

                                <span className="sidebar-link-icon">
                                    {link.icon}
                                </span>

                                <span className="sidebar-link-label">
                                    {link.label}
                                </span>

                            </NavLink>

                        ))}

                    </div>

                ))}

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-ai-card">

                    <div className="sidebar-ai-icon">
                        ✦
                    </div>

                    <div>
                        <strong>
                            Cortexa AI
                        </strong>

                        <p>
                            Your personal debate coach
                        </p>
                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;