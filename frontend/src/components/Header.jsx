export default function Header({ language, setLanguage, onAdminClick }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 leading-tight">SEHAT</div>
            <div className="text-xs text-gray-500 leading-tight hidden sm:block">
              Smart Entry &amp; Healthcare Admission Triage
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">

          {onAdminClick && (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1D9E75] border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#1D9E75]/40 transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Admin
            </button>
          )}

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'en'
                  ? 'bg-white text-[#1D9E75] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ur')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'ur'
                  ? 'bg-white text-[#1D9E75] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              اردو
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
