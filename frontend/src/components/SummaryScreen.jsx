import { useState } from 'react';
import TriageBadge from './TriageBadge';

const FIELD_LABELS = [
  { key: 'name',       label: 'Patient Name' },
  { key: 'age',        label: 'Age',         suffix: ' years' },
  { key: 'complaint',  label: 'Complaint' },
  { key: 'duration',   label: 'Duration' },
  { key: 'severity',   label: 'Severity' },
  { key: 'department', label: 'Department' },
];

export default function SummaryScreen({ patientData, onConfirm, onEdit, onFieldEdit }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const level = patientData?.triage_level;

  const startEdit = (key) => {
    setEditingKey(key);
    setEditValue(String(patientData?.[key] ?? ''));
  };

  const saveEdit = () => {
    if (editingKey) {
      onFieldEdit(editingKey, editValue.trim() || patientData?.[editingKey] || '');
    }
    setEditingKey(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Patient Summary</h2>
        {level && <TriageBadge level={level} size="lg" />}
      </div>

      {patientData?.summary && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{patientData.summary}</p>
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-gray-400 mb-2 px-1">Tap any field to correct it before printing.</p>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-5 overflow-hidden">
        {FIELD_LABELS.map(({ key, label, suffix }, i) => {
          const value = patientData?.[key];
          const isEditing = editingKey === key;

          return (
            <div
              key={key}
              className={`${i < FIELD_LABELS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {isEditing ? (
                <div className="flex items-center px-4 py-2.5 gap-2 bg-green-50">
                  <span className="text-xs text-gray-400 font-medium w-28 flex-shrink-0">{label}</span>
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    className="flex-1 px-2.5 py-1 rounded-lg border-2 border-[#1D9E75] text-sm bg-white focus:outline-none"
                  />
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 rounded-lg bg-[#1D9E75] text-white text-xs font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(key)}
                  className="w-full flex items-center px-4 py-3 gap-2 hover:bg-gray-50 transition text-left group"
                >
                  <span className="text-xs text-gray-400 font-medium w-28 flex-shrink-0">{label}</span>
                  <span className="flex-1 text-sm text-gray-800 font-medium">
                    {value != null && value !== '' ? `${value}${suffix || ''}` : <span className="text-gray-300 italic">—</span>}
                  </span>
                  <span className="text-xs text-gray-300 group-hover:text-[#1D9E75] transition flex items-center gap-1 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="action-buttons flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
        >
          Back to Chat
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
