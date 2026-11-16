import React from 'react';
import { 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';

export default function Overview({ incidentData, isResolved, onTriggerScenario, setActiveTab }) {
  const kpis = [
    {
      title: "Average MTTR Reduction",
      value: "-72.4%",
      subtext: "48 mins → 24 secs average",
      change: "+18.2% vs last week",
      icon: TrendingDown,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "RCA Precision Rate",
      value: "100.0%",
      subtext: "Gemini 2.5 Flash Verified",
      change: "4/4 scenarios matched",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Blast Radius Compliance",
      value: "100.0%",
      subtext: "0 unapproved destructive ops",
      change: "Zero policy violations",
      icon: ShieldCheck,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20"
    },
    {
      title: "Active Multi-Agent Swarm",
      value: "6 / 6 Agents",
      subtext: "Supervisor + 5 Workers",
      change: "All healthy",
      icon: Cpu,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  const fleetOverview = [
    { id: "i-0a81f3e9b142", name: "prod-worker-01", service: "worker-service", status: isResolved ? "HEALTHY" : "DEGRADED", cpu: isResolved ? 14.2 : incidentData.cpu, mem: incidentData.mem },
    { id: "i-07c8914b99aa", name: "redis-cluster-node-02", service: "redis-server", status: "HEALTHY", cpu: 34.1, mem: 68.2 },
    { id: "i-038f9210ee44", name: "nginx-ingress-prod-01", service: "nginx-ingress", status: "HEALTHY", cpu: 18.2, mem: 42.1 },
    { id: "i-05ba2919aa33", name: "postgres-primary-01", service: "postgresql-15", status: "HEALTHY", cpu: 12.0, mem: 48.0 }
  ];

  return (
    <div className="space-y-6">

      {/* Hero Welcome & Quick Mission Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Staff CloudOps & AI Engineering Suite
              </span>
              <span className="text-xs text-slate-400 font-mono">Region: us-east-1 + us-central1</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CloudOps AI SRE Mission Control</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Autonomous multi-agent cloud infrastructure investigation platform combining Google Gemini 2.5, Google Cloud Workflows, AWS CloudWatch, and ChromaDB SRE runbooks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('copilot')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40"
            >
              <span>Ask Gemini SRE Copilot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setActiveTab('remediation')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              View HITL Safety Gate
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl bg-slate-900/60 border ${kpi.border} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white">{kpi.value}</div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">{kpi.subtext}</span>
                <span className="text-emerald-400 font-medium">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Incident Alert Banner */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        isResolved ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isResolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'}`}>
              {isResolved ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isResolved ? 'RESOLVED' : incidentData.severity}
                </span>
                <h3 className="text-sm font-bold text-white">{incidentData.id}: {incidentData.title}</h3>
                <span className="text-xs font-mono text-sky-400">Node: {incidentData.instance}</span>
              </div>
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Root Cause Hypothesis:</strong> {incidentData.rootCause}
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Proposed Command: <code className="text-emerald-400">{incidentData.remedyCmd}</code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isResolved 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
              }`}
            >
              <span>{isResolved ? 'Inspect Post-Mortem' : 'Authorize Remediation'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Fleet Snapshot & Swarm Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Managed Fleet Quick Status (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Cluster Fleet Status Snapshot</h2>
            </div>
            <button 
              onClick={() => setActiveTab('fleet')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>View Full Fleet (4 Nodes)</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {fleetOverview.map((node) => (
              <div key={node.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <div>
                    <div className="font-semibold text-xs text-white truncate">{node.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{node.id} • {node.service}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">CPU Load</div>
                    <div className={node.cpu > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{node.cpu}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Memory</div>
                    <div className={node.mem > 80 ? 'text-rose-400 font-bold' : 'text-sky-400'}>{node.mem}%</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    node.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Failure Trigger Card (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Synthetic Chaos Controls</h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Inject realistic production outages to demo autonomous agent detection, RAG retrieval, and MTTR reduction:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => onTriggerScenario('cpu')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-amber-500/10 border border-slate-700/60 hover:border-amber-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-amber-300">1. Runaway CPU Contention</div>
                <div className="text-[10px] text-slate-400">392% vCPU thread deadlock</div>
              </div>
              <span className="text-base">⚡</span>
            </button>

            <button
              onClick={() => onTriggerScenario('oom')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-rose-500/10 border border-slate-700/60 hover:border-rose-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-rose-300">2. Redis Cache OOM Spike</div>
                <div className="text-[10px] text-slate-400">95.8% RAM saturation</div>
              </div>
              <span className="text-base">💥</span>
            </button>

            <button
              onClick={() => onTriggerScenario('disk')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-orange-500/10 border border-slate-700/60 hover:border-orange-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-orange-300">3. Root Partition Full</div>
                <div className="text-[10px] text-slate-400">98.4% /var/log unrotated debug logs</div>
              </div>
              <span className="text-base">💾</span>
            </button>

            <button
              onClick={() => onTriggerScenario('service')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-sky-500/10 border border-slate-700/60 hover:border-sky-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-sky-300">4. PostgreSQL Dead Lock</div>
                <div className="text-[10px] text-slate-400">Port 5432 postmaster.pid collision</div>
              </div>
              <span className="text-base">🔌</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
