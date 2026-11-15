"""
Remediation & Blast Radius Agent (HITL Safety Gate)
Ensures zero unapproved or dangerous changes are executed against production resources.
"""
from typing import Dict, Any
from backend.safety.validator import validate_remediation_command
from backend.safety.blast_radius import evaluate_blast_radius

class RemediationAgent:
    def __init__(self):
        self.name = "Remediation & Blast Radius Agent"

    def formulate_plan(self, target_instance: str, service_name: str, proposed_cmd: str, rollback_cmd: str) -> Dict[str, Any]:
        """
        Validates command safety and generates blast radius audit data.
        """
        # Validate primary action
        is_valid, validation_msg = validate_remediation_command(proposed_cmd)

        # Compute blast radius
        blast_info = evaluate_blast_radius(target_instance, service_name, proposed_cmd)

        return {
            "agent": self.name,
            "is_valid": is_valid,
            "security_validation": validation_msg,
            "proposed_command": proposed_cmd,
            "rollback_command": rollback_cmd,
            "risk_score": blast_info["risk_score"],
            "risk_level": blast_info["risk_level"],
            "impact_scope": blast_info["impact_scope"],
            "requires_human_approval": True,
            "status": "AWAITING_HUMAN_APPROVAL" if is_valid else "BLOCKED_BY_SAFETY_GATE"
        }
