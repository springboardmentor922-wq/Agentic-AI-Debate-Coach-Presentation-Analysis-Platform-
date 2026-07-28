import { useState } from "react";
import api from "../../services/api";
import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I'm your AI Debate Coach. How can I help you today?",
    },
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const role = localStorage.getItem("role");

const response = await api.post("/chat", {
  message: text,
  role,
  page: window.location.pathname,
});

      const botMessage = {
        sender: "bot",
        text: response.data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry! I couldn't connect to the AI server.",
        },
      ]);
    }
  };

  return (
    <>
      <ChatButton onClick={toggleChat} />

      {isOpen && (
        <ChatWindow
          messages={messages}
          sendMessage={sendMessage}
          onClose={toggleChat}
        />
      )}
    </>
  );
}

export default ChatBot;