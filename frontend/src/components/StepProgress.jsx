const STEPS = ['Intake', 'Triage', 'Routing', 'Complete'];

export default function StepProgress({ currentStep }) {
  return (
    <div className="step-progress flex items-center justify-center gap-0 py-3">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  done
                    ? 'bg-[#1D9E75] text-white'
                    : active
                    ? 'bg-[#1D9E75] text-white ring-4 ring-[#1D9E75]/20'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  done || active ? 'text-[#1D9E75]' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mb-4 mx-1 transition-all ${
                  i < currentStep ? 'bg-[#1D9E75]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
