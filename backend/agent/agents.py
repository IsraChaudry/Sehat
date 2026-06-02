import json
import re
import traceback
from agent.state import SEHATState
from agent.prompts import INTAKE_PROMPT, TRIAGE_PROMPT, ROUTING_PROMPT, ESCALATION_PROMPT
from services.llm import call_gemini


def _parse_json(raw: str) -> dict:
    # Strip markdown fences, leading/trailing whitespace, then parse
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    # Sometimes Gemini wraps in extra braces or has trailing commas — try direct first
    return json.loads(cleaned)


def intake_agent(state: SEHATState) -> SEHATState:
    state["current_agent"] = "intake"

    # Build context message with already collected info
    collected_summary = []
    if state.get("patient_name"):
        collected_summary.append(f"Name: {state['patient_name']}")
    if state.get("patient_age"):
        collected_summary.append(f"Age: {state['patient_age']}")
    if state.get("complaint"):
        collected_summary.append(f"Complaint: {state['complaint']}")
    if state.get("duration"):
        collected_summary.append(f"Duration: {state['duration']}")
    if state.get("severity"):
        collected_summary.append(f"Severity: {state['severity']}")

    context = ""
    if collected_summary:
        context = "Already collected: " + ", ".join(collected_summary) + "\n\n"

    # Grab the last question SEHAT asked + the user's reply so the LLM
    # knows which field the answer belongs to (e.g. "um 5" after asking severity ≠ duration)
    last_sehat_question = ""
    last_user_message = ""
    messages = state.get("messages", [])
    for msg in reversed(messages):
        role = msg.get("role", "")
        if not last_user_message and role == "user":
            last_user_message = msg.get("content", "")
        elif last_user_message and role in ("sehat", "assistant"):
            last_sehat_question = msg.get("content", "")
            break

    conversation_snippet = ""
    if last_sehat_question:
        conversation_snippet = f"SEHAT asked: {last_sehat_question}\n"
    conversation_snippet += f"Receptionist says: {last_user_message}"

    user_input = context + conversation_snippet

    try:
        raw = call_gemini(INTAKE_PROMPT, user_input)
        data = _parse_json(raw)

        collected = data.get("collected", {})

        # Always overwrite fields the LLM explicitly collected — allows corrections
        for field in ["patient_name", "patient_age", "complaint", "duration", "severity"]:
            val = collected.get(field)
            if val is not None and str(val).strip() not in ("", "null", "None"):
                state[field] = val

        # Always derive missing_fields from actual state — never trust the LLM's list
        state["missing_fields"] = [
            f for f in ["patient_name", "patient_age", "complaint", "duration", "severity"]
            if not state.get(f)
        ]
        state["language"] = data.get("language", "en")
        state["next_response"] = data.get("response", "Please continue.")
        state["attempts"] = state.get("attempts", 0) + 1

        # Hard-coded emergency keyword check — never trust the LLM alone for this
        _emergency_keywords = [
            "chest pain", "heart attack", "can't breathe", "cannot breathe",
            "not breathing", "unconscious", "unresponsive", "severe bleeding",
            "stroke", "seene mein dard", "sans nahi", "104f", "104 fever",
            "sans nhi", "saans nahi",
        ]
        user_text_lower = last_user_message.lower()
        if data.get("escalate") or any(kw in user_text_lower for kw in _emergency_keywords):
            state["escalate_to_human"] = True
            state["triage_level"] = "EMERGENCY"
            state["escalation_reason"] = "Emergency keywords detected during intake"

        if data.get("complete") or len(state["missing_fields"]) == 0:
            state["current_agent"] = "triage"

    except Exception as e:
        print(f"[INTAKE ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        # Give a language-aware fallback instead of generic error
        if state.get("language") == "ur":
            state["next_response"] = "معذرت، کچھ مسئلہ ہوا۔ برائے کرم مریض کا نام اور تکلیف دوبارہ بتائیں۔"
        else:
            state["next_response"] = "Sorry, there was an issue. Could you please tell me the patient's name and complaint again?"
        state["attempts"] = state.get("attempts", 0) + 1

    return state


def triage_agent(state: SEHATState) -> SEHATState:
    state["current_agent"] = "triage"

    patient_info = (
        f"Patient Name: {state.get('patient_name', 'Unknown')}\n"
        f"Age: {state.get('patient_age', 'Unknown')}\n"
        f"Complaint: {state.get('complaint', 'Unknown')}\n"
        f"Duration: {state.get('duration', 'Unknown')}\n"
        f"Severity: {state.get('severity', 'Unknown')}"
    )

    try:
        raw = call_gemini(TRIAGE_PROMPT, patient_info)
        data = _parse_json(raw)

        state["triage_level"] = data.get("triage_level", "ROUTINE")
        state["confidence_score"] = float(data.get("confidence_score", 0.8))
        state["next_response"] = f"Triage complete: {data.get('reasoning', '')}"

        if data.get("escalate") or state["confidence_score"] < 0.50:
            state["escalate_to_human"] = True
            state["escalation_reason"] = data.get("escalation_reason") or "Low confidence triage"

        if state["triage_level"] == "EMERGENCY":
            state["escalate_to_human"] = True
            state["escalation_reason"] = state["escalation_reason"] or "Emergency triage level"

    except Exception as e:
        print(f"[TRIAGE ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        state["triage_level"] = "ROUTINE"
        state["confidence_score"] = 0.6
        # Only escalate on parse error if we truly lack core info
        if not state.get("complaint"):
            state["escalate_to_human"] = True
            state["escalation_reason"] = "Triage processing error — please review manually"

    return state


def routing_agent(state: SEHATState) -> SEHATState:
    state["current_agent"] = "routing"

    routing_input = (
        f"Patient: {state.get('patient_name', 'Unknown')}, Age {state.get('patient_age', 'Unknown')}\n"
        f"Complaint: {state.get('complaint', 'Unknown')}\n"
        f"Duration: {state.get('duration', 'Unknown')}\n"
        f"Severity: {state.get('severity', 'Unknown')}\n"
        f"Triage Level: {state.get('triage_level', 'ROUTINE')}\n"
        f"Confidence: {state.get('confidence_score', 0.8)}"
    )

    try:
        raw = call_gemini(ROUTING_PROMPT, routing_input)
        data = _parse_json(raw)

        state["department"] = data.get("department") or "General OPD"
        state["final_summary"] = data.get("summary", "Patient processed by SEHAT.")
        state["action"] = data.get("action", "See at next available slot")
        state["screen"] = "summary"
        state["next_response"] = f"Routing complete. Department: {state['department']}"

        if data.get("escalate"):
            state["escalate_to_human"] = True
            state["escalation_reason"] = data.get("escalation_reason")

    except Exception as e:
        print(f"[ROUTING ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        state["final_summary"] = "Unable to generate summary. Please review manually."
        state["action"] = "Manual review required"
        state["screen"] = "summary"

    # Guarantee department is always set before the slip is shown
    if not state.get("department"):
        state["department"] = (
            "Emergency" if state.get("triage_level") == "EMERGENCY" else "General OPD"
        )

    return state


def escalation_agent(state: SEHATState) -> SEHATState:
    state["current_agent"] = "escalation"

    escalation_input = (
        f"Reason for escalation: {state.get('escalation_reason', 'Not specified')}\n"
        f"Patient Name: {state.get('patient_name', 'Unknown')}\n"
        f"Age: {state.get('patient_age', 'Unknown')}\n"
        f"Complaint: {state.get('complaint', 'Unknown')}\n"
        f"Duration: {state.get('duration', 'Unknown')}\n"
        f"Severity: {state.get('severity', 'Unknown')}\n"
        f"Triage Level: {state.get('triage_level', 'Unknown')}\n"
        f"Confidence Score: {state.get('confidence_score', 0.0)}"
    )

    try:
        raw = call_gemini(ESCALATION_PROMPT, escalation_input)
        data = _parse_json(raw)

        state["escalation_message"] = data.get("escalation_message", "This case requires human review.")
        state["collected_info"] = data.get("collected_info", "See patient details above.")
        state["decision_needed"] = data.get("decision_needed", "Please assess and route this patient manually.")
        state["next_response"] = state["escalation_message"]

    except Exception as e:
        print(f"[ESCALATION ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        state["escalation_message"] = (
            f"⚠️ This patient requires immediate human attention.\n"
            f"Reason: {state.get('escalation_reason', 'Emergency or low confidence')}"
        )
        state["collected_info"] = (
            f"Name: {state.get('patient_name', 'Unknown')} | "
            f"Age: {state.get('patient_age', 'Unknown')} | "
            f"Complaint: {state.get('complaint', 'Unknown')}"
        )
        state["decision_needed"] = "Please assess this patient immediately and assign appropriate department."

    state["screen"] = "escalation"
    return state
