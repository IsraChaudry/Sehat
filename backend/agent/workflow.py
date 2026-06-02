from langgraph.graph import StateGraph, END
from agent.state import SEHATState
from agent.agents import intake_agent, triage_agent, routing_agent, escalation_agent


def intake_router(state: SEHATState) -> str:
    if state.get("escalate_to_human"):
        return "escalation"
    if state.get("attempts", 0) >= 10:
        return "triage"
    if len(state.get("missing_fields", [])) == 0:
        return "triage"
    if state.get("current_agent") == "triage":
        return "triage"
    return "intake"


def triage_router(state: SEHATState) -> str:
    if state.get("escalate_to_human"):
        return "escalation"
    return "routing"


workflow = StateGraph(SEHATState)

workflow.add_node("intake", intake_agent)
workflow.add_node("triage", triage_agent)
workflow.add_node("routing", routing_agent)
workflow.add_node("escalation", escalation_agent)

workflow.set_entry_point("intake")

workflow.add_conditional_edges("intake", intake_router, {
    "intake": END,
    "triage": "triage",
    "escalation": "escalation",
})

workflow.add_conditional_edges("triage", triage_router, {
    "routing": "routing",
    "escalation": "escalation",
})

workflow.add_edge("routing", END)
workflow.add_edge("escalation", END)

app = workflow.compile()
