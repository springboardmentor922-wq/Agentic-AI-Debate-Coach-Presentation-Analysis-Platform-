import { useState } from "react";
import api from "../../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm your AI Debate Coach. How can I help you today?"
    }
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const response = await api.post("/chat/message", {
        message
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.reply
        }
      ]);

      setMessage("");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Unable to connect to AI."
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 text-white text-3xl shadow-2xl hover:bg-blue-700 z-50"
      >
        💬
      </button>

      {/* Chat Window */}

      {open && (

        <div className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">

          {/* Header */}

          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">

            <h2 className="font-bold">
              🤖 AI Debate Coach
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-xl"
            >
              ✕
            </button>

          </div>

          {/* Messages */}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`px-4 py-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.content}
                </div>

              </div>

            ))}

            {loading && (
              <p className="text-gray-500">
                AI is typing...
              </p>
            )}

          </div>

          {/* Input */}

          <div className="border-t p-3 flex gap-2">

            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-lg"
            >
              Send
            </button>

          </div>

        </div>

      )}
    </>
  );
}

export default Chatbot;