import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Flame, 
  RotateCcw, 
  Lock, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function Remediation({ 
  incidentData, 
  isRemediating, 
  isResolved, 
  onApprove 
}) {
  const [overrideCmd, setOverrideCmd] = useState('');
  const [operatorNotes, setOperatorNotes] = useState('Reviewed by Gaurav Khaladkar (SRE On-Call Lead)');

  const riskScore = incidentData.riskScore || 30;
  const isHighRisk = riskScore > 50;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span>Human-in-the-Loop (HITL) Safety Gate</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-mono border border-rose-500/30">
              Blast Radius Enforcement
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero destructive infrastructure mutations. All proposed actions must pass regex allowlists and require explicit SRE human authorization.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Risk Assessment:</span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            riskScore <= 30 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            riskScore <= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
          }`}>
            {riskScore} / 100 ({incidentData.riskLevel || 'LOW'})
          </span>
        </div>
      </div>

      {/* Main Grid: Left Blast Radius & Command Diff, Right Safety Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Command Diff & Action Execution (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Incident Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">{incidentData.id}: {incidentData.title}</span>
              <span className="text-xs font-mono text-sky-400">Target Node: {incidentData.instance}</span>
            </div>
            <p className="text-xs text-slate-400">
              <strong>Isolated Root Cause:</strong> {incidentData.rootCause}
            </p>
          </div>

          {/* Action vs Rollback Diff Viewer */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Action Plan vs Rollback Diff
            </h3>

            {/* Proposed Remediation Action */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Proposed Remediation Action (Safe Prefix Match)
                </span>
                <span className="text-slate-500">Method: Systemd / SSH</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/70 border border-emerald-500/30 text-emerald-400 select-all break-all leading-relaxed">
                {incidentData.remedyCmd}
              </div>
            </div>

            {/* Pre-Computed Automated Rollback Safeguard */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Automated Rollback Safeguard (Triggered if health check fails)
                </span>
                <span className="text-slate-500">Timeout: 30s</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/70 border border-amber-500/30 text-amber-300 select-all break-all leading-relaxed">
                {incidentData.rollbackCmd}
              </div>
            </div>

            {/* SRE Operator Notes Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
              <label className="text-slate-400 font-medium">SRE Authorization Audit Notes:</label>
              <input 
                type="text" 
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Authorization Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
              <button 
                onClick={() => alert("Remediation rejected. Incident escalated to Tier-3 Senior Staff SRE.")}
                disabled={isResolved || isRemediating}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                ✕ Reject / Escalate to Senior SRE
              </button>

              <button 
                onClick={onApprove}
                disabled={isResolved || isRemediating}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2"
              >
                {isRemediating ? (
                  <>
                    <Terminal className="w-4 h-4 animate-spin" />
                    <span>Executing & Running Verification Probes...</span>
                  </>
                ) : isResolved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Remediation Succeeded (Exit Code 0)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Execute Remediation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Verification Output Terminal */}
          {isResolved && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Post-Remediation Verification Health Probe
                </span>
                <span className="text-slate-400">HTTP 200 OK</span>
              </div>
              <div className="p-3 bg-black/80 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div>[00:00:24] [Remediation Engine] Executed: <code className="text-emerald-400">{incidentData.remedyCmd}</code></div>
                <div>[00:00:25] [Health Probe] Polling http://{incidentData.instance}:8080/health ...</div>
                <div className="text-emerald-400 font-bold">[00:00:26] [Health Probe] Received 200 OK. Metric returned to safe baseline (&lt; 25%). Incident RESOLVED.</div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Blast Radius Rules & Allowlist Auditor (1 col) */}
        <div className="space-y-6">
          
          {/* Blast Radius Score Breakdown Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Blast Radius Risk Breakdown</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-3xl font-bold font-mono text-emerald-400">{riskScore} / 100</div>
              <div className="text-xs text-slate-400">Risk Severity: <strong className="text-white">{incidentData.riskLevel}</strong></div>
              <div className="text-[10px] text-slate-500">Impact Scope: Single Process Replica</div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Service Criticality:</span>
                <span className="text-white">Tier-2 Worker (+15)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Action Type:</span>
                <span className="text-white">Process SIGTERM (+10)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Rollback Guarantee:</span>
                <span className="text-emerald-400">Yes (Auto)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Database Impact:</span>
                <span className="text-emerald-400">Zero (None)</span>
              </div>
            </div>
          </div>

          {/* Security Guardrails Policy Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Active Security Allowlist Policies</span>
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                ✓ Approved: systemctl reload, restart, kill -15, vacuum, truncate
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px]">
                ✕ Blocked: rm -rf /, dd, mkfs, fdisk, DROP TABLE, iptables -F
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
