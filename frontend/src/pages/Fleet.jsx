import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  Search,
  ExternalLink,
  Cpu,
  HardDrive
} from 'lucide-react';

export default function Fleet({ setActiveTab }) {
  const [fleet, setFleet] = useState([
    {
      id: "i-0a81f3e9b142",
      hostname: "prod-worker-01.us-east-1.internal",
      service: "worker-service",
      role: "Batch Processor",
      ip: "10.0.14.88",
      region: "us-east-1",
      status: "DEGRADED",
      cpu: 96.8,
      mem: 62.4,
      disk: 41.0,
      uptime: "14d 8h",
      active_incident: "INC-8924"
    },
    {
      id: "i-07c8914b99aa",
      hostname: "redis-cluster-node-02.internal",
      service: "redis-server",
      role: "Distributed Cache",
      ip: "10.0.22.104",
      region: "us-east-1",
      status: "WARNING",
      cpu: 34.1,
      mem: 95.8,
      disk: 38.0,
      uptime: "42d 12h",
      active_incident: "INC-8925"
    },
    {
      id: "i-038f9210ee44",
      hostname: "nginx-ingress-prod-01.internal",
      service: "nginx-ingress",
      role: "API Gateway / Ingress",
      ip: "10.0.1.12",
      region: "us-east-1",
      status: "HEALTHY",
      cpu: 18.2,
      mem: 42.1,
      disk: 98.4,
      uptime: "89d 4h",
      active_incident: "INC-8926"
    },
    {
      id: "i-05ba2919aa33",
      hostname: "postgres-primary-01.internal",
      service: "postgresql-15",
      role: "Relational Persistence",
      ip: "10.0.50.4",
      region: "us-east-1",
      status: "CRITICAL",
      cpu: 12.0,
      mem: 48.0,
      disk: 44.0,
      uptime: "1h 12m",
      active_incident: "INC-8927"
    }
  ]);

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    fetch('/api/fleet')
      .then(res => res.json())
      .then(data => {
        if (data.fleet) setFleet(data.fleet);
      })
      .catch(() => {});
  }, []);

  const filteredFleet = fleet.filter(node => {
    const matchesFilter = filter === 'ALL' || node.status === filter;
    const matchesSearch = node.hostname.toLowerCase().includes(search.toLowerCase()) || 
                          node.id.toLowerCase().includes(search.toLowerCase()) ||
                          node.service.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Infrastructure Fleet Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {fleet.length} Managed Nodes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status of EC2 Linux instances, container nodes, and database servers across AWS & GCP.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter node by name, ID, or service..."
              className="w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'HEALTHY', 'DEGRADED', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filter === f ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Node Hostname & ID</th>
                <th className="py-3 px-4">Role & Service</th>
                <th className="py-3 px-4">Private IP & Region</th>
                <th className="py-3 px-4">CPU Load</th>
                <th className="py-3 px-4">Memory</th>
                <th className="py-3 px-4">Disk (/var)</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredFleet.map((node) => (
                <tr key={node.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{node.hostname}</div>
                    <div className="text-[11px] text-slate-500">{node.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300 font-medium">{node.role}</div>
                    <div className="text-[11px] text-purple-400">{node.service}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div>{node.ip}</div>
                    <div className="text-[11px] text-slate-500">{node.region}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${node.cpu > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${node.cpu}%` }}></div>
                      </div>
                      <span className={node.cpu > 80 ? 'text-amber-400 font-bold' : 'text-slate-300'}>{node.cpu}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${node.mem > 80 ? 'bg-rose-400' : 'bg-sky-400'}`} style={{ width: `${node.mem}%` }}></div>
                      </div>
                      <span className={node.mem > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{node.mem}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${node.disk > 80 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${node.disk}%` }}></div>
                      </div>
                      <span className={node.disk > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{node.disk}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      node.status === 'DEGRADED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      node.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' :
                      'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {node.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedServer(node)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Simulate SSH Terminal / SSM Session"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('telemetry')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Metric Time-Series"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Remote Terminal / SSM Modal */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden font-mono text-xs">
            <div className="h-10 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>AWS SSM Session: {selectedServer.hostname} ({selectedServer.id})</span>
              </div>
              <button 
                onClick={() => setSelectedServer(null)}
                className="text-slate-400 hover:text-white text-base px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-black/80 text-emerald-400 space-y-2 h-72 overflow-y-auto">
              <div className="text-slate-500">Connecting to {selectedServer.id} via AWS Systems Manager agent...</div>
              <div className="text-slate-400">[ssm-user@{selectedServer.name} ~]$ uname -a</div>
              <div>Linux {selectedServer.hostname} 6.5.0-aws #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>
              <div className="text-slate-400">[ssm-user@{selectedServer.name} ~]$ systemctl status {selectedServer.service}</div>
              <div className={selectedServer.status === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}>
                ● {selectedServer.service}.service - High Throughput Production Daemon<br />
                &nbsp;&nbsp;&nbsp;Loaded: loaded (/lib/systemd/system/{selectedServer.service}.service; enabled)<br />
                &nbsp;&nbsp;&nbsp;Active: {selectedServer.status === 'HEALTHY' ? 'active (running)' : 'degraded (running with high contention)'}<br />
                &nbsp;&nbsp;&nbsp;Main PID: 14922 (worker_node)<br />
                &nbsp;&nbsp;&nbsp;Tasks: 128 (limit: 4915)<br />
                &nbsp;&nbsp;&nbsp;Memory: {selectedServer.mem}% of 16.0G
              </div>
              <div className="text-slate-400">[ssm-user@{selectedServer.name} ~]$ top -b -n 1 | head -n 10</div>
              <div className="text-slate-300">
                top - 09:35:10 up {selectedServer.uptime}, 1 user, load average: 8.42, 6.18, 4.05<br />
                Tasks: 218 total, 2 running, 216 sleeping, 0 stopped, 0 zombie<br />
                %Cpu(s): {selectedServer.cpu} us, 1.8 sy, 0.0 ni, 0.0 id, 0.0 wa<br />
                MiB Mem : 16384.0 total, 1420.2 free, 9820.4 used, 5143.4 buff/cache
              </div>
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedServer(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
