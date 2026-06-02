export default function EscalationScreen({ escalationData, patientData, onTakeOver, onOverride }) {
  const message = escalationData?.escalation_message || 'This patient requires immediate human attention.';
  const collected = escalationData?.collected_info || '';
  const decision = escalationData?.decision_needed || 'Please assess this patient and assign a department manually.';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 slide-up">
      {/* Alert banner */}
      <div className="bg-[#E24B4A] rounded-2xl p-5 mb-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-base mb-1">Human Assistance Required</div>
            <p className="text-sm opacity-90 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {/* Collected info */}
      {collected && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Collected Information</p>
          <p className="text-sm text-gray-700 leading-relaxed">{collected}</p>
        </div>
      )}

      {/* Patient data quick view */}
      {patientData && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-4 overflow-hidden">
          {[
            ['Name', patientData.name],
            ['Age', patientData.age ? `${patientData.age} years` : null],
            ['Complaint', patientData.complaint],
            ['Duration', patientData.duration],
          ].filter(([, v]) => v).map(([label, value], i, arr) => (
            <div key={label} className={`flex px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className="text-xs text-gray-400 font-medium w-24">{label}</span>
              <span className="text-sm text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Decision needed */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Decision Required</p>
        <p className="text-sm text-amber-800 font-medium">{decision}</p>
      </div>

      {/* Buttons */}
      <div className="action-buttons flex gap-3">
        <button
          onClick={onOverride}
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
        >
          Override &amp; Continue
        </button>
        <button
          onClick={onTakeOver}
          className="flex-1 py-3 rounded-xl bg-[#E24B4A] text-white font-bold text-sm hover:bg-[#c93f3e] transition shadow-sm active:scale-95"
        >
          Take Over
        </button>
      </div>
    </div>
  );
}
