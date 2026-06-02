export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 fade-in">
      <div className="w-7 h-7 rounded-full bg-[#1D9E75] flex items-center justify-center mr-2 flex-shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="text-xs text-gray-400 ml-2">SEHAT is thinking...</span>
      </div>
    </div>
  );
}
