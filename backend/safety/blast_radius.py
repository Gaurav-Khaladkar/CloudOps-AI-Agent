"""
Blast Radius Assessment & Risk Scoring Engine
"""
from typing import Dict, Any

def evaluate_blast_radius(target_resource: str, service_name: str, action: str) -> Dict[str, Any]:
    """
    Evaluates the blast radius and risk score of a remediation action.
    Risk Score (0 - 100):
      0 - 25: Low (single isolated process, idempotent reload)
      26 - 50: Medium (service restart with quick auto-recovery)
      51 - 75: High (instance reboot, cache flush)
      76 - 100: Critical (multi-node cluster restart, database mutation)
    """
    risk_score = 15
    risk_level = "LOW"
    requires_approval = True
    impact_scope = "Single process replica"

    action_lower = action.lower()
    service_lower = service_name.lower()

    if "database" in service_lower or "postgres" in service_lower or "mysql" in service_lower:
        risk_score += 40
        impact_scope = "Database persistence layer"
    elif "redis" in service_lower or "cache" in service_lower:
        risk_score += 25
        impact_scope = "Shared cache layer"

    if "reboot" in action_lower:
        risk_score += 35
        impact_scope = "Full host VM reboot"
    elif "stop" in action_lower:
        risk_score += 20
    elif "kill" in action_lower:
        risk_score += 15

    # Clamp score
    risk_score = min(max(risk_score, 5), 100)

    if risk_score <= 30:
        risk_level = "LOW"
    elif risk_score <= 60:
        risk_level = "MEDIUM"
    elif risk_score <= 85:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "target_resource": target_resource,
        "service_name": service_name,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "impact_scope": impact_scope,
        "requires_approval": True,  # Default to HITL for safety
        "rollback_guaranteed": True
    }
