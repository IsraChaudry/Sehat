const CONFIG = {
  EMERGENCY: {
    bg: 'bg-[#E24B4A]',
    text: 'text-white',
    label: 'EMERGENCY',
    pulse: true,
  },
  URGENT: {
    bg: 'bg-[#EF9F27]',
    text: 'text-white',
    label: 'URGENT',
    pulse: false,
  },
  ROUTINE: {
    bg: 'bg-[#639922]',
    text: 'text-white',
    label: 'ROUTINE',
    pulse: false,
  },
  FOLLOW_UP: {
    bg: 'bg-[#378ADD]',
    text: 'text-white',
    label: 'FOLLOW-UP',
    pulse: false,
  },
};

export default function TriageBadge({ level, size = 'md' }) {
  const config = CONFIG[level] || CONFIG.ROUTINE;
  const sizeClass = size === 'lg' ? 'px-5 py-2 text-sm font-bold' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} ${config.bg} ${config.text} ${
        config.pulse ? 'pulse' : ''
      }`}
    >
      {config.pulse && <span className="w-2 h-2 rounded-full bg-white/80 animate-ping" />}
      {config.label}
    </span>
  );
}
