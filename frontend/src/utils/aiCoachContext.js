const AI_COACH_CONTEXTS = [
    {
        match: (pathname) =>
            pathname.startsWith("/debate-sessions") ||
            pathname.startsWith("/debate-room"),
        title: "Debate Session Coach",
        description:
            "Live debate support for argument quality, rebuttals, and reasoning checks.",
        agents: [
            "Argument Analysis",
            "Counterargument",
            "Fallacy Detection"
        ],
        starterPrompts: [
            "Review my current argument for weaknesses.",
            "Suggest a stronger counterargument.",
            "Flag any logical fallacies in this exchange."
        ]
    },
    {
        match: (pathname) => pathname === "/ai-analysis-report",
        title: "Presentation Analysis Coach",
        description:
            "Speech and presentation feedback for delivery, structure, and clarity.",
        agents: ["Speech Analysis", "Presentation Analysis"],
        starterPrompts: [
            "Summarize the strongest presentation issues.",
            "Help me improve delivery and pacing.",
            "Turn this transcript into speaking feedback."
        ]
    },
    {
        match: (pathname) =>
            pathname.endsWith("/dashboard") ||
            pathname.includes("/dashboard"),
        title: "Performance Dashboard Coach",
        description:
            "Progress tracking, learning insights, and next-step recommendations.",
        agents: ["Performance Analytics", "Recommendation"],
        starterPrompts: [
            "Highlight my biggest performance trends.",
            "Recommend the next practice session.",
            "Explain what to focus on this week."
        ]
    },
    {
        match: (pathname) => pathname === "/topics",
        title: "Topic Strategy Coach",
        description:
            "Topic discovery, framing, and preparation guidance for debate topics.",
        agents: ["Topic Strategy", "Argument Planning"],
        starterPrompts: [
            "Help me choose the best topic angle.",
            "What arguments should I prepare first?",
            "Suggest likely objections to this topic."
        ]
    },
    {
        match: (pathname) => pathname === "/profile",
        title: "Profile Coach",
        description:
            "Personalized coaching suggestions based on your profile and goals.",
        agents: ["Goal Planning", "Coaching Guidance"],
        starterPrompts: [
            "What should I update in my coaching profile?",
            "Suggest goals based on my current progress.",
            "How can I strengthen my debate habits?"
        ]
    }
];

export const getAICoachContext = (pathname = "/") => {
    const matchedContext =
        AI_COACH_CONTEXTS.find((context) => context.match(pathname)) || null;

    return matchedContext || {
        title: "General Debate Coach",
        description:
            "A context-aware assistant for debate strategy, practice, and improvement.",
        agents: ["Debate Strategy", "Practice Guidance"],
        starterPrompts: [
            "Help me get better at debate overall.",
            "What should I work on next?",
            "Give me a quick coaching plan for today."
        ]
    };
};
