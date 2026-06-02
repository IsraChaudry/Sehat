import { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import MicButton from './MicButton';
import TypingIndicator from './TypingIndicator';

export default function ChatScreen({ messages, isLoading, onSend, language }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    onSend(text);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 py-4 no-print">
        {/* Mic */}
        <div className="flex justify-center mb-3">
          <MicButton
            onTranscript={(text) => onSend(text, true)}
            language={language}
            disabled={isLoading}
          />
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder={language === 'ur' ? 'یہاں شکایت لکھیں...' : 'Or type the complaint here...'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] disabled:opacity-50 transition"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="w-11 h-11 rounded-xl bg-[#1D9E75] flex items-center justify-center hover:bg-[#18896a] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
