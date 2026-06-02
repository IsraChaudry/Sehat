# SEHAT — Smart Entry & Healthcare Admission Triage

AI-powered hospital receptionist assistant built for Rayn Group case study.

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## Tech Stack
- **Backend**: FastAPI + LangGraph + Google Gemini 2.0 Flash
- **Frontend**: React + Vite + Tailwind CSS

## How It Works
1. Receptionist types or speaks a patient complaint
2. **Intake Agent** collects: name, age, complaint, duration, severity
3. **Triage Agent** classifies: EMERGENCY / URGENT / ROUTINE / FOLLOW_UP
4. **Routing Agent** assigns a department and generates a summary
5. A printable patient slip is generated in under 30 seconds

Emergency cases and low-confidence triages are escalated to the human receptionist immediately.

## Test Scenarios
1. `"I have a headache for 2 days, 28 years old female"` → ROUTINE → Neurology
2. `"Chest pain and left arm is numb, 52 year old male"` → EMERGENCY → Escalation
3. `"I don't feel well"` → Intake asks follow-up questions
4. `"My 3 year old has 104F fever since yesterday"` → EMERGENCY → Pediatrics
5. `"میرے پیٹ میں درد ہے کل سے، 35 سال"` → Urdu → URGENT → General OPD
