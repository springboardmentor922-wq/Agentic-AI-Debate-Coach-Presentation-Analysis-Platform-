import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaTimes, FaRobot, FaPaperPlane } from "react-icons/fa";

import { getAICoachContext } from "../../utils/aiCoachContext";
import { sendChatMessage } from "../../services/chatbotService";
import { useAuth } from "../../context/AuthContext";

import "./AICoachWidget.css";

const renderBackendValue = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(renderBackendValue).join("\n");
    }

    if (typeof value === "object") {
        if ("content" in value) {
            return renderBackendValue(value.content);
        }

        if ("message" in value) {
            return renderBackendValue(value.message);
        }

        if ("text" in value) {
            return renderBackendValue(value.text);
        }

        if ("output" in value) {
            return renderBackendValue(value.output);
        }

        return JSON.stringify(value, null, 2);
    }

    return String(value);
};

const getAssistantOutputs = (payload) => {
    const responseBody = payload?.data ?? payload;

    if (Array.isArray(responseBody)) {
        return responseBody;
    }

    if (Array.isArray(responseBody?.messages)) {
        return responseBody.messages;
    }

    if (Array.isArray(responseBody?.responses)) {
        return responseBody.responses;
    }

    if (Array.isArray(responseBody?.outputs)) {
        return responseBody.outputs;
    }

    if (Array.isArray(responseBody?.agents)) {
        return responseBody.agents;
    }

    if (responseBody?.data !== undefined && responseBody?.data !== null) {
        return getAssistantOutputs(responseBody.data);
    }

    return [responseBody];
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to reach the AI chat service."
    );
};

const getRouteContext = (pathname, state) => {
    const sessionIdFromPath = pathname.match(/\/debate-room\/(\d+)/)?.[1]
        || pathname.match(/\/debate-sessions\/(\d+)$/)?.[1]
        || null;

    const topicIdFromPath = pathname.match(/\/debate-sessions\/topic\/(\d+)/)?.[1]
        || null;

    const selectedSessionId = state?.selectedSession?.id ?? state?.selectedSession?.session_id ?? null;
    const selectedTopicId = state?.selectedTopic?.id ?? state?.selectedTopic?.topic_id ?? null;

    return {
        page: pathname,
        session_id: selectedSessionId ?? sessionIdFromPath,
        topic_id: selectedTopicId ?? topicIdFromPath,
    };
};

const AICoachWidget = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const context = useMemo(
        () => getAICoachContext(location.pathname),
        [location.pathname]
    );

    const routeContext = useMemo(
        () => getRouteContext(location.pathname, location.state),
        [location.pathname, location.state]
    );

    useEffect(() => {
        setConversation([]);
        setMessage("");
        setIsLoading(false);
        setErrorMessage("");
    }, [routeContext.page, routeContext.session_id, routeContext.topic_id]);

    const buildConversationHistory = (entries) => {
        return entries
            .filter((entry) => entry.role === "user" || entry.role === "assistant")
            .map((entry) => ({
                role: entry.role,
                content: entry.content,
            }));
    };

    const handleSend = async () => {
        const trimmed = message.trim();

        if (!trimmed || isLoading) {
            return;
        }

        const userEntry = {
            role: "user",
            content: trimmed,
        };

        const nextConversation = [...conversation, userEntry];

        setConversation(nextConversation);
        setMessage("");
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await sendChatMessage({
                page: routeContext.page,
                session_id: routeContext.session_id,
                topic_id: routeContext.topic_id,
                user_id: user?.id ?? null,
                message: trimmed,
                conversation_history: buildConversationHistory(nextConversation),
            });

            const outputs = getAssistantOutputs(response.data);
            const assistantEntries = outputs.map((output) => ({
                role: "assistant",
                content: renderBackendValue(output),
                raw: output,
            }));

            setConversation((currentConversation) => [
                ...currentConversation,
                ...assistantEntries,
            ]);
        } catch (error) {
            const messageText = getErrorMessage(error);

            setErrorMessage(messageText);
            setConversation((currentConversation) => [
                ...currentConversation,
                {
                    role: "error",
                    content: messageText,
                    raw: error?.response?.data ?? null,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = isLoading || !message.trim();

    return (
        <div className="ai-coach-widget">
            {isOpen && (
                <section className="ai-coach-panel" aria-label="AI Debate Coach">
                    <header className="ai-coach-header">
                        <div>
                            <span className="ai-coach-eyebrow">AI Debate Coach</span>
                            <h2>{context.title}</h2>
                            <p>{context.description}</p>
                        </div>
                        <button
                            type="button"
                            className="ai-coach-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close AI Debate Coach"
                        >
                            <FaTimes />
                        </button>
                    </header>

                    <div className="ai-coach-agent-group">
                        <span className="ai-coach-label">Active agents</span>
                        <div className="ai-coach-agent-list">
                            {context.agents.map((agent) => (
                                <span key={agent} className="ai-coach-agent-pill">
                                    {agent}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="ai-coach-prompts">
                        <span className="ai-coach-label">Quick prompts</span>
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

                    <div className="ai-coach-conversation" aria-live="polite">
                        {conversation.map((entry, index) => (
                            <div
                                key={`${entry.role}-${index}`}
                                className={`ai-coach-bubble ${entry.role}`}
                            >
                                {renderBackendValue(entry.content)}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="ai-coach-bubble assistant ai-coach-loading">
                                Thinking...
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="ai-coach-error" role="alert">
                            {errorMessage}
                        </div>
                    )}

                    <div className="ai-coach-input-row">
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            disabled={isLoading}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSend();
                                }
                            }}
                            placeholder="Ask the coach about this page..."
                            aria-label="Ask the AI Debate Coach"
                        />
                        <button
                            type="button"
                            className="ai-coach-send"
                            onClick={handleSend}
                            aria-label="Send message to AI Debate Coach"
                            disabled={isSubmitDisabled}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </section>
            )}

            <button
                type="button"
                className="ai-coach-fab"
                onClick={() => setIsOpen((currentState) => !currentState)}
                aria-label="Open AI Debate Coach"
                aria-expanded={isOpen}
            >
                <FaRobot />
                <span>AI Coach</span>
            </button>
        </div>
    );
};

export default AICoachWidget;