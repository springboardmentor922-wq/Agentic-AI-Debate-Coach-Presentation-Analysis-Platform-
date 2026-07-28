import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

function ChatWindow({ messages, sendMessage, onClose }) {
  return (
    <div className="fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-xl shadow-2xl border flex flex-col z-50">

      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <h2 className="font-bold">
          🤖 AI Debate Coach
        </h2>

        <button
          onClick={onClose}
          className="text-xl"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            text={msg.text}
          />
        ))}
      </div>

      {/* Input */}
      <ChatInput sendMessage={sendMessage} />
    </div>
  );
}

export default ChatWindow;