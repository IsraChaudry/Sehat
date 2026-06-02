const AGENTS = ['Intake Agent', 'Triage Agent', 'Routing Agent', 'Done'];

export default function AgentStatus({ currentStep }) {
  return (
    <div className="agent-status flex items-center justify-center gap-2 flex-wrap py-2">
      {AGENTS.map((agent, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={agent} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-[#1D9E75] text-white shadow-sm'
                  : done
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              )}
              {agent}
            </div>
            {i < AGENTS.length - 1 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
