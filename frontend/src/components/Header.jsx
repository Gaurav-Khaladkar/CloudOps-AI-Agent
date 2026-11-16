import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  Search, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  onTriggerScenario, 
  activeIncident, 
  setActiveTab,
  isResolved 
}) {
  const [showChaosMenu, setShowChaosMenu] = useState(false);

  const scenarios = [
    { id: 'cpu', label: '1. CPU Runaway Spike', icon: '⚡', desc: 'Deadlock socket loop (i-0a81f3e9b142)' },
    { id: 'oom', label: '2. Redis OOM Killer', icon: '💥', desc: 'RAM saturation at 95.8% (redis-node-02)' },
    { id: 'disk', label: '3. Root Disk Space Full', icon: '💾', desc: '/var/log unrotated debug logs (98.4%)' },
    { id: 'service', label: '4. PostgreSQL Crash', icon: '🔌', desc: 'Stale postmaster.pid lock file (port 5432)' }
  ];

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Left: Quick Search & Dual Cloud Badge */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search servers, runbooks, logs, incidents... (Ctrl+K)"
            className="w-72 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            GCP Cloud Run (us-central1)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            AWS CloudWatch (us-east-1)
          </span>
        </div>
      </div>

      {/* Right: Actions, Chaos Injection & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Chaos Engineering Injector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowChaosMenu(!showChaosMenu)}
            className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>⚡ Inject Chaos Failure</span>
            <ChevronDown className="w-3 h-3 text-red-400" />
          </button>

          {showChaosMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Synthetic Production Failure Scenarios
              </div>
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onTriggerScenario(sc.id);
                    setShowChaosMenu(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors text-xs flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400">{sc.label}</div>
                    <div className="text-[10px] text-slate-400">{sc.desc}</div>
                  </div>
                  <span className="text-base">{sc.icon}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Incident Alert Banner Button */}
        {activeIncident && (
          <button
            onClick={() => setActiveTab('remediation')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              isResolved 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            {isResolved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESOLVED ({activeIncident.id})</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeIncident.id} ({activeIncident.severity})</span>
              </>
            )}
          </button>
        )}

        {/* Gemini AI Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Gemini 2.5 Flash</span>
        </div>

      </div>

    </header>
  );
}
