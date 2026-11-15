"""
Automated Test Suite for CloudOps AI Agent
Tests safety validators, blast radius engine, agent swarm, and chaos scenarios.
"""
import pytest
from backend.safety.validator import validate_remediation_command, FORBIDDEN_PATTERNS
from backend.safety.blast_radius import evaluate_blast_radius
from backend.simulator.failure_generator import get_scenario, SCENARIOS
from backend.agents.supervisor import SupervisorAgent
from backend.knowledge_base.runbooks import query_runbooks

def test_command_validator_blocks_dangerous_commands():
    dangerous_commands = [
        "rm -rf /",
        "rm -rf /var/lib/mysql",
        "dd if=/dev/zero of=/dev/sda",
        "mkfs.ext4 /dev/nvme0n1",
        "reboot -f",
        "DROP DATABASE production;",
        "iptables -F"
    ]
    for cmd in dangerous_commands:
        is_valid, msg = validate_remediation_command(cmd)
        assert not is_valid, f"Expected '{cmd}' to be blocked, but it passed!"
        assert "SECURITY VIOLATION" in msg or "does not match" in msg

def test_command_validator_allows_safe_commands():
    safe_commands = [
        "systemctl restart worker-service",
        "systemctl reload nginx",
        "kill -15 14922",
        "journalctl --vacuum-size=500M",
        "truncate -s 0 /var/log/nginx/access.log",
        "redis-cli config set maxmemory 14gb"
    ]
    for cmd in safe_commands:
        is_valid, msg = validate_remediation_command(cmd)
        assert is_valid, f"Expected '{cmd}' to be valid, but got: {msg}"

def test_blast_radius_evaluation():
    # Database should yield higher risk score
    db_res = evaluate_blast_radius("i-db-01", "postgresql", "systemctl restart postgresql")
    assert db_res["risk_score"] >= 50
    assert db_res["impact_scope"] == "Database persistence layer"

    # Worker process should yield lower risk score
    worker_res = evaluate_blast_radius("i-worker-01", "worker-service", "systemctl restart worker-service")
    assert worker_res["risk_score"] < 50
    assert worker_res["risk_level"] in ["LOW", "MEDIUM"]

def test_failure_scenarios_exist():
    for key in ["cpu", "oom", "disk", "service"]:
        scenario = get_scenario(key)
        assert "incident_id" in scenario
        assert "telemetry" in scenario
        assert len(scenario["logs"]) > 0

def test_runbook_retrieval():
    res = query_runbooks("cpu spike batch_indexer socket leak")
    assert res["runbook"]["id"] == "RUNBOOK-042"
    assert res["confidence_score"] > 0.8

def test_supervisor_investigation_flow():
    supervisor = SupervisorAgent()
    scenario = get_scenario("cpu")
    investigation = supervisor.run_investigation(scenario)

    assert investigation["incident_id"] == "INC-8924"
    assert len(investigation["investigation_trace"]) == 6
    assert "gemini_rca" in investigation
    assert investigation["gemini_rca"]["confidence_score"] > 0.8
    assert investigation["remediation_package"]["is_valid"] is True
    assert investigation["remediation_package"]["requires_human_approval"] is True
