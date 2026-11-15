"""
Security & Command Validation Gate for CloudOps AI Agent
Enforces strict allowlists, blocks destructive operations, and defends against prompt injection.
"""
import re
from typing import Tuple, List

# Strictly forbidden destructive command patterns
FORBIDDEN_PATTERNS = [
    r"\brm\s+-[rRfF]*\s+/\s*$",            # rm -rf /
    r"\brm\s+-[rRfF]*\s+/\*",              # rm -rf /*
    r"\brm\s+-[rRfF]*\s+~",                # rm -rf ~
    r"\brm\s+-[rR]\w*\s+/(etc|boot|bin|sbin|usr|lib|dev|sys|proc)\b", # Recursive wipe of OS root directories
    r"\bdd\s+if=",                         # Direct block storage overwrite
    r"\bmkfs\b",                           # Format file systems
    r"\bfdisk\b",                          # Partition table manipulation
    r"\bshutdown\b",                       # Host shutdown
    r"\breboot\s+-f\b",                    # Forced hard reboot
    r"\bDROP\s+(TABLE|DATABASE|SCHEMA)\b",  # Destructive SQL
    r"\bTRUNCATE\s+TABLE\b",               # Truncate tables
    r"\biptables\s+-F\b",                  # Flush firewall rules
    r":\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;", # Fork bomb
    r">\s*/dev/sd[a-z]",                   # Truncate raw block device
]

# Approved command patterns for SRE remediation
SAFE_COMMAND_PREFIXES = [
    "systemctl restart",
    "systemctl reload",
    "systemctl start",
    "systemctl stop",
    "systemctl kill",
    "kill -15",
    "kill -SIGTERM",
    "journalctl --vacuum",
    "truncate -s 0",
    "logrotate -f",
    "redis-cli",
    "docker restart",
    "docker compose restart",
    "aws ec2 reboot-instances",
    "rm -f /var/lib/postgresql/",
]

def sanitize_input(text: str) -> str:
    """Removes potential prompt injection tags and control characters."""
    sanitized = re.sub(r"<[^>]+>", "", text)
    return sanitized.strip()

def validate_remediation_command(command: str) -> Tuple[bool, str]:
    """
    Validates proposed remediation bash command against security rules.
    Returns (is_valid, reason).
    """
    if not command or not command.strip():
        return False, "Command cannot be empty."

    cmd_clean = command.strip()

    # 1. Check against blacklist
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, cmd_clean, re.IGNORECASE):
            return False, f"SECURITY VIOLATION: Command matches forbidden destructive pattern '{pattern}'."

    # 2. Check if command matches at least one approved safe pattern
    is_safe = False
    for safe_prefix in SAFE_COMMAND_PREFIXES:
        if safe_prefix.lower() in cmd_clean.lower():
            is_safe = True
            break

    if not is_safe:
        return False, f"Command '{cmd_clean}' does not match any approved SRE safe-prefix list."

    return True, "Command passed security validation."
