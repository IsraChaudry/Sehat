import { useState, useRef, useEffect } from 'react';

export default function MicButton({ onTranscript, language, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);
  const transcriptRef = useRef('');
  const activeRef = useRef(false); // true = user wants mic on; false = manual stop

  useEffect(() => {
    setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => { activeRef.current = false; recRef.current?.stop(); };
  }, []);

  // accumulated = text committed from previous restart cycles
  const createRec = (accumulated = '') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let sessionText = '';
      for (let i = 0; i < e.results.length; i++) {
        sessionText += e.results[i][0].transcript;
      }
      // Combine prior cycles + current session for live display
      const full = accumulated
        ? accumulated + ' ' + sessionText
        : sessionText;
      transcriptRef.current = full;
      setLiveText(full);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        activeRef.current = false;
        setIsRecording(false);
        setLiveText('Allow mic in Chrome address bar ↑');
        transcriptRef.current = '';
      }
      // no-speech / network — onend will restart
    };

    rec.onend = () => {
      if (activeRef.current) {
        // Restart, passing accumulated text so new cycle appends to it
        const next = createRec(transcriptRef.current);
        recRef.current = next;
        try { next.start(); } catch (_) {}
      } else {
        // Manual stop — send full accumulated transcript
        setIsRecording(false);
        setLiveText('');
        const text = transcriptRef.current.trim();
        transcriptRef.current = '';
        if (text) onTranscript(text);
      }
    };

    return rec;
  };

  const start = () => {
    if (disabled || isRecording) return;
    transcriptRef.current = '';
    setLiveText('');
    activeRef.current = true;
    setIsRecording(true);
    const rec = createRec();
    recRef.current = rec;
    rec.start();
  };

  const stop = () => {
    activeRef.current = false;
    recRef.current?.stop();
  };

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2" />
          </svg>
        </div>
        <p className="text-xs text-gray-400">Use Chrome for mic</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        onClick={isRecording ? stop : start}
        disabled={disabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all
          ${isRecording
            ? 'bg-[#E24B4A] pulse-mic scale-110'
            : disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#1D9E75] hover:bg-[#18896a] active:scale-95 shadow-lg'
          }`}
      >
        {isRecording ? (
          <span className="w-5 h-5 rounded-sm bg-white" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {liveText ? (
        <div className="text-xs text-[#1D9E75] italic text-center max-w-xs px-2 fade-in">
          "{liveText}"
        </div>
      ) : (
        <p className="text-xs text-gray-500 font-medium select-none">
          {isRecording ? '● Listening... click to send' : 'Click mic to speak'}
        </p>
      )}
    </div>
  );
}
