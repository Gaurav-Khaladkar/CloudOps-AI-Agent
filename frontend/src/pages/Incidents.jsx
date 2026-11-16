import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function Incidents({ incidentData, isResolved, setActiveTab }) {
  const [filter, setFilter] = useState('ALL');

  const incidentsList = [
    {
      id: incidentData.id,
      title: incidentData.title,
      severity: incidentData.severity,
      instance: incidentData.instance,
      service: "worker-service",
      rootCause: incidentData.rootCause,
      status: isResolved ? "RESOLVED" : "AWAITING_APPROVAL",
      mttr: isResolved ? "24s" : "00:01:42",
      created_at: "Just now"
    },
    {
      id: "INC-8923",
      title: "Redis Cluster Memory Spike Above 90%",
      severity: "SEV-1",
      instance: "i-07c8914b99aa",
      service: "redis-server",
      rootCause: "Transient burst in session store keyspace with eviction stalled",
      status: "RESOLVED",
      mttr: "31s",
      created_at: "2 hours ago"
    },
    {
      id: "INC-8922",
      title: "Root Partition Storage Exceeded 95%",
      severity: "SEV-2",
      instance: "i-038f9210ee44",
      service: "nginx-ingress",
      rootCause: "Unrotated debug access logs saturated /var filesystem",
      status: "RESOLVED",
      mttr: "18s",
      created_at: "Yesterday"
    },
    {
      id: "INC-8921",
      title: "PostgreSQL Database Connection Refused",
      severity: "SEV-1",
      instance: "i-05ba2919aa33",
      service: "postgresql-15",
      rootCause: "Stale postmaster.pid lock file remaining after dirty node reboot",
      status: "RESOLVED",
      mttr: "29s",
      created_at: "3 days ago"
    }
  ];

  const filtered = incidentsList.filter(inc => {
    if (filter === 'ALL') return true;
    return inc.status === filter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>SRE Incident Management & Triage Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous multi-agent incident tracking with root-cause timelines and MTTR analytics.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'AWAITING_APPROVAL', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Cards / Table */}
      <div className="space-y-3">
        {filtered.map((inc) => {
          const isCurrentActive = inc.id === incidentData.id && !isResolved;
          return (
            <div 
              key={inc.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrentActive 
                  ? 'bg-amber-950/15 border-amber-500/40 shadow-lg shadow-amber-950/20' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inc.severity === 'SEV-1' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      inc.severity === 'SEV-2' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{inc.id}</span>
                    <span className="text-xs text-slate-400">• {inc.created_at}</span>
                    <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {inc.instance} ({inc.service})
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">{inc.title}</h3>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300 font-medium">Root Cause:</strong> {inc.rootCause}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono text-xs">
                    <div className="text-[10px] text-slate-500 uppercase">Resolution MTTR</div>
                    <div className="font-bold text-emerald-400">{inc.mttr}</div>
                  </div>

                  <button
                    onClick={() => setActiveTab('remediation')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isCurrentActive 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{isCurrentActive ? 'Review & Authorize' : 'Inspect Report'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
