from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import traceback
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext

# Explicit path so it works regardless of which directory uvicorn is launched from
load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)


# ── Auth setup ──────────────────────────────────────────────────────────────
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer = HTTPBearer()
_JWT_SECRET = os.getenv("JWT_SECRET", "sehat-secret")
_JWT_ALGO = "HS256"
_ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
_ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "Sehat@2026!")


def _make_token() -> str:
    payload = {"sub": _ADMIN_USER, "exp": datetime.utcnow() + timedelta(hours=12)}
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGO)


def _verify_token(creds: HTTPAuthorizationCredentials = Depends(_bearer)):
    try:
        payload = jwt.decode(creds.credentials, _JWT_SECRET, algorithms=[_JWT_ALGO])
        if payload.get("sub") != _ADMIN_USER:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Helpers ──────────────────────────────────────────────────────────────────
def _to_str(val) -> str | None:
    if val is None:
        return None
    if isinstance(val, str):
        return val
    if isinstance(val, dict):
        return "\n".join(f"{k}: {v}" for k, v in val.items())
    return str(val)

from agent.workflow import app as sehat_workflow
from services.database import init_db, save_patient, get_all_records, get_today_count

init_db()

app = FastAPI(title="SEHAT API", description="Smart Entry & Healthcare Admission Triage")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions: dict = {}


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    language: Optional[str] = "en"


class ChatResponse(BaseModel):
    session_id: str
    response: str
    screen: str
    current_agent: str
    triage_level: Optional[str]
    department: Optional[str]
    confidence_score: Optional[float]
    escalate: bool
    escalation_reason: Optional[str]
    escalation_message: Optional[str]
    collected_info: Optional[str]
    decision_needed: Optional[str]
    patient_data: dict
    token_number: int
    missing_fields: list


def _fresh_state(session_id: str, token_number: int) -> dict:
    return {
        "session_id": session_id,
        "messages": [],
        "patient_name": None,
        "patient_age": None,
        "complaint": None,
        "duration": None,
        "severity": None,
        "language": "en",
        "missing_fields": ["patient_name", "patient_age", "complaint", "duration", "severity"],
        "triage_level": None,
        "department": None,
        "confidence_score": 0.0,
        "escalate_to_human": False,
        "escalation_reason": None,
        "escalation_message": None,
        "collected_info": None,
        "decision_needed": None,
        "final_summary": None,
        "action": None,
        "token_number": token_number,
        "attempts": 0,
        "current_agent": "intake",
        "next_response": None,
        "screen": "chat",
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = _fresh_state(session_id, len(sessions) + 1)

    state = sessions[session_id]
    # Sync language from frontend toggle
    if request.language:
        state["language"] = request.language

    # Allow recovery from escalation: user sending new info should re-trigger intake
    if state.get("screen") == "escalation":
        state["escalate_to_human"] = False
        state["escalation_reason"] = None
        state["current_agent"] = "intake"
        state["attempts"] = 0
        state["screen"] = "chat"

    state["messages"].append({"role": "user", "content": request.message})

    result = sehat_workflow.invoke(state)
    sessions[session_id] = result

    # Save to DB when routing completes or escalation triggers
    if result.get("screen") in ("summary", "escalation") and result.get("department") or result.get("escalate_to_human"):
        try:
            save_patient({
                "session_id": session_id,
                "token_number": result.get("token_number"),
                "patient_name": result.get("patient_name"),
                "patient_age": result.get("patient_age"),
                "complaint": result.get("complaint"),
                "duration": result.get("duration"),
                "severity": result.get("severity"),
                "triage_level": result.get("triage_level"),
                "department": result.get("department"),
                "final_summary": result.get("final_summary"),
                "action": result.get("action"),
                "language": result.get("language", "en"),
                "escalated": result.get("escalate_to_human", False),
            })
        except Exception as e:
            print(f"[DB] Save error: {e}")

    return ChatResponse(
        session_id=session_id,
        response=result.get("next_response") or "Processing your request...",
        screen=result.get("screen", "chat"),
        current_agent=result.get("current_agent", "intake"),
        triage_level=result.get("triage_level"),
        department=result.get("department"),
        confidence_score=result.get("confidence_score"),
        escalate=result.get("escalate_to_human", False),
        escalation_reason=result.get("escalation_reason"),
        escalation_message=result.get("escalation_message"),
        collected_info=_to_str(result.get("collected_info")),
        decision_needed=_to_str(result.get("decision_needed")),
        patient_data={
            "name": result.get("patient_name"),
            "age": result.get("patient_age"),
            "complaint": result.get("complaint"),
            "duration": result.get("duration"),
            "severity": result.get("severity"),
            "department": result.get("department"),
            "summary": result.get("final_summary"),
            "triage_level": result.get("triage_level"),
            "action": result.get("action"),
        },
        token_number=result.get("token_number", 1),
        missing_fields=result.get("missing_fields", []),
    )


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/admin/login")
def admin_login(req: LoginRequest):
    if req.username != _ADMIN_USER or req.password != _ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": _make_token(), "token_type": "bearer"}


@app.get("/records")
def records(creds: HTTPAuthorizationCredentials = Depends(_bearer)):
    _verify_token(creds)
    return {"records": get_all_records()}


@app.get("/health")
def health():
    return {
        "status": "SEHAT is running",
        "sessions": len(sessions),
        "patients_today": get_today_count(),
    }




@app.get("/test")
def test_llm():
    """Diagnostic endpoint — tests Groq connectivity."""
    key = os.getenv("GROQ_API_KEY", "")
    if not key or key == "your_groq_api_key_here":
        return {"ok": False, "error": "GROQ_API_KEY not set in .env file"}
    try:
        from services.llm import call_gemini
        result = call_gemini("Reply with exactly: OK", "ping")
        return {"ok": True, "response": result.strip()}
    except Exception as e:
        return {"ok": False, "error": str(e), "type": type(e).__name__, "trace": traceback.format_exc()}


@app.get("/list-models")
def list_models():
    """List all available models for the current API key."""
    key = os.getenv("GEMINI_API_KEY", "")
    if not key or key == "your_gemini_api_key_here":
        return {"error": "GEMINI_API_KEY not set"}
    try:
        from google import genai
        client = genai.Client(api_key=key)
        models = client.models.list()
        names = [m.name for m in models]
        return {"models": names}
    except Exception as e:
        return {"error": str(e), "trace": traceback.format_exc()}


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
    return {"cleared": True}
