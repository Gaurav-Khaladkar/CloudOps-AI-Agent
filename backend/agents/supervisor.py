"""
Supervisor / Coordinator Agent
Orchestrates the multi-agent incident investigation workflow with Gemini reasoning.
"""
from typing import Dict, Any, List
import time
from backend.agents.metrics_agent import MetricsAgent
from backend.agents.log_diagnostics import LogDiagnosticsAgent
from backend.agents.rag_runbooks import RAGRunbookAgent
from backend.agents.remediation_gate import RemediationAgent
from backend.agents.postmortem import PostMortemAgent
from backend.services.gemini_service import GeminiService

class SupervisorAgent:
    def __init__(self):
        self.name = "Supervisor Coordinator Agent"
        self.metrics_agent = MetricsAgent()
        self.log_agent = LogDiagnosticsAgent()
        self.rag_agent = RAGRunbookAgent()
        self.remediation_agent = RemediationAgent()
        self.postmortem_agent = PostMortemAgent()
        self.gemini_service = GeminiService()

    def run_investigation(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates the multi-agent swarm to investigate an incident.
        Returns full investigation trace and proposed remediation package.
        """
        trace: List[Dict[str, Any]] = []
        start_time = time.time()

        # Step 1: Supervisor initializes incident
        trace.append({
            "step": 1,
            "agent": self.name,
            "action": "DECOMPOSE_INCIDENT",
            "message": f"Received incident {incident['incident_id']} on {incident['target_instance']}. Dispatching to swarm."
        })

        # Step 2: Metrics Agent evaluates telemetry
        telemetry = incident.get("telemetry", {})
        metrics_res = self.metrics_agent.analyze(telemetry)
        trace.append({
            "step": 2,
            "agent": self.metrics_agent.name,
            "action": "ANALYZE_METRICS",
            "message": f"Metrics analysis complete: {metrics_res['metrics_summary']}. Status: {metrics_res['status']}."
        })

        # Step 3: Log Diagnostics Agent extracts root causes
        logs = incident.get("logs", [])
        logs_res = self.log_agent.analyze(logs)
        trace.append({
            "step": 3,
            "agent": self.log_agent.name,
            "action": "PARSE_DIAGNOSTICS",
            "message": f"Diagnostics parsed: {logs_res['errors_extracted']} errors isolated."
        })

        # Step 4: Gemini AI Root Cause Reasoning & Synthesis
        gemini_rca = self.gemini_service.analyze_incident_rca(incident, telemetry, logs)
        root_cause = gemini_rca["root_cause_hypothesis"]
        trace.append({
            "step": 4,
            "agent": "Google Gemini 2.5 Flash",
            "action": "SYNTHESIZE_RCA",
            "message": f"Root Cause Isolated (Confidence: {gemini_rca.get('confidence_score', 0.95)}): {root_cause}."
        })

        # Step 5: RAG Runbook Agent queries knowledge base
        rag_res = self.rag_agent.retrieve(incident.get("title", ""), root_cause)
        trace.append({
            "step": 5,
            "agent": self.rag_agent.name,
            "action": "RETRIEVE_RUNBOOK",
            "message": f"Matched {rag_res['matched_runbook_id']} ({rag_res['matched_title']}) with confidence {rag_res['similarity_score']}."
        })

        # Step 6: Remediation Gate calculates blast radius & enforces HITL
        proposed_cmd = gemini_rca.get("suggested_remediation_command") or rag_res["recommended_action"]
        rollback_cmd = gemini_rca.get("rollback_command") or rag_res["rollback_plan"]

        remedy_plan = self.remediation_agent.formulate_plan(
            target_instance=incident["target_instance"],
            service_name=incident["service_name"],
            proposed_cmd=proposed_cmd,
            rollback_cmd=rollback_cmd
        )
        trace.append({
            "step": 6,
            "agent": self.remediation_agent.name,
            "action": "SAFETY_VALIDATION",
            "message": f"Command security validated. Risk Score: {remedy_plan['risk_score']} ({remedy_plan['risk_level']}). Awaiting SRE approval."
        })

        elapsed = round(time.time() - start_time, 2)

        return {
            "incident_id": incident["incident_id"],
            "elapsed_seconds": elapsed,
            "root_cause": root_cause,
            "gemini_rca": gemini_rca,
            "investigation_trace": trace,
            "metrics_analysis": metrics_res,
            "runbook": rag_res,
            "remediation_package": remedy_plan
        }
