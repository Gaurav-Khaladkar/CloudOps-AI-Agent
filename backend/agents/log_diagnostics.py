"""
Linux Diagnostics & Log Agent
Parses system logs, dmesg, and journalctl, sanitizing sensitive data and isolating root causes.
"""
from typing import List, Dict, Any
import re

class LogDiagnosticsAgent:
    def __init__(self):
        self.name = "Linux Diagnostics & Log Agent"

    def analyze(self, logs: List[str]) -> Dict[str, Any]:
        """
        Parses log stream, removes secrets, and identifies root cause clues.
        """
        errors_found = []
        root_cause_clues = []

        for log in logs:
            # Mask potential tokens or keys
            clean_log = re.sub(r'(bearer|token|secret|password)[=:\s]+[A-Za-z0-9_\-\.]+', r'\1=[REDACTED]', log, flags=re.IGNORECASE)

            if "ERROR" in clean_log or "FATAL" in clean_log or "ALERT" in clean_log:
                errors_found.append(clean_log)
            if "Out of memory" in clean_log or "oom-killer" in clean_log:
                root_cause_clues.append("Kernel OOM killer invoked due to exhaustion")
            elif "socket poll timed out" in clean_log or "spinning retry loop" in clean_log:
                root_cause_clues.append("Thread deadlock / unhandled socket polling retry loop in worker process")
            elif "No space left on device" in clean_log:
                root_cause_clues.append("Filesystem space exhausted, preventing file writes")
            elif "lock file 'postmaster.pid' already exists" in clean_log:
                root_cause_clues.append("Stale postgres postmaster.pid lock file lingering after dirty shutdown")

        root_cause = "; ".join(root_cause_clues) if root_cause_clues else "Unknown application exception"

        return {
            "agent": self.name,
            "errors_extracted": len(errors_found),
            "root_cause_hypothesis": root_cause,
            "sample_error": errors_found[0] if errors_found else None
        }
