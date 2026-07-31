import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI Debate & Speech Coach. Ask me about opening statements, logical fallacies, rebuttal strategies, or argument scoring!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: "ai",
          text: "Hello! I'm your AI Debate & Speech Coach. Ask me about opening statements, logical fallacies, rebuttal strategies, or argument scoring!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setInputMessage("");
    }, 300); // Wait for transition
  };

  const generateFallbackReply = (prompt) => {
    return "Oops! I couldn't reach the AI server. Please make sure the backend server is running.";
  };

  const handleSend = async (textOverride) => {
    const message = textOverride || inputMessage.trim();
    if (!message) return;

    if (!textOverride) setInputMessage("");

    const newMsg = {
      id: Date.now(),
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const currentUser = localStorage.getItem("username") || "Learner";
      const response = await fetch(`${API_BASE_URL}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser,
          message: message,
          context: "floating_widget"
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data && data.reply) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "ai",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "ai",
          text: generateFallbackReply(message),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.warn("Backend chat unavailable, using local coach generator.", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "ai",
        text: generateFallbackReply(message),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const formatText = (text) => {
    return text.replace(/✔/g, '✅').split('\n').map((item, idx) => (
      <React.Fragment key={idx}>
        {item}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <>
      <button 
        className="chatbot-float-btn"
        title="AI Debate Coach Assistant"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot size={28} /><span className="chatbot-badge"></span>
      </button>

      <div className={`chatbot-modal ${isOpen ? 'active' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar"><Bot size={20} color="white" /></div>
            <div className="chatbot-header-text">
              <h4>AI Debate Coach</h4>
              <span>Online • Instant Guidance</span>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="chatbot-body" ref={chatBodyRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg ${msg.sender}`}>
              {formatText(msg.text)}
              <div className="chatbot-msg-time">{msg.time}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chatbot-msg ai" style={{ fontStyle: 'italic', opacity: 0.7 }}>
              AI Debate Coach is analyzing...
            </div>
          )}
        </div>

        <div className="chatbot-footer">
          <input 
            type="text" 
            className="chatbot-input" 
            placeholder="Ask AI Debate Coach..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chatbot-send-btn" onClick={() => handleSend()}>➔</button>
        </div>
      </div>
    </>
  );
};
