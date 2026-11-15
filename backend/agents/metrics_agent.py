"""
Metrics & CloudWatch Agent
Analyzes infrastructure metrics, detects threshold anomalies, and computes correlations.
"""
from typing import Dict, Any, List

class MetricsAgent:
    def __init__(self):
        self.name = "Metrics & CloudWatch Agent"

    def analyze(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes host and CloudWatch telemetry for anomalies.
        """
        cpu = telemetry.get("cpu_utilization", 0.0)
        mem = telemetry.get("memory_utilization", 0.0)
        disk = telemetry.get("disk_utilization", 0.0)
        p99 = telemetry.get("cloudwatch_p99_ms", 0)

        anomalies: List[str] = []
        severity = "SEV-3"

        if cpu > 90.0:
            anomalies.append(f"CRITICAL: CPU utilization {cpu}% exceeds 90% threshold.")
            severity = "SEV-2"
        if mem > 90.0:
            anomalies.append(f"CRITICAL: Memory utilization {mem}% exceeds 90% threshold (OOM Risk).")
            severity = "SEV-1"
        if disk > 90.0:
            anomalies.append(f"CRITICAL: Disk utilization {disk}% exceeds 90% threshold.")
            severity = "SEV-1"
        if p99 > 1000:
            anomalies.append(f"HIGH: P99 latency {p99}ms indicates degraded customer experience.")

        return {
            "agent": self.name,
            "status": "ANOMALY_DETECTED" if anomalies else "HEALTHY",
            "anomalies": anomalies,
            "suggested_severity": severity,
            "metrics_summary": f"CPU: {cpu}%, RAM: {mem}%, Disk: {disk}%, P99: {p99}ms"
        }
