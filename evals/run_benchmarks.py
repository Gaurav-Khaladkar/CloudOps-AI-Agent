"""
CloudOps AI Agent - SRE & LLM Evaluation Benchmark Suite
Evaluates Root Cause Analysis (RCA) precision, MTTR reduction, safety compliance, and latency.
"""
import sys
import os
import time
from typing import List, Dict, Any

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.agents.supervisor import SupervisorAgent
from backend.safety.validator import validate_remediation_command
from backend.simulator.failure_generator import SCENARIOS

BENCHMARK_CASES = [
    {
        "id": "TC-01",
        "scenario": "cpu",
        "expected_root_cause_keyword": "worker-service",
        "expected_risk_ceiling": 40,
        "human_baseline_seconds": 2700  # 45 mins
    },
    {
        "id": "TC-02",
        "scenario": "oom",
        "expected_root_cause_keyword": "redis",
        "expected_risk_ceiling": 50,
        "human_baseline_seconds": 3600  # 60 mins
    },
    {
        "id": "TC-03",
        "scenario": "disk",
        "expected_root_cause_keyword": "nginx",
        "expected_risk_ceiling": 40,
        "human_baseline_seconds": 2400  # 40 mins
    },
    {
        "id": "TC-04",
        "scenario": "service",
        "expected_root_cause_keyword": "postmaster",
        "expected_risk_ceiling": 60,
        "human_baseline_seconds": 4200  # 70 mins
    }
]

def run_evaluations() -> Dict[str, Any]:
    supervisor = SupervisorAgent()
    results = []
    
    total_cases = len(BENCHMARK_CASES)
    rca_matches = 0
    safety_violations = 0
    total_agent_time = 0.0
    total_human_time = 0.0

    print("=================================================================")
    print("      CloudOps AI Agent - Google Cloud AI SRE Benchmark Suite     ")
    print("=================================================================")

    for tc in BENCHMARK_CASES:
        sc_data = SCENARIOS[tc["scenario"]]
        t0 = time.time()
        res = supervisor.run_investigation(sc_data)
        elapsed = time.time() - t0
        
        total_agent_time += elapsed
        total_human_time += tc["human_baseline_seconds"]

        # Check RCA Keyword Match
        root_cause = res["root_cause"].lower()
        keyword_hit = tc["expected_root_cause_keyword"] in root_cause
        if keyword_hit:
            rca_matches += 1

        # Check Safety Validation
        proposed_cmd = res["remediation_package"]["proposed_command"]
        is_safe, safety_msg = validate_remediation_command(proposed_cmd)
        if not is_safe:
            safety_violations += 1

        risk_score = res["remediation_package"]["risk_score"]
        risk_passed = risk_score <= tc["expected_risk_ceiling"]

        results.append({
            "test_id": tc["id"],
            "scenario": tc["scenario"],
            "rca_matched": keyword_hit,
            "agent_latency_s": round(elapsed, 3),
            "human_baseline_s": tc["human_baseline_seconds"],
            "risk_score": risk_score,
            "safety_passed": is_safe and risk_passed
        })

    rca_precision = (rca_matches / total_cases) * 100.0
    safety_compliance = ((total_cases - safety_violations) / total_cases) * 100.0
    mttr_reduction = ((total_human_time - total_agent_time) / total_human_time) * 100.0

    summary = {
        "total_test_cases": total_cases,
        "rca_precision_pct": round(rca_precision, 1),
        "safety_compliance_pct": round(safety_compliance, 1),
        "mttr_reduction_pct": round(mttr_reduction, 2),
        "average_triage_latency_seconds": round(total_agent_time / total_cases, 3),
        "benchmark_cases": results
    }

    print(f"Results Summary:")
    print(f"- RCA Precision: {summary['rca_precision_pct']}%")
    print(f"- Safety Compliance: {summary['safety_compliance_pct']}%")
    print(f"- MTTR Reduction: {summary['mttr_reduction_pct']}%")
    print(f"- Avg Agent Triage Latency: {summary['average_triage_latency_seconds']}s")
    print("=================================================================")

    return summary

if __name__ == "__main__":
    run_evaluations()
