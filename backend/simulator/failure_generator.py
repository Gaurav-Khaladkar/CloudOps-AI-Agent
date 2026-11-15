"""
Synthetic Failure & Chaos Engineering Simulator
Generates realistic Linux and AWS CloudWatch incident scenarios for testing without live infrastructure costs.
"""
from typing import Dict, Any
import time

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "cpu": {
        "incident_id": "INC-8924",
        "title": "EC2 High CPU & Kernel Contention Alert",
        "severity": "SEV-2",
        "target_instance": "i-0a81f3e9b142",
        "service_name": "worker-service",
        "source": "AWS CloudWatch Alarm",
        "alarm_name": "cpu-utilization-breach-95%",
        "telemetry": {
            "cpu_utilization": 96.8,
            "memory_utilization": 62.4,
            "disk_utilization": 41.0,
            "load_average_1m": 8.42,
            "active_threads": 1492,
            "cloudwatch_p99_ms": 342
        },
        "logs": [
            "2026-11-16T00:00:01Z [kernel] sched: RT throttling activated for cgroup worker-pool",
            "2026-11-16T00:00:03Z [worker-service] ERROR: ThreadPoolExecutor saturated (pool_size=128, active=128, queue=5000)",
            "2026-11-16T00:00:06Z [worker-service] WARNING: PID 14922 socket poll timed out after 30000ms; spinning retry loop",
            "2026-11-16T00:00:08Z [systemd] Unit worker-service.service CPU quota (400%) exceeded: current usage 392%"
        ]
    },
    "oom": {
        "incident_id": "INC-8925",
        "title": "Kernel OOM Killer Trigger Warning - Redis Node",
        "severity": "SEV-1",
        "target_instance": "i-07c8914b99aa",
        "service_name": "redis-server",
        "source": "Linux System Telemetry",
        "alarm_name": "host-memory-breach-95%",
        "telemetry": {
            "cpu_utilization": 34.1,
            "memory_utilization": 95.8,
            "disk_utilization": 38.0,
            "load_average_1m": 3.12,
            "active_threads": 410,
            "cloudwatch_p99_ms": 180
        },
        "logs": [
            "2026-11-16T00:00:01Z [redis] WARNING: 95.8% of memory used! maxmemory threshold reached",
            "2026-11-16T00:00:03Z [kernel] Out of memory: Kill process 812 (redis-server) score 952 or sacrifice child",
            "2026-11-16T00:00:05Z [kernel] oom-killer: gfp_mask=0x1100cca(GFP_HIGHUSER_MOVABLE), order=0",
            "2026-11-16T00:00:07Z [redis] Client request rejected: OOM command not allowed when used memory > 'maxmemory'"
        ]
    },
    "disk": {
        "incident_id": "INC-8926",
        "title": "Root Partition Disk Space Critical (/var/log 98%)",
        "severity": "SEV-1",
        "target_instance": "i-038f9210ee44",
        "service_name": "nginx-ingress",
        "source": "AWS CloudWatch Alarm",
        "alarm_name": "disk-space-utilization-breach-90%",
        "telemetry": {
            "cpu_utilization": 18.2,
            "memory_utilization": 42.1,
            "disk_utilization": 98.4,
            "load_average_1m": 1.25,
            "active_threads": 220,
            "cloudwatch_p99_ms": 89
        },
        "logs": [
            "2026-11-16T00:00:01Z [systemd-journald] Suppressed 421 messages due to rate limiting",
            "2026-11-16T00:00:03Z [nginx] ALERT: could not write to /var/log/nginx/access_debug.log: No space left on device",
            "2026-11-16T00:00:05Z [kernel] EXT4-fs (nvme0n1p1): warning: mounting fs with errors, running e2fsck is recommended",
            "2026-11-16T00:00:07Z [kernel] I/O error on root inode allocation: out of blocks"
        ]
    },
    "service": {
        "incident_id": "INC-8927",
        "title": "PostgreSQL Database Service Unresponsive (Port 5432)",
        "severity": "SEV-1",
        "target_instance": "i-05ba2919aa33",
        "service_name": "postgresql",
        "source": "TCP Health Check Probe",
        "alarm_name": "tcp-connection-refused-port-5432",
        "telemetry": {
            "cpu_utilization": 12.0,
            "memory_utilization": 48.0,
            "disk_utilization": 44.0,
            "load_average_1m": 0.85,
            "active_threads": 115,
            "cloudwatch_p99_ms": 4200
        },
        "logs": [
            "2026-11-16T00:00:01Z [backend-api] ConnectionRefusedError: [Errno 111] Connection refused (127.0.0.1:5432)",
            "2026-11-16T00:00:03Z [systemd] postgresql.service: Main process exited, code=exited, status=1/FAILURE",
            "2026-11-16T00:00:05Z [postgres] FATAL: lock file 'postmaster.pid' already exists",
            "2026-11-16T00:00:07Z [postgres] HINT: Is another postmaster (PID 4492) running in data directory '/var/lib/postgresql/15/main'?"
        ]
    }
}

def get_scenario(scenario_type: str = "cpu") -> Dict[str, Any]:
    """Returns the scenario payload for a given chaos failure mode."""
    scenario = SCENARIOS.get(scenario_type, SCENARIOS["cpu"]).copy()
    scenario["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return scenario
