import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import { sendMessage } from "../../services/chatService";
import "../../styles/chatbot.css";

function AIChatbot() {
    
    
    const location = useLocation();

    const [open, setOpen] = useState(false);
    
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I'm your AI Debate Coach. Ask me anything about debates, speeches, logical fallacies, or public speaking."
        }
    ]);

    const send = async () => {

        if (!message.trim()) return;

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: userMessage
            }
        ]);

        setMessage("");

        try {

            const response = await sendMessage(
    userMessage,
    location.pathname,
    localStorage.getItem("currentTopic") || ""
);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: response.data.response
                }
            ]);

        } catch (err) {

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "AI Coach is currently unavailable."
                }
            ]);

        }

    };

    return (

        <>

            <button
                className="chatbot-button"
                onClick={() => setOpen(!open)}
            >
                {open ? <FaTimes /> : <FaRobot />}
            </button>

            {open && (

                <div className="chatbot-window">

                    <div className="chatbot-header">

                        🤖 AI Debate Coach

                    </div>

                    <div className="chatbot-body">

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={
                                    msg.sender === "user"
                                        ? "user-msg"
                                        : "ai-msg"
                                }
                            >

                                {msg.text}

                            </div>

                        ))}

                    </div>

                    <div className="chatbot-footer">

                        <input
                            value={message}
                            onChange={(e)=>setMessage(e.target.value)}
                            placeholder="Ask your AI Coach..."
                        />

                        <button onClick={send}>

                            <FaPaperPlane />

                        </button>

                    </div>

                </div>

            )}

        </>

    );

}

export default AIChatbot;