"""
RAG Runbook Agent
Retrieves matching standard operating procedures (SOPs) using semantic matching.
"""
from typing import Dict, Any
from backend.knowledge_base.runbooks import query_runbooks

class RAGRunbookAgent:
    def __init__(self):
        self.name = "RAG Runbook Agent"

    def retrieve(self, incident_title: str, root_cause: str) -> Dict[str, Any]:
        """
        Retrieves matching SRE runbook based on title and root cause hypothesis.
        """
        search_query = f"{incident_title} {root_cause}"
        result = query_runbooks(search_query)

        runbook = result["runbook"]
        confidence = result["confidence_score"]

        return {
            "agent": self.name,
            "matched_runbook_id": runbook["id"],
            "matched_title": runbook["title"],
            "similarity_score": confidence,
            "recommended_action": runbook["recommended_command"],
            "rollback_plan": runbook["rollback_command"],
            "guidance_summary": runbook["summary"]
        }
