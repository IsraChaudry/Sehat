import { useState, useEffect } from 'react';
import TriageBadge from './TriageBadge';

export default function RecordsDashboard({ token, onLogout }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.complaint?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.triage_level?.toLowerCase().includes(q);
  });

  const stats = {
    total: records.length,
    emergency: records.filter(r => r.triage_level === 'EMERGENCY').length,
    urgent: records.filter(r => r.triage_level === 'URGENT').length,
    routine: records.filter(r => r.triage_level === 'ROUTINE' || r.triage_level === 'FOLLOW_UP').length,
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">SEHAT Admin</div>
              <div className="text-xs text-gray-400">Patient Records</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchRecords} className="text-xs text-[#1D9E75] hover:underline font-medium">
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red-200 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Patients', value: stats.total, color: 'text-gray-800' },
            { label: 'Emergency', value: stats.emergency, color: 'text-[#E24B4A]' },
            { label: 'Urgent', value: stats.urgent, color: 'text-[#EF9F27]' },
            { label: 'Routine', value: stats.routine, color: 'text-[#639922]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, complaint..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
            />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} records</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm">Loading records...</div>
        ) : error ? (
          <div className="bg-white rounded-xl p-12 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 text-sm">No patient records found.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Token', 'Name', 'Age', 'Complaint', 'Duration', 'Department', 'Priority', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r, i) => (
                    <tr key={r.id} className={`hover:bg-gray-50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{String(r.token_number || '—').padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {r.patient_name || <span className="text-gray-300 italic">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.patient_age ? `${r.patient_age}y` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{r.complaint || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.duration || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.department || '—'}</td>
                      <td className="px-4 py-3">
                        {r.triage_level ? <TriageBadge level={r.triage_level} /> : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {r.created_at ? r.created_at.split(' ')[0] : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
