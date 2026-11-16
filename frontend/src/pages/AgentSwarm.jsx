import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AgentSwarm({ agentLogs, incidentData }) {
  const [selectedAgent, setSelectedAgent] = useState('supervisor');

  const swarmRoster = [
    {
      id: 'supervisor',
      name: 'Supervisor Coordinator Agent',
      role: 'Global State Machine & Dispatcher',
      model: 'LangGraph / ADK Architecture',
      status: 'ORCHESTRATING',
      latency: '0.001s',
      tokens: '412 tok',
      icon: '👑',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      description: 'Decomposes incoming alerts from CloudWatch SNS topics, instantiates task graphs, and routes findings between worker agents.'
    },
    {
      id: 'metrics',
      name: 'Metrics & CloudWatch Agent',
      role: 'Telemetry Correlator & Outlier Detector',
      model: 'Python / Boto3 / psutil',
      status: 'ANOMALY_DETECTED',
      latency: '0.002s',
      tokens: '280 tok',
      icon: '📈',
      color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
      description: 'Extracts CPU, RAM, Disk, and CloudWatch P99 latency metrics. Evaluates anomaly severity thresholds.'
    },
    {
      id: 'logs',
      name: 'Linux Diagnostics & Log Agent',
      role: 'Journalctl & System Forensics',
      model: 'Regex Token Redactor + Shell Parser',
      status: 'ERRORS_EXTRACTED',
      latency: '0.003s',
      tokens: '840 tok',
      icon: '📜',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      description: 'Parses system logs, dmesg, and journalctl. Masks sensitive tokens/credentials and isolates rogue PIDs.'
    },
    {
      id: 'gemini',
      name: 'Google Gemini 2.5 Flash / Pro',
      role: 'Root Cause Analysis & Synthesis',
      model: 'Gemini 2.5 Flash (Schema JSON)',
      status: 'RCA_COMPLETED',
      latency: '1.18s',
      tokens: '1,420 tok',
      icon: '⚡',
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-200',
      description: 'Synthesizes multi-source evidence into structured JSON root-cause hypotheses with confidence scoring.'
    },
    {
      id: 'rag',
      name: 'RAG Runbook Agent',
      role: 'Vector SOP Matcher',
      model: 'ChromaDB + Gemini Text Embeddings',
      status: 'RUNBOOK_MATCHED',
      latency: '0.045s',
      tokens: '520 tok',
      icon: '📚',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      description: 'Performs cosine similarity search against enterprise standard operating procedures and past post-mortems.'
    },
    {
      id: 'remediation',
      name: 'Remediation & Blast Radius Agent',
      role: 'HITL Gate & Safety Verifier',
      model: 'Allowlist Engine + Risk Scorer',
      status: 'AWAITING_APPROVAL',
      latency: '0.001s',
      tokens: '190 tok',
      icon: '🛡️',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      description: 'Computes 0-100 blast radius score, validates commands against allowlists, and enforces mandatory SRE approval.'
    }
  ];

  const currentAgent = swarmRoster.find(a => a.id === selectedAgent) || swarmRoster[0];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Autonomous Multi-Agent Swarm Tracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
              6 Agents Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Google ADK & LangGraph multi-agent coordination state machine for incident triage.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Swarm Latency: 1.23s Total MTTR
        </div>
      </div>

      {/* Interactive Visual Agent Workflow Hierarchy Graph */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Agent Coordination Pipeline (Click an agent to inspect state)
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {swarmRoster.map((agent, i) => {
            const isSelected = selectedAgent === agent.id;
            return (
              <div 
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[120px] ${
                  isSelected 
                    ? `${agent.color} ring-2 ring-purple-500 shadow-xl` 
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="text-[10px] font-mono text-slate-400">{agent.latency}</span>
                  </div>
                  <div className="font-semibold text-xs text-white mt-2 leading-tight">{agent.name}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Done
                  </span>
                  <span className="text-slate-400">{agent.tokens}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Selected Agent Details & Real-Time Thought Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Selected Agent Inspector (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="text-2xl">{currentAgent.icon}</span>
            <div>
              <div className="font-bold text-white text-sm">{currentAgent.name}</div>
              <div className="text-[11px] text-purple-400">{currentAgent.role}</div>
            </div>
          </div>

          <div className="space-y-2 text-slate-300 font-sans text-xs">
            <p>{currentAgent.description}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Architecture:</span>
              <span className="text-white font-medium">{currentAgent.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Execution Status:</span>
              <span className="text-emerald-400 font-bold">{currentAgent.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Execution Latency:</span>
              <span className="text-sky-300">{currentAgent.latency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Token Consumption:</span>
              <span className="text-amber-300">{currentAgent.tokens}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Agent Reasoning Stream Terminal (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Live Multi-Agent Reasoning Trace Stream</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Stream: Active (SSE)</span>
          </div>

          <div className="bg-black/80 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-2 custom-scrollbar">
            {agentLogs.length === 0 ? (
              <div className="text-slate-500">Awaiting incident trigger to initiate swarm trace...</div>
            ) : (
              agentLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className="text-sky-400 font-semibold shrink-0">[{log.agent}]:</span>
                  <span className="text-slate-200">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
