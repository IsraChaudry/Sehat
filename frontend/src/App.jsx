import { useState, useCallback } from 'react';
import Header from './components/Header';
import StepProgress from './components/StepProgress';
import AgentStatus from './components/AgentStatus';
import ChatScreen from './components/ChatScreen';
import SummaryScreen from './components/SummaryScreen';
import SlipScreen from './components/SlipScreen';
import EscalationScreen from './components/EscalationScreen';
import AdminLogin from './components/AdminLogin';
import RecordsDashboard from './components/RecordsDashboard';

const WELCOME_MSG = {
  role: 'sehat',
  text: "Assalam o Alaikum! I am SEHAT, your intake assistant. Please describe the patient's complaint, or press the mic button to speak.",
  agent: 'intake',
};

const STEP_MAP = {
  intake: 0,
  triage: 1,
  routing: 2,
};

export default function App() {
  const [screen, setScreen] = useState('chat');
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [agentStep, setAgentStep] = useState(0);
  const [patientData, setPatientData] = useState({});
  const [escalationData, setEscalationData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('sehat_admin_token') || '');
  const [showAdmin, setShowAdmin] = useState(false);

  const speak = useCallback((text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    utter.rate = 0.92;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  }, []);

  const sendMessage = async (text, fromMic = false) => {
    window.speechSynthesis?.cancel(); // stop speaking when user sends
    if (isLoading) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text }]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, language }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      setSessionId(data.session_id);

      // Update step from agent
      const step = STEP_MAP[data.current_agent] ?? agentStep;
      if (data.screen === 'summary' || data.screen === 'slip') setAgentStep(3);
      else if (step > agentStep) setAgentStep(step);

      // Add SEHAT response message to chat and speak it
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'sehat', text: data.response, agent: data.current_agent },
        ]);
        if (fromMic) speak(data.response, data.language || language);
      }

      // Store patient data
      const pd = {
        ...data.patient_data,
        token: data.token_number,
        datetime: new Date().toLocaleString('en-PK'),
      };
      setPatientData(pd);

      // Navigate to correct screen
      if (data.screen === 'escalation') {
        setEscalationData({
          escalation_message: data.escalation_message,
          collected_info: data.collected_info,
          decision_needed: data.decision_needed,
        });
        setScreen('escalation');
      } else if (data.screen === 'summary') {
        setScreen('summary');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'sehat',
          text: 'Connection error. Please check if the backend is running and try again.',
          agent: 'System',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSummary = () => setScreen('slip');

  const resetSession = async () => {
    // Clear backend session
    if (sessionId) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/session/${sessionId}`, { method: 'DELETE' });
      } catch (_) {}
    }
    setScreen('chat');
    setSessionId(null);
    setMessages([{
      ...WELCOME_MSG,
      text: language === 'ur'
        ? 'نیا مریض سیشن شروع ہو گیا۔ براہ کرم شکایت بیان کریں۔'
        : 'New patient session started. Please describe the complaint.',
    }]);
    setAgentStep(0);
    setPatientData({});
    setEscalationData({});
  };

  const handleOverride = () => {
    // Return to chat so the receptionist can provide the missing info.
    // main.py will reset escalation flags on the next message automatically.
    setScreen('chat');
  };

  // Admin screens
  if (showAdmin && !adminToken) {
    return <AdminLogin onLogin={(token) => { setAdminToken(token); }} />;
  }
  if (showAdmin && adminToken) {
    return <RecordsDashboard token={adminToken} onLogout={() => {
      localStorage.removeItem('sehat_admin_token');
      setAdminToken('');
      setShowAdmin(false);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <Header language={language} setLanguage={setLanguage} onAdminClick={() => setShowAdmin(true)} />

      {/* Content area with top padding for fixed header */}
      <div className="flex-1 flex flex-col pt-16">
        {/* Progress UI — only on chat/summary screens */}
        {(screen === 'chat' || screen === 'summary') && (
          <div className="bg-white border-b border-gray-100 shadow-sm no-print">
            <div className="max-w-4xl mx-auto px-4">
              <StepProgress currentStep={agentStep} />
              <AgentStatus currentStep={agentStep} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
          {screen === 'chat' && (
            <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
              <ChatScreen
                messages={messages}
                isLoading={isLoading}
                onSend={sendMessage}
                language={language}
              />
            </div>
          )}

          {screen === 'summary' && (
            <div className="flex-1 overflow-y-auto">
              <SummaryScreen
                patientData={patientData}
                onConfirm={confirmSummary}
                onEdit={() => setScreen('chat')}
                onFieldEdit={(key, value) => setPatientData(prev => ({ ...prev, [key]: value }))}
              />
            </div>
          )}

          {screen === 'slip' && (
            <div className="flex-1 overflow-y-auto">
              <SlipScreen
                patientData={patientData}
                onNewPatient={resetSession}
              />
            </div>
          )}

          {screen === 'escalation' && (
            <div className="flex-1 overflow-y-auto">
              <EscalationScreen
                escalationData={escalationData}
                patientData={patientData}
                onTakeOver={resetSession}
                onOverride={handleOverride}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
