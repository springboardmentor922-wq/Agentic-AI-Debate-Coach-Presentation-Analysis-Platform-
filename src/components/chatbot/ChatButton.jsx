function ChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-violet-600 text-3xl text-white shadow-lg shadow-violet-300/50 hover:bg-violet-700 z-50"
    >
      🤖
    </button>
  );
}

export default ChatButton;
