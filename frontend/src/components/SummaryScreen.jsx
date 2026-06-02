import TriageBadge from './TriageBadge';

const FIELD_LABELS = [
  { key: 'name',       label: 'Patient Name' },
  { key: 'age',        label: 'Age',         suffix: ' years' },
  { key: 'complaint',  label: 'Complaint' },
  { key: 'duration',   label: 'Duration' },
  { key: 'severity',   label: 'Severity' },
  { key: 'department', label: 'Department' },
];

export default function SummaryScreen({ patientData, onConfirm, onEdit }) {
  const level = patientData?.triage_level;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 slide-up">
      {/* Triage badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Patient Summary</h2>
        {level && <TriageBadge level={level} size="lg" />}
      </div>

      {/* Summary paragraph */}
      {patientData?.summary && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{patientData.summary}</p>
        </div>
      )}

      {/* Info grid */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-5 overflow-hidden">
        {FIELD_LABELS.map(({ key, label, suffix }, i) => {
          const value = patientData?.[key];
          return (
            <div
              key={key}
              className={`flex items-start px-4 py-3 ${i < FIELD_LABELS.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-xs text-gray-400 font-medium w-28 flex-shrink-0 mt-0.5">{label}</span>
              <span className="text-sm text-gray-800 font-medium">
                {value != null ? `${value}${suffix || ''}` : <span className="text-gray-300 italic">—</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="action-buttons flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl border-2 border-[#1D9E75] text-[#1D9E75] font-semibold text-sm hover:bg-[#1D9E75]/5 transition"
        >
          Edit
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#18896a] transition shadow-sm active:scale-95"
        >
          Confirm &amp; Generate Slip
        </button>
      </div>
    </div>
  );
}
