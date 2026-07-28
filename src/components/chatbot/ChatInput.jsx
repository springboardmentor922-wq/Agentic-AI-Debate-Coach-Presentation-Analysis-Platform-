import { useState } from "react";

function ChatInput({ sendMessage }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t flex gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 border rounded-lg p-2"
      />

      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700"
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;