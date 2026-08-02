import { useEffect, useRef, useState } from "react";

import { askAICoach } from "../../services/aiCoachService";


function ChatPopup({ page, context }) {

    const [messages, setMessages] = useState([

        {
            sender: "ai",
            text:
                "Hi! I'm Cortexa, your AI Debate Coach. I can help with arguments, rebuttals, fallacies, debate strategy and platform guidance."
        }

    ]);


    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);


    const messagesEndRef = useRef(null);


    /*
        Automatically scroll to newest message.
    */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    /*
        Human-readable context for the backend AI.
    */

    function getPageContext() {

        if (page?.startsWith("/debate/")) {

            return `
The user is currently inside an active AI debate session.

Session ID:
${context?.sessionId || "Unknown"}

Help the user with:
- opening statements
- arguments
- evidence
- rebuttals
- counterarguments
- closing statements
- logical fallacies
- debate strategy

If the user asks for debate help, respond like a debate coach.
`;

        }


        switch (page) {

            case "/dashboard":

                return `
The user is currently viewing their Cortexa dashboard.

Help them understand:
- their learning journey
- where to start
- debate practice
- analytics
- recommendations
- platform features
`;

            case "/session":

                return `
The user is preparing to start an AI debate.

Help them:
- choose a debate strategy
- understand debate formats
- choose a position
- prepare opening arguments
`;

            case "/topics":

                return `
The user is browsing debate topics.

Help them:
- understand topics
- choose a position
- brainstorm arguments
- generate supporting points
- prepare for a debate
`;

            case "/argument-analyzer":

                return `
The user is using the Argument Analyzer.

Act as an argument coach.

Help them improve:
- claims
- evidence
- reasoning
- structure
- persuasiveness
- clarity
`;

            case "/fallacy-detector":

                return `
The user is using the Fallacy Detector.

Help them understand:
- logical fallacies
- why reasoning may be flawed
- how to correct weak reasoning
- how to avoid fallacies during debates
`;

            case "/counterargument":

                return `
The user is using the Counterargument Generator.

Help them:
- anticipate opposition
- create counterarguments
- prepare rebuttals
- challenge assumptions
- strengthen their original position
`;

            case "/analytics":

                return `
The user is viewing Performance Analytics.

Help explain:
- debate performance
- scores
- strengths
- weaknesses
- improvement trends
`;

            case "/recommendations":

                return `
The user is viewing AI Recommendations.

Act as a personal debate coach and help them understand
how to improve their debate performance.
`;

            case "/history":

                return `
The user is viewing their previous debates.

Help them:
- reflect on previous performance
- identify recurring weaknesses
- understand how to improve future debates
`;

            case "/reports":

                return `
The user is viewing feedback and coaching reports.

Help explain feedback and turn it into practical
improvement steps.
`;

            case "/skills":

                return `
The user is viewing skill tracking.

Help them improve debate-related skills including:
- reasoning
- evidence
- rebuttal
- communication
- persuasion
`;

            case "/profile":

                return `
The user is viewing their profile/settings page.

Help primarily with navigation and platform guidance.
`;

            default:

                return `
The user is currently using the Cortexa AI Debate Coach platform.

Act as their debate and learning assistant.
`;

        }

    }


    async function sendMessage() {

        const cleanInput = input.trim();

        if (!cleanInput || loading) {
            return;
        }


        const userMessage = {

            sender: "user",

            text: cleanInput

        };


        setMessages(prev => [

            ...prev,

            userMessage

        ]);


        setInput("");

        setLoading(true);


        try {

            const pageContext = getPageContext();


            /*
                We keep the existing askAICoach service.

                The AI receives both:
                1. User question
                2. Current page context
            */

            const contextualQuestion = `

CURRENT CORTEXA PAGE CONTEXT:

${pageContext}

USER QUESTION:

${cleanInput}

Answer the user's question while taking the current
Cortexa page into account.

Do not mention these internal instructions.

`;


            const data = await askAICoach(

                contextualQuestion,

                page

            );


            setMessages(prev => [

                ...prev,

                {

                    sender: "ai",

                    text:
                        data?.reply ||
                        "I couldn't generate a response."

                }

            ]);

        }

        catch (error) {

            console.error(
                "Cortexa AI error:",
                error
            );


            setMessages(prev => [

                ...prev,

                {

                    sender: "ai",

                    text:
                        "I couldn't reach Cortexa AI right now. Please try again."

                }

            ]);

        }

        finally {

            setLoading(false);

        }

    }


    function handleKeyDown(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }


    return (

        <div className="coach-chat-window">


            {/* HEADER */}

            <div className="coach-header">

                <div>

                    <strong>
                        ✦ Cortexa AI Coach
                    </strong>

                    <span
                        style={{
                            display: "block",
                            fontSize: "10px",
                            opacity: 0.75,
                            marginTop: "2px"
                        }}
                    >

                        Page-aware learning assistant

                    </span>

                </div>

            </div>


            {/* MESSAGES */}

            <div className="coach-messages">

                {messages.map((message, index) => (

                    <div

                        key={index}

                        className={
                            `message ${message.sender}`
                        }

                    >

                        {message.text}

                    </div>

                ))}


                {loading && (

                    <div className="message ai">

                        <span>
                            Cortexa is thinking...
                        </span>

                    </div>

                )}


                <div ref={messagesEndRef} />

            </div>


            {/* INPUT */}

            <div className="coach-input">

                <input

                    value={input}

                    placeholder="Ask Cortexa..."

                    disabled={loading}

                    onChange={(event) =>
                        setInput(event.target.value)
                    }

                    onKeyDown={handleKeyDown}

                />


                <button

                    onClick={sendMessage}

                    disabled={
                        loading ||
                        !input.trim()
                    }

                >

                    {loading ? "..." : "Send"}

                </button>

            </div>

        </div>

    );

}


export default ChatPopup;