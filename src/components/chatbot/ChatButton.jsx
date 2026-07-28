function ChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full shadow-lg text-3xl z-50"
    >
      🤖
    </button>
  );
}

export default ChatButton;