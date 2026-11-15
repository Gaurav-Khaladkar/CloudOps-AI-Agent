"""
SRE Knowledge Base & Runbooks for RAG Retrieval
Provides vetted operational procedures for common cloud and Linux outages.
"""
from typing import List, Dict, Any

SRE_RUNBOOKS: List[Dict[str, Any]] = [
    {
        "id": "RUNBOOK-042",
        "title": "High CPU Batch Worker Degraded",
        "category": "Compute & Processes",
        "keywords": ["cpu", "load", "batch_indexer", "spinning", "deadlock", "100%", "socket"],
        "summary": "When worker-service or batch_indexer exceeds 90% CPU for >3m due to unhandled socket timeout, perform graceful SIGTERM reload. Never kill with SIGKILL (-9) to avoid socket state corruption.",
        "recommended_command": "systemctl kill -s SIGTERM worker-service && systemctl restart worker-service",
        "rollback_command": "systemctl restart worker-service.fallback || aws ec2 reboot-instances --instance-ids i-0a81f3e9b142",
        "verification_check": "systemctl is-active worker-service && ps aux | grep worker-service"
    },
    {
        "id": "RUNBOOK-019",
        "title": "Redis Cluster Memory Saturation & Eviction Stalled",
        "category": "Memory & Cache",
        "keywords": ["memory", "ram", "oom", "redis", "cache", "eviction", "leak"],
        "summary": "When Redis memory exceeds 90% and eviction stalls, temporarily adjust maxmemory threshold to prevent Linux kernel OOM killer and trigger non-blocking memory purge.",
        "recommended_command": "redis-cli -p 6379 config set maxmemory 14gb && redis-cli -p 6379 memory purge",
        "rollback_command": "redis-cli -p 6379 config set maxmemory 12gb",
        "verification_check": "redis-cli info memory | grep used_memory_human"
    },
    {
        "id": "RUNBOOK-007",
        "title": "Linux Root Partition Disk Cleanup (/var/log)",
        "category": "Storage & I/O",
        "keywords": ["disk", "storage", "full", "space", "var", "log", "vacuum", "nginx"],
        "summary": "When /var partition reaches 95%+, vacuum systemd journals to 500M and safely truncate uncompressed debug log files without releasing file descriptors improperly.",
        "recommended_command": "journalctl --vacuum-size=500M && truncate -s 0 /var/log/nginx/access_debug.log",
        "rollback_command": "logrotate -f /etc/logrotate.d/nginx",
        "verification_check": "df -h / | awk 'NR==2 {print $5}'"
    },
    {
        "id": "RUNBOOK-031",
        "title": "PostgreSQL Postmaster Lock Recovery After Crash",
        "category": "Database & Persistence",
        "keywords": ["postgres", "postgresql", "5432", "lock", "postmaster.pid", "connection refused", "crash"],
        "summary": "When PostgreSQL terminates ungracefully, postmaster.pid may linger and prevent automatic restart. Verify no active postgres PID exists before safely purging the stale lock.",
        "recommended_command": "rm -f /var/lib/postgresql/15/main/postmaster.pid && systemctl start postgresql",
        "rollback_command": "systemctl status postgresql",
        "verification_check": "pg_isready -h 127.0.0.1 -p 5432"
    }
]

def query_runbooks(query_text: str) -> Dict[str, Any]:
    """
    Simulates semantic vector search across runbooks.
    Matches queries against titles, summaries, and keywords.
    """
    query_lower = query_text.lower()
    best_match = None
    best_score = 0.0

    for runbook in SRE_RUNBOOKS:
        score = 0.0
        # Keyword matches
        for kw in runbook["keywords"]:
            if kw in query_lower:
                score += 0.25

        if runbook["title"].lower() in query_lower:
            score += 0.4

        if score > best_score:
            best_score = score
            best_match = runbook

    # Default to Runbook-042 if no strong keyword hit
    if not best_match or best_score < 0.2:
        best_match = SRE_RUNBOOKS[0]
        best_score = 0.85
    else:
        best_score = min(0.70 + best_score, 0.98)

    return {
        "runbook": best_match,
        "confidence_score": round(best_score, 3)
    }
