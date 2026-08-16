import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaTimes, FaRobot, FaPaperPlane, FaTrash, FaMinus, FaExpandAlt } from "react-icons/fa";

import { getAICoachContext } from "../../utils/aiCoachContext";
import { sendChatMessage } from "../../services/chatbotService";
import { useAuth } from "../../hooks/useAuth";

const renderFormattedMessage = (content) => {
    if (typeof content !== "string") {
        if (typeof content === "object" && content !== null) {
            content = content.content || content.response || content.message || JSON.stringify(content, null, 2);
        } else {
            content = String(content);
        }
    }

    // Markdown line & bold formatter
    return content.split("\n").map((line, idx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={idx} style={{ marginBottom: "4px", minHeight: "1em" }}>
                {parts.map((part, pIdx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </div>
        );
    });
};

const AICoachWidget = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const messagesEndRef = useRef(null);

    const context = useMemo(
        () => getAICoachContext(location.pathname),
        [location.pathname]
    );

    // Reset private conversation history on authentication change or route change
    useEffect(() => {
        setConversation([]);
        setMessage("");
        setSelectedAgents([]);
        setIsLoading(false);
    }, [isAuthenticated, user?.id, location.pathname]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation, isLoading]);

    const handleClearChat = () => {
        setConversation([]);
        setMessage("");
        setSelectedAgents([]);
    };

    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: "user", content: trimmed };
        const nextConversation = [...conversation, userMsg];
        setConversation(nextConversation);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await sendChatMessage({
                page: location.pathname,
                user_id: isAuthenticated && user ? user.id : null,
                message: trimmed,
                conversation_history: nextConversation.map((c) => ({ role: c.role, content: c.content })),
            });

            const resData = response?.data?.data || response?.data || response;
            let assistantOutput = "";
            let resSelected = [];

            if (typeof resData === "string") {
                assistantOutput = resData;
            } else if (Array.isArray(resData)) {
                resData.forEach((item) => {
                    if (item && item.selected_agents && Array.isArray(item.selected_agents)) {
                        resSelected.push(...item.selected_agents);
                    }
                });
                assistantOutput = resData.map((item) => {
                    if (typeof item === "string") return item;
                    return item.content || item.response || JSON.stringify(item);
                }).join("\n\n");
            } else if (resData && typeof resData === "object") {
                if (resData.selected_agents && Array.isArray(resData.selected_agents)) {
                    resSelected = resData.selected_agents;
                }
                assistantOutput = resData.content || resData.response || resData.message || JSON.stringify(resData);
            } else {
                assistantOutput = "I am ready to help you with your debate practice and strategy. How can I assist you further?";
            }

            setSelectedAgents([...new Set(resSelected)]);

            setConversation((prev) => [
                ...prev,
                { role: "assistant", content: assistantOutput }
            ]);
        } catch (err) {
            console.error("Chat error:", err);
            setConversation((prev) => [
                ...prev,
                { role: "assistant", content: "The AI Debate Assistant is available to help with debate strategy, argument quality, and practice plans. Please try resending your message." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-coach-widget">
            {!isOpen && (
                <button
                    type="button"
                    className="ai-coach-fab"
                    onClick={() => {
                        setIsOpen(true);
                        setIsMinimized(false);
                    }}
                    aria-label="Open AI Debate Assistant"
                >
                    <FaRobot />
                    <span>AI Assistant</span>
                </button>
            )}

            {isOpen && (
                <div className={`ai-coach-panel slide-panel ${isMinimized ? "minimized" : ""}`}>
                    <header
                        className="ai-coach-header"
                        onClick={() => {
                            if (isMinimized) setIsMinimized(false);
                        }}
                    >
                        <div>
                            <h2>{context.title}</h2>
                            <p>{context.description}</p>
                        </div>
                        <div className="ai-coach-header-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="ai-coach-action-btn"
                                onClick={handleClearChat}
                                title="Clear Chat"
                            >
                                <FaTrash />
                            </button>
                            <button
                                type="button"
                                className="ai-coach-action-btn"
                                onClick={() => setIsMinimized(!isMinimized)}
                                title={isMinimized ? "Restore" : "Minimize"}
                            >
                                {isMinimized ? <FaExpandAlt /> : <FaMinus />}
                            </button>
                            <button
                                type="button"
                                className="ai-coach-action-btn"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsMinimized(false);
                                }}
                                title="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </header>

                    {!isMinimized && (
                        <>
                            <div className="ai-coach-sub-header">
                                <div>
                                    <span className="ai-coach-label">Available Agents for this page</span>
                                    <div className="ai-coach-agent-list">
                                        {context.agents.map((agent) => (
                                            <span key={agent} className="ai-coach-agent-pill available">{agent}</span>
                                        ))}
                                    </div>
                                </div>
                                {selectedAgents.length > 0 && (
                                    <div style={{ marginTop: "6px" }}>
                                        <span className="ai-coach-label" style={{ color: "#059669" }}>Selected Agents for Latest Query</span>
                                        <div className="ai-coach-agent-list">
                                            {selectedAgents.map((agent) => (
                                                <span key={agent} className="ai-coach-agent-pill active">{agent}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="ai-coach-prompts">
                                <span className="ai-coach-label">Suggested Prompts</span>
                                <div className="ai-coach-prompt-list">
                                    {context.starterPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            className="ai-coach-prompt"
                                            onClick={() => setMessage(prompt)}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-coach-conversation">
                                {conversation.map((entry, index) => (
                                    <div key={index} className={`ai-coach-bubble ${entry.role}`}>
                                        {renderFormattedMessage(entry.content)}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="ai-coach-bubble assistant ai-coach-loading">
                                        <FaRobot className="spinner" /> AI Coach is formulating response...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="ai-coach-input-area">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask AI Coach about this page..."
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="ai-coach-send-btn"
                                    onClick={handleSend}
                                    disabled={isLoading || !message.trim()}
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AICoachWidget;