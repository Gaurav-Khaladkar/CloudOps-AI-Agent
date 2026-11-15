import React, { useState, useEffect } from 'react';

const SCENARIOS = [
  { id: 'cpu', label: '1. CPU Runaway Spike', icon: '⚡', desc: 'Deadlock socket loop in worker-service' },
  { id: 'oom', label: '2. Redis OOM Killer', icon: '💥', desc: 'Cache memory exhaustion at 95.8%' },
  { id: 'disk', label: '3. Root Disk Full', icon: '💾', desc: 'Unrotated nginx debug log at 98.4%' },
  { id: 'service', label: '4. Database Crash', icon: '🔌', desc: 'PostgreSQL stale postmaster.pid lock' }
];

export default function App() {
  const [activeScenario, setActiveScenario] = useState('cpu');
  const [incidentData, setIncidentData] = useState({
    id: 'INC-8924',
    title: 'EC2 High CPU & Kernel Contention Alert',
    severity: 'SEV-2',
    instance: 'i-0a81f3e9b142',
    cpu: 96.8,
    mem: 62.4,
    disk: 41.0,
    p99: 342,
    rootCause: 'Deadlock loop in worker-service socket poll loop consuming 392% vCPU',
    confidence: 0.94,
    remedyCmd: 'systemctl kill -s SIGTERM worker-service && systemctl restart worker-service',
    rollbackCmd: 'systemctl restart worker-service.fallback || aws ec2 reboot-instances --instance-ids i-0a81f3e9b142',
    riskScore: 18,
    riskLevel: 'LOW',
    status: 'AWAITING_APPROVAL'
  });

  const [agentLogs, setAgentLogs] = useState([
    { time: '00:00:01', agent: 'Supervisor', text: 'Incident INC-8924 received from AWS CloudWatch SNS topic.' },
    { time: '00:00:03', agent: 'Metrics Agent', text: 'Confirmed sustained CPU spike > 95% on instance i-0a81f3e9b142.' },
    { time: '00:00:06', agent: 'Log Diag Agent', text: 'Extracted socket poll timeout in worker PID 14922.' },
    { time: '00:00:10', agent: 'Gemini 2.5 Flash', text: 'Isolated root cause: Contention loop in thread pool.' },
    { time: '00:00:14', agent: 'RAG Runbook', text: 'Matched RUNBOOK-042 (High CPU Batch Worker Degraded).' },
    { time: '00:00:18', agent: 'HITL Gate', text: 'Risk Score 18/100 (LOW). Awaiting SRE authorization.' }
  ]);

  const [isRemediating, setIsRemediating] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const handleTrigger = (scenarioId) => {
    setActiveScenario(scenarioId);
    setIsResolved(false);
    setIsRemediating(false);

    if (scenarioId === 'cpu') {
      setIncidentData({
        id: 'INC-8924',
        title: 'EC2 High CPU & Kernel Contention Alert',
        severity: 'SEV-2',
        instance: 'i-0a81f3e9b142',
        cpu: 96.8,
        mem: 62.4,
        disk: 41.0,
        p99: 342,
        rootCause: 'Deadlock loop in worker-service socket poll loop consuming 392% vCPU',
        confidence: 0.94,
        remedyCmd: 'systemctl kill -s SIGTERM worker-service && systemctl restart worker-service',
        rollbackCmd: 'systemctl restart worker-service.fallback || aws ec2 reboot-instances --instance-ids i-0a81f3e9b142',
        riskScore: 18,
        riskLevel: 'LOW',
        status: 'AWAITING_APPROVAL'
      });
    } else if (scenarioId === 'oom') {
      setIncidentData({
        id: 'INC-8925',
        title: 'Kernel OOM Killer Trigger Warning - Redis Node',
        severity: 'SEV-1',
        instance: 'i-07c8914b99aa',
        cpu: 34.1,
        mem: 95.8,
        disk: 38.0,
        p99: 180,
        rootCause: 'Redis cache memory saturation (95.8%) triggering Linux kernel OOM killer',
        confidence: 0.96,
        remedyCmd: 'redis-cli -p 6379 config set maxmemory 14gb && redis-cli -p 6379 memory purge',
        rollbackCmd: 'redis-cli -p 6379 config set maxmemory 12gb',
        riskScore: 25,
        riskLevel: 'LOW',
        status: 'AWAITING_APPROVAL'
      });
    } else if (scenarioId === 'disk') {
      setIncidentData({
        id: 'INC-8926',
        title: 'Root Partition Disk Space Critical (/var/log 98%)',
        severity: 'SEV-1',
        instance: 'i-038f9210ee44',
        cpu: 18.2,
        mem: 42.1,
        disk: 98.4,
        p99: 89,
        rootCause: 'Unrotated nginx debug log saturated /var filesystem to 98.4%',
        confidence: 0.98,
        remedyCmd: 'journalctl --vacuum-size=500M && truncate -s 0 /var/log/nginx/access_debug.log',
        rollbackCmd: 'logrotate -f /etc/logrotate.d/nginx',
        riskScore: 20,
        riskLevel: 'LOW',
        status: 'AWAITING_APPROVAL'
      });
    } else {
      setIncidentData({
        id: 'INC-8927',
        title: 'PostgreSQL Database Service Unresponsive (Port 5432)',
        severity: 'SEV-1',
        instance: 'i-05ba2919aa33',
        cpu: 12.0,
        mem: 48.0,
        disk: 44.0,
        p99: 4200,
        rootCause: 'PostgreSQL crashed with stale postmaster.pid lock lingering in data directory',
        confidence: 0.95,
        remedyCmd: 'rm -f /var/lib/postgresql/15/main/postmaster.pid && systemctl start postgresql',
        rollbackCmd: 'systemctl status postgresql',
        riskScore: 45,
        riskLevel: 'MEDIUM',
        status: 'AWAITING_APPROVAL'
      });
    }
  };

  const handleApprove = () => {
    setIsRemediating(true);
    setTimeout(() => {
      setIsRemediating(false);
      setIsResolved(true);
      setIncidentData(prev => ({
        ...prev,
        cpu: 14.2,
        mem: 45.0,
        disk: 40.0,
        p99: 45,
        status: 'RESOLVED'
      }));
      setAgentLogs(prev => [
        ...prev,
        { time: '00:00:24', agent: 'Execution Engine', text: 'Remediation completed with exit code 0.' },
        { time: '00:00:26', agent: 'Verifier', text: 'Health probes healthy. Incident INC-8924 marked RESOLVED.' }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold text-xl">⚡</span>
              <h1 className="text-2xl font-bold tracking-tight text-white">CloudOps AI Agent</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">Gemini 2.5 Flash</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">AWS + GCP CloudOps</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Autonomous Site Reliability Engineering & Multi-Agent Incident Triage Platform</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">MTTR Reduction</div>
              <div className="text-lg font-mono font-bold text-emerald-400">-72.4% <span className="text-xs text-slate-400 font-normal">(48m → 24s)</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Safety Compliance</div>
              <div className="text-lg font-mono font-bold text-emerald-400">100.0% <span className="text-xs text-slate-400 font-normal">(0 incidents)</span></div>
            </div>
          </div>
        </header>

        {/* Active Incident Banner */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${isResolved ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isResolved ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isResolved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span className={isResolved ? 'text-emerald-300' : 'text-amber-300'}>{incidentData.id}: {incidentData.title}</span>
                  <span className={`px-2 py-0.5 text-xs rounded font-mono ${isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                    {isResolved ? 'RESOLVED' : incidentData.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Impacted Instance: <span className="text-sky-300 font-mono">{incidentData.instance}</span> | Root Cause: {incidentData.rootCause}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">{isResolved ? 'Recovery Time: 24s' : 'Elapsed: 00:01:42'}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Swarm & HITL, Right Telemetry & Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Multi-Agent Swarm Tracker */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white">Multi-Agent Swarm Execution Trace</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Google Agent Architecture</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 6 Agents Coordinated
                </span>
              </div>

              {/* Swarm Agents Mini-Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">👑</div>
                  <div className="font-semibold mt-1">Supervisor</div>
                  <div className="text-[10px] text-purple-400 font-mono">Active</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">📈</div>
                  <div className="font-semibold mt-1">Metrics</div>
                  <div className="text-[10px] text-sky-400 font-mono">CloudWatch</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">📜</div>
                  <div className="font-semibold mt-1">Linux Diag</div>
                  <div className="text-[10px] text-amber-400 font-mono">journalctl</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">⚡</div>
                  <div className="font-semibold mt-1">Gemini 2.5</div>
                  <div className="text-[10px] text-purple-300 font-mono">RCA Engine</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">📚</div>
                  <div className="font-semibold mt-1">RAG SOPs</div>
                  <div className="text-[10px] text-emerald-400 font-mono">ChromaDB</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <div className="text-lg">🛡️</div>
                  <div className="font-semibold mt-1">Remediation</div>
                  <div className="text-[10px] text-rose-400 font-mono">HITL Gate</div>
                </div>
              </div>

              {/* Agent Reasoning Stream Terminal */}
              <div className="bg-black/60 border border-slate-800 rounded-lg p-3.5 font-mono text-xs h-48 overflow-y-auto space-y-1.5">
                {agentLogs.map((log, index) => (
                  <div key={index} className="text-slate-300">
                    <span className="text-slate-500">[{log.time}]</span> <span className="text-sky-400">[{log.agent}]</span> {log.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Human-in-the-Loop Approval Gate */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Human-in-the-Loop Safety Gate</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Allowlist Verified</span>
                </div>
                <div className="text-xs text-slate-400">
                  Risk Level: <strong className="text-emerald-400 font-mono">{incidentData.riskLevel} ({incidentData.riskScore}/100)</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium">Proposed SRE Remediation Command</div>
                  <div className="p-2.5 rounded bg-black/60 border border-slate-800 font-mono text-emerald-400 select-all break-all">
                    {incidentData.remedyCmd}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium">Pre-Computed Rollback Safeguard</div>
                  <div className="p-2.5 rounded bg-black/60 border border-slate-800 font-mono text-amber-300 select-all break-all">
                    {incidentData.rollbackCmd}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  🔒 Sanitizer: Verified zero dangerous wildcards (<code className="text-rose-400 font-mono">rm -rf /</code>, <code className="text-rose-400 font-mono">dd</code>, etc.)
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    disabled={isResolved || isRemediating}
                    onClick={handleApprove}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40"
                  >
                    {isRemediating ? '⏳ Executing Remediation...' : isResolved ? '✓ Remediation Completed' : '✓ Authorize & Execute'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1 col) */}
          <div className="space-y-6">

            {/* Live Metrics Telemetry */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Node Telemetry Live</span>
                <span className="text-[10px] text-sky-400 font-mono">{incidentData.instance}</span>
              </div>

              {/* CPU Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">CPU Load</span>
                  <span className={incidentData.cpu > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{incidentData.cpu}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${incidentData.cpu > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${incidentData.cpu}%` }}></div>
                </div>
              </div>

              {/* RAM Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">RAM (Memory)</span>
                  <span className={incidentData.mem > 80 ? 'text-rose-400 font-bold' : 'text-sky-400'}>{incidentData.mem}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${incidentData.mem > 80 ? 'bg-rose-400' : 'bg-sky-400'}`} style={{ width: `${incidentData.mem}%` }}></div>
                </div>
              </div>

              {/* Disk Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Disk (/var)</span>
                  <span className={incidentData.disk > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{incidentData.disk}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${incidentData.disk > 80 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${incidentData.disk}%` }}></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-black/40 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">P99 Latency</div>
                  <div className="font-bold text-white mt-0.5">{incidentData.p99} ms</div>
                </div>
                <div className="p-2 bg-black/40 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Status</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{incidentData.status}</div>
                </div>
              </div>
            </div>

            {/* Synthetic Chaos Scenario Selector */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-white">Inject Chaos Scenarios</div>
              <div className="space-y-2">
                {SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => handleTrigger(sc.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${activeScenario === sc.id ? 'bg-purple-950/30 border-purple-500/50 text-purple-200' : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                  >
                    <div>
                      <div className="font-medium">{sc.label}</div>
                      <div className="text-[10px] text-slate-400">{sc.desc}</div>
                    </div>
                    <span>{sc.icon}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
