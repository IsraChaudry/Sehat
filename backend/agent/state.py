from typing import TypedDict, Optional


class SEHATState(TypedDict):
    session_id: str
    messages: list
    patient_name: Optional[str]
    patient_age: Optional[int]
    complaint: Optional[str]
    duration: Optional[str]
    severity: Optional[str]
    language: str
    missing_fields: list
    triage_level: Optional[str]
    department: Optional[str]
    confidence_score: float
    escalate_to_human: bool
    escalation_reason: Optional[str]
    final_summary: Optional[str]
    token_number: int
    attempts: int
    current_agent: str
    next_response: Optional[str]
    screen: str
    action: Optional[str]
    escalation_message: Optional[str]
    collected_info: Optional[str]
    decision_needed: Optional[str]
