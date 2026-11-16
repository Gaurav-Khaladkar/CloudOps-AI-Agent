import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Settings,
  Zap,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'fleet', label: 'Server Fleet', icon: Server, badge: '4 Nodes' },
  { id: 'telemetry', label: 'Telemetry & Metrics', icon: Activity, badge: 'Live' },
  { id: 'swarm', label: 'Multi-Agent Swarm', icon: Cpu, badge: '6 Active' },
  { id: 'incidents', label: 'Incidents Queue', icon: AlertTriangle, badge: '1 Alert', badgeColor: 'bg-amber-500/20 text-amber-300' },
  { id: 'copilot', label: 'Gemini SRE Copilot', icon: Bot, badge: 'AI' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'Chroma' },
  { id: 'remediation', label: 'Remediation (HITL)', icon: ShieldCheck, badge: 'Gate' },
  { id: 'reports', label: 'SRE Post-Mortems', icon: FileText, badge: null },
  { id: 'settings', label: 'Dual-Cloud Settings', icon: Settings, badge: null }
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  return (
    <aside className={`h-screen sticky top-0 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  CloudOps AI
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">L6</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Google SRE Platform</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Operational Workspace
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-950/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700/60'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SRE On-Call Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'p-2 rounded-xl bg-slate-900/60 border border-slate-800'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
            GK
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Gaurav Khaladkar</div>
              <div className="text-[10px] text-emerald-400 font-mono truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Lead SRE On-Call
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
