const AI_COACH_CONTEXTS = [
    {
        match: (pathname) => pathname === "/login" || pathname === "/register",
        title: "AI Debate Assistant",
        description: "General guidance on platform features, debate practice, and AI analysis.",
        agents: ["General Debate Coach", "Orchestrator Agent"],
        starterPrompts: [
            "What is this platform?",
            "What can the AI Debate Coach do?",
            "How does AI analysis work?",
            "What features are available?"
        ]
    },
    {
        match: (pathname) => pathname.startsWith("/debate-room") || pathname.startsWith("/debate-sessions"),
        title: "Debate Room Assistant",
        description: "Real-time debate assistant for counterarguments, argument strength, and fallacy detection.",
        agents: ["Argument Analysis Agent", "Counterargument Agent", "Logical Fallacy Detection Agent", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "Give me a counterargument.",
            "Check my argument for fallacies.",
            "How can I make this argument stronger?"
        ]
    },
    {
        match: (pathname) => pathname.startsWith("/coach"),
        title: "Coach Management Assistant",
        description: "Assists coaches in monitoring assigned learners, evaluations, and coaching plans.",
        agents: ["Performance Analytics Agent", "Recommendation & Coaching Agent", "Report Generation Agent", "Argument Analysis Agent"],
        starterPrompts: [
            "Which learner needs attention?",
            "Show me learners with weak logical reasoning.",
            "Summarize this learner's recent performance.",
            "How should I coach this learner?"
        ]
    },
    {
        match: (pathname) => pathname.startsWith("/educator"),
        title: "Educator Class Assistant",
        description: "Class batch analytics, cohort trends, and struggling student highlights.",
        agents: ["Class Analytics Agent", "Performance Analytics Agent", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "Which students are struggling?",
            "Which topic has the weakest class performance?",
            "Summarize my class performance.",
            "Which learners need additional practice?"
        ]
    },
    {
        match: (pathname) => pathname.startsWith("/admin") || pathname.startsWith("/users"),
        title: "Platform Admin Assistant",
        description: "Platform health monitoring, role management, and AI system statistics.",
        agents: ["System Analytics Agent", "Role Management Agent", "Orchestrator Agent"],
        starterPrompts: [
            "Show platform statistics.",
            "What is the current system status?",
            "Summarize AI usage."
        ]
    },
    {
        match: (pathname) => pathname === "/reports" || pathname === "/ai-analysis-report",
        title: "AI Analysis Report Coach",
        description: "Deep-dive multi-agent report breakdown, speech delivery, and score factor analysis.",
        agents: ["Performance Analytics Agent", "Report Generation Agent", "Speech Analysis Agent", "Presentation Analysis Agent", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "What were the biggest reasons for my score?",
            "How can I improve my evidence score?",
            "Compare my latest report with my average."
        ]
    },
    {
        match: (pathname) => pathname === "/skills",
        title: "Performance & Skill Tracking",
        description: "Skill breakdown across Communication, Logic, Argumentation, and Confidence.",
        agents: ["Performance Analytics Agent", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "What skill should I improve?",
            "Why is my score decreasing?",
            "Which skill should I improve first?"
        ]
    },
    {
        match: (pathname) => pathname.startsWith("/topics"),
        title: "Topic Strategy Coach",
        description: "Topic discovery, affirmative/negative prep, and argument planning.",
        agents: ["Topic Strategy Agent", "Argument Planning Agent", "Recommendation & Coaching Agent", "Counterargument Agent"],
        starterPrompts: [
            "Give me some debate topics.",
            "What arguments support this topic?",
            "Which format fits this topic?"
        ]
    },
    {
        match: (pathname) => pathname === "/ai-simulation",
        title: "AI Simulation Prep Assistant",
        description: "Prep support for interactive AI debate simulations.",
        agents: ["Topic Strategy Agent", "Argument Analysis Agent", "Counterargument Agent"],
        starterPrompts: [
            "Help me formulate opening arguments for this simulation.",
            "Suggest strong counterarguments for my opponent.",
            "Check my simulation turn for fallacies."
        ]
    },
    {
        match: (pathname) => pathname.endsWith("/dashboard") || pathname.includes("/dashboard"),
        title: "Learner Overview Coach",
        description: "Daily debate overview, skill metrics, and practice recommendations.",
        agents: ["Performance Analytics Agent", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "What should I practice today?",
            "Summarize my recent progress.",
            "What skill should I improve next?"
        ]
    }
];

export const getAICoachContext = (pathname = "/") => {
    const matchedContext = AI_COACH_CONTEXTS.find((context) => context.match(pathname)) || null;

    return matchedContext || {
        title: "General AI Debate Coach",
        description: "A context-aware assistant for debate strategy, practice, and overall improvement.",
        agents: ["General Debate Coach", "Recommendation & Coaching Agent"],
        starterPrompts: [
            "What should I practice today?",
            "Summarize my recent progress.",
            "Give me a quick coaching plan for today."
        ]
    };
};
