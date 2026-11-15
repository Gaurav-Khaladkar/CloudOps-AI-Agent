"""
CloudOps AI Agent - Master FastAPI Application
Provides RESTful APIs, SSE event streams, and agent swarm coordination.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import time
import os

from backend.config import settings
from backend.simulator.failure_generator import get_scenario, SCENARIOS
from backend.agents.supervisor import SupervisorAgent
from backend.agents.postmortem import PostMortemAgent
from backend.knowledge_base.runbooks import SRE_RUNBOOKS

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Autonomous Multi-Agent SRE & Cloud Operations Platform"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory operational store for incident tracking
ACTIVE_INCIDENTS: Dict[str, Any] = {}
INVESTIGATION_CACHE: Dict[str, Any] = {}
supervisor = SupervisorAgent()
postmortem_agent = PostMortemAgent()

# Request Models
class FailureSimulationRequest(BaseModel):
    scenario: str = "cpu"  # cpu, oom, disk, service

class RemediationApprovalRequest(BaseModel):
    incident_id: str
    approved: bool
    override_command: Optional[str] = None
    operator_notes: Optional[str] = "Approved by SRE on-call engineer"

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
assets_dir = os.path.join(dist_dir, "assets")

@app.get("/")
def root():
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "timestamp": time.time()}

@app.get("/api/runbooks")
def list_runbooks():
    """Returns all available SRE runbooks in knowledge base."""
    return {"runbooks": SRE_RUNBOOKS, "total_count": len(SRE_RUNBOOKS)}

@app.post("/api/simulate-failure")
def simulate_failure(req: FailureSimulationRequest):
    """
    Triggers a synthetic chaos failure scenario and returns incident payload.
    """
    scenario_type = req.scenario.lower()
    if scenario_type not in SCENARIOS:
        raise HTTPException(status_code=400, detail=f"Invalid scenario '{scenario_type}'. Valid: {list(SCENARIOS.keys())}")

    incident = get_scenario(scenario_type)
    inc_id = incident["incident_id"]
    ACTIVE_INCIDENTS[inc_id] = incident

    # Automatically trigger supervisor multi-agent swarm
    investigation = supervisor.run_investigation(incident)
    INVESTIGATION_CACHE[inc_id] = investigation

    return {
        "status": "INCIDENT_TRIGGERED",
        "incident": incident,
        "investigation": investigation
    }

@app.get("/api/incidents")
def list_incidents():
    """Lists all active and historical incidents."""
    return {
        "active_incidents": list(ACTIVE_INCIDENTS.values()),
        "total_active": len(ACTIVE_INCIDENTS)
    }

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    """Fetches details and multi-agent trace for a specific incident."""
    if incident_id not in ACTIVE_INCIDENTS:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    return {
        "incident": ACTIVE_INCIDENTS[incident_id],
        "investigation": INVESTIGATION_CACHE.get(incident_id, None)
    }

@app.post("/api/remediation/approve")
def approve_remediation(req: RemediationApprovalRequest):
    """
    HITL safety endpoint to approve and execute remediation actions.
    """
    inc_id = req.incident_id
    if inc_id not in ACTIVE_INCIDENTS:
        raise HTTPException(status_code=404, detail=f"Incident {inc_id} not found.")

    investigation = INVESTIGATION_CACHE.get(inc_id)
    if not investigation:
        raise HTTPException(status_code=400, detail="No investigation on file for this incident.")

    remedy_pkg = investigation["remediation_package"]
    cmd_to_run = req.override_command if req.override_command else remedy_pkg["proposed_command"]

    if not req.approved:
        return {
            "incident_id": inc_id,
            "status": "REJECTED_BY_OPERATOR",
            "message": "Remediation was rejected. Escalating to senior tier SRE."
        }

    # Simulate execution with post-remediation health check
    time.sleep(0.5)
    execution_result = {
        "executed_command": cmd_to_run,
        "exit_code": 0,
        "stdout": "Unit reloaded and active. Sockets bound successfully.",
        "stderr": "",
        "post_verification_status": "PASSED_HEALTH_PROBE",
        "recovery_time_seconds": 24
    }

    # Generate Post-Mortem Report
    incident = ACTIVE_INCIDENTS[inc_id]
    postmortem_md = postmortem_agent.generate_report(
        incident_data=incident,
        investigation_results={
            "root_cause": investigation["root_cause"],
            "runbook_id": investigation["runbook"]["matched_runbook_id"],
            "similarity_score": investigation["runbook"]["similarity_score"]
        },
        execution_result=execution_result
    )

    # Mark resolved
    incident["status"] = "RESOLVED"
    incident["resolved_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    incident["postmortem"] = postmortem_md

    return {
        "incident_id": inc_id,
        "status": "REMEDIATION_EXECUTED_SUCCESSFULLY",
        "execution": execution_result,
        "postmortem_markdown": postmortem_md
    }

@app.get("/api/postmortem/{incident_id}")
def get_postmortem(incident_id: str):
    """Retrieves generated SRE post-mortem report."""
    if incident_id not in ACTIVE_INCIDENTS:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    incident = ACTIVE_INCIDENTS[incident_id]
    if "postmortem" not in incident:
        raise HTTPException(status_code=400, detail="Incident has not yet completed remediation.")

    return {
        "incident_id": incident_id,
        "postmortem": incident["postmortem"]
    }

# Mount frontend assets and dashboard if built
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
if os.path.exists(dist_dir):
    app.mount("/dashboard", StaticFiles(directory=dist_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
