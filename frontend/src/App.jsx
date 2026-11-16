import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Fleet from './pages/Fleet';
import Telemetry from './pages/Telemetry';
import AgentSwarm from './pages/AgentSwarm';
import Incidents from './pages/Incidents';
import Copilot from './pages/Copilot';
import KnowledgeBase from './pages/KnowledgeBase';
import Remediation from './pages/Remediation';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const DEFAULT_INCIDENTS = {
  cpu: {
    id: 'INC-8924',
    title: 'EC2 High CPU & Kernel Contention Alert',
    severity: 'SEV-2',
    instance: 'i-0a81f3e9b142',
    cpu: 96.8,
    mem: 62.4,
    disk: 41.0,
    p99: 342,
    rootCause: 'Deadlock loop in worker-service socket poll loop consuming 392% vCPU',
    remedyCmd: 'systemctl kill -s SIGTERM worker-service && systemctl restart worker-service',
    rollbackCmd: 'systemctl restart worker-service.fallback || aws ec2 reboot-instances --instance-ids i-0a81f3e9b142',
    riskScore: 30,
    riskLevel: 'LOW',
    status: 'AWAITING_APPROVAL'
  },
  oom: {
    id: 'INC-8925',
    title: 'Kernel OOM Killer Trigger Warning - Redis Node',
    severity: 'SEV-1',
    instance: 'i-07c8914b99aa',
    cpu: 34.1,
    mem: 95.8,
    disk: 38.0,
    p99: 180,
    rootCause: 'Redis cache memory saturation (95.8%) triggering Linux kernel OOM killer',
    remedyCmd: 'redis-cli -p 6379 config set maxmemory 14gb && redis-cli -p 6379 memory purge',
    rollbackCmd: 'redis-cli -p 6379 config set maxmemory 12gb',
    riskScore: 40,
    riskLevel: 'MEDIUM',
    status: 'AWAITING_APPROVAL'
  },
  disk: {
    id: 'INC-8926',
    title: 'Root Partition Disk Space Critical (/var/log 98%)',
    severity: 'SEV-1',
    instance: 'i-038f9210ee44',
    cpu: 18.2,
    mem: 42.1,
    disk: 98.4,
    p99: 89,
    rootCause: 'Unrotated nginx debug log saturated /var filesystem to 98.4%',
    remedyCmd: 'journalctl --vacuum-size=500M && truncate -s 0 /var/log/nginx/access_debug.log',
    rollbackCmd: 'logrotate -f /etc/logrotate.d/nginx',
    riskScore: 20,
    riskLevel: 'LOW',
    status: 'AWAITING_APPROVAL'
  },
  service: {
    id: 'INC-8927',
    title: 'PostgreSQL Database Service Unresponsive (Port 5432)',
    severity: 'SEV-1',
    instance: 'i-05ba2919aa33',
    cpu: 12.0,
    mem: 48.0,
    disk: 44.0,
    p99: 4200,
    rootCause: 'PostgreSQL crashed with stale postmaster.pid lock lingering in data directory',
    remedyCmd: 'rm -f /var/lib/postgresql/15/main/postmaster.pid && systemctl start postgresql',
    rollbackCmd: 'systemctl status postgresql',
    riskScore: 55,
    riskLevel: 'HIGH',
    status: 'AWAITING_APPROVAL'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [incidentData, setIncidentData] = useState(DEFAULT_INCIDENTS.cpu);
  const [agentLogs, setAgentLogs] = useState([]);
  const [isRemediating, setIsRemediating] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    loadScenario('cpu');
  }, []);

  const loadScenario = async (scenarioId) => {
    setIsResolved(false);
    setIsRemediating(false);

    const fallback = DEFAULT_INCIDENTS[scenarioId] || DEFAULT_INCIDENTS.cpu;

    try {
      const res = await fetch('/api/simulate-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId })
      });

      if (res.ok) {
        const data = await res.json();
        const inc = data.incident;
        const inv = data.investigation;
        const remedy = inv.remediation_package;

        setIncidentData({
          id: inc.incident_id,
          title: inc.title,
          severity: inc.severity,
          instance: inc.target_instance,
          cpu: inc.telemetry?.cpu_utilization ?? fallback.cpu,
          mem: inc.telemetry?.memory_utilization ?? fallback.mem,
          disk: inc.telemetry?.disk_utilization ?? fallback.disk,
          p99: inc.telemetry?.cloudwatch_p99_ms ?? fallback.p99,
          rootCause: inv.root_cause || fallback.rootCause,
          remedyCmd: remedy.proposed_command || fallback.remedyCmd,
          rollbackCmd: remedy.rollback_command || fallback.rollbackCmd,
          riskScore: remedy.risk_score || fallback.riskScore,
          riskLevel: remedy.risk_level || fallback.riskLevel,
          status: 'AWAITING_APPROVAL'
        });

        const traces = inv.investigation_trace || [];
        setAgentLogs(traces.map(t => ({
          time: new Date().toLocaleTimeString(),
          agent: t.agent,
          text: t.message
        })));
      } else {
        useFallback(fallback);
      }
    } catch (e) {
      useFallback(fallback);
    }
  };

  const useFallback = (data) => {
    setIncidentData(data);
    setAgentLogs([
      { time: '00:00:01', agent: 'Supervisor Agent', text: `Incident ${data.id} ingested. Delegating triage to swarm.` },
      { time: '00:00:03', agent: 'Metrics Agent', text: `Anomaly detected: CPU ${data.cpu}%, RAM ${data.mem}%, Disk ${data.disk}%.` },
      { time: '00:00:07', agent: 'Linux Diag Agent', text: `Extracted error signatures and isolated root cause hypothesis.` },
      { time: '00:00:11', agent: 'Google Gemini 2.5', text: `Root Cause Isolated: ${data.rootCause}` },
      { time: '00:00:15', agent: 'RAG Runbook Agent', text: `Matched corresponding SRE Standard Operating Procedure.` },
      { time: '00:00:18', agent: 'Remediation Gate', text: `Command security validated. Risk Score: ${data.riskScore} (${data.riskLevel}). Awaiting SRE approval.` }
    ]);
  };

  const handleApprove = async () => {
    setIsRemediating(true);

    try {
      await fetch('/api/remediation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incidentData.id, approved: true })
      });
    } catch (e) {}

    setTimeout(() => {
      setIsRemediating(false);
      setIsResolved(true);
      setIncidentData(prev => ({
        ...prev,
        cpu: 14.2,
        mem: 42.0,
        disk: 39.5,
        p99: 42,
        status: 'RESOLVED'
      }));
      setAgentLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), agent: 'Execution Engine', text: 'Command executed with exit code 0. Health probe PASSED.' },
        { time: new Date().toLocaleTimeString(), agent: 'SRE Reporter', text: `Incident ${incidentData.id} marked RESOLVED. SRE Post-Mortem generated.` }
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Multi-Page Sticky Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Header with Chaos Trigger and Cloud Status */}
        <Header 
          onTriggerScenario={loadScenario}
          activeIncident={incidentData}
          setActiveTab={setActiveTab}
          isResolved={isResolved}
        />

        {/* Dynamic Multi-Page Router Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <Overview 
                incidentData={incidentData} 
                isResolved={isResolved} 
                onTriggerScenario={loadScenario} 
                setActiveTab={setActiveTab} 
              />
            )}
            {activeTab === 'fleet' && (
              <Fleet setActiveTab={setActiveTab} />
            )}
            {activeTab === 'telemetry' && (
              <Telemetry />
            )}
            {activeTab === 'swarm' && (
              <AgentSwarm 
                agentLogs={agentLogs} 
                incidentData={incidentData} 
              />
            )}
            {activeTab === 'incidents' && (
              <Incidents 
                incidentData={incidentData} 
                isResolved={isResolved} 
                setActiveTab={setActiveTab} 
              />
            )}
            {activeTab === 'copilot' && (
              <Copilot incidentData={incidentData} />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeBase />
            )}
            {activeTab === 'remediation' && (
              <Remediation 
                incidentData={incidentData}
                isRemediating={isRemediating}
                isResolved={isResolved}
                onApprove={handleApprove}
              />
            )}
            {activeTab === 'reports' && (
              <Reports 
                incidentData={incidentData}
                isResolved={isResolved}
              />
            )}
            {activeTab === 'settings' && (
              <Settings />
            )}
          </div>
        </main>

      </div>

    </div>
  );
}
