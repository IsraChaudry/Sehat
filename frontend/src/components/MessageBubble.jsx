const AGENT_LABELS = {
  intake: 'Intake Agent',
  triage: 'Triage Agent',
  routing: 'Routing Agent',
  escalation: 'Escalation Agent',
  System: 'System',
};

export default function MessageBubble({ message }) {
  const isSehat = message.role === 'sehat';
  const agentLabel = AGENT_LABELS[message.agent] || message.agent || 'SEHAT';

  return (
    <div className={`flex fade-in ${isSehat ? 'justify-start' : 'justify-end'} mb-3`}>
      {isSehat && (
        <div className="w-7 h-7 rounded-full bg-[#1D9E75] flex items-center justify-center mr-2 flex-shrink-0 mt-5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[78%] ${isSehat ? '' : ''}`}>
        {isSehat && (
          <div className="text-[10px] text-gray-400 font-medium mb-1 ml-1 uppercase tracking-wide">
            {agentLabel}
          </div>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isSehat
              ? 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
              : 'bg-[#1D9E75] text-white rounded-tr-sm'
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
