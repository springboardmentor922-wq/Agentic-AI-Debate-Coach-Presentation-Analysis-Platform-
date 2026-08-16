import ReactMarkdown from "react-markdown";

function ChatMessage({ sender, text }) {
  return (
    <div
      className={`flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-xl p-3 whitespace-pre-wrap ${
          sender === "user"
            ? "bg-violet-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ChatMessage;
