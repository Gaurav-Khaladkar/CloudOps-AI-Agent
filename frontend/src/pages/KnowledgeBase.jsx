import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  ShieldCheck, 
  UploadCloud, 
  ExternalLink,
  ChevronRight,
  Database,
  FileCode
} from 'lucide-react';

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [selectedRunbook, setSelectedRunbook] = useState(null);

  const runbooks = [
    {
      id: "RUNBOOK-042",
      title: "High CPU Batch Worker Degraded",
      category: "Compute & Processes",
      keywords: ["cpu", "load", "batch_indexer", "spinning", "deadlock", "100%", "socket"],
      summary: "When worker-service or batch_indexer exceeds 90% CPU for >3m due to unhandled socket timeout, perform graceful SIGTERM reload. Never kill with SIGKILL (-9) to avoid socket state corruption.",
      recommended_command: "systemctl kill -s SIGTERM worker-service && systemctl restart worker-service",
      rollback_command: "systemctl restart worker-service.fallback || aws ec2 reboot-instances --instance-ids i-0a81f3e9b142",
      verification_check: "systemctl is-active worker-service && ps aux | grep worker-service",
      similarity: 0.98,
      last_updated: "2 days ago"
    },
    {
      id: "RUNBOOK-019",
      title: "Redis Cluster Memory Saturation & Eviction Stalled",
      category: "Memory & Cache",
      keywords: ["memory", "ram", "oom", "redis", "cache", "eviction", "leak"],
      summary: "When Redis memory exceeds 90% and eviction stalls, temporarily adjust maxmemory threshold to prevent Linux kernel OOM killer and trigger non-blocking memory purge.",
      recommended_command: "redis-cli -p 6379 config set maxmemory 14gb && redis-cli -p 6379 memory purge",
      rollback_command: "redis-cli -p 6379 config set maxmemory 12gb",
      verification_check: "redis-cli info memory | grep used_memory_human",
      similarity: 0.94,
      last_updated: "1 week ago"
    },
    {
      id: "RUNBOOK-007",
      title: "Linux Root Partition Disk Cleanup (/var/log)",
      category: "Storage & I/O",
      keywords: ["disk", "storage", "full", "space", "var", "log", "vacuum", "nginx"],
      summary: "When /var partition reaches 95%+, vacuum systemd journals to 500M and safely truncate uncompressed debug log files without releasing file descriptors improperly.",
      recommended_command: "journalctl --vacuum-size=500M && truncate -s 0 /var/log/nginx/access_debug.log",
      rollback_command: "logrotate -f /etc/logrotate.d/nginx",
      verification_check: "df -h / | awk 'NR==2 {print $5}'",
      similarity: 0.96,
      last_updated: "3 weeks ago"
    },
    {
      id: "RUNBOOK-031",
      title: "PostgreSQL Postmaster Lock Recovery After Crash",
      category: "Database & Persistence",
      keywords: ["postgres", "postgresql", "5432", "lock", "postmaster.pid", "connection refused", "crash"],
      summary: "When PostgreSQL terminates ungracefully, postmaster.pid may linger and prevent automatic restart. Verify no active postgres PID exists before safely purging the stale lock.",
      recommended_command: "rm -f /var/lib/postgresql/15/main/postmaster.pid && systemctl start postgresql",
      rollback_command: "systemctl status postgresql",
      verification_check: "pg_isready -h 127.0.0.1 -p 5432",
      similarity: 0.95,
      last_updated: "1 month ago"
    }
  ];

  const filtered = runbooks.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>SRE Knowledge Base & ChromaDB Vector Store</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
              4 Indexed SOPs
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Retrieval-Augmented Generation (RAG) vector repository indexed with Gemini text embeddings.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search runbooks by symptom, service, or keyword..."
              className="w-72 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <button 
            onClick={() => alert("ChromaDB Document Ingestion Engine: Upload PDF/Markdown runbooks to automatically chunk, embed, and store vectors.")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Runbook</span>
          </button>
        </div>
      </div>

      {/* Runbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rb) => (
          <div 
            key={rb.id}
            onClick={() => setSelectedRunbook(rb)}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {rb.id}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Similarity: <strong className="text-emerald-400">{rb.similarity}</strong>
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{rb.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{rb.summary}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-400 text-[10px] uppercase">Recommended Action:</div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 text-emerald-400 truncate">
                {rb.recommended_command}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Category: {rb.category}</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Inspect Runbook <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Runbook Detailed Inspector Modal */}
      {selectedRunbook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {selectedRunbook.id}
                </span>
                <h2 className="text-base font-bold text-white">{selectedRunbook.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedRunbook(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Procedure Context & Hypothesis</div>
              <p className="p-3 rounded-xl bg-black/40 border border-slate-800 leading-relaxed">{selectedRunbook.summary}</p>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recommended Remediation Command</div>
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-emerald-400 select-all break-all">
                {selectedRunbook.recommended_command}
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Automated Rollback Safeguard</div>
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-amber-300 select-all break-all">
                {selectedRunbook.rollback_command}
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Post-Action Health Verification</div>
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-sky-300 select-all break-all">
                {selectedRunbook.verification_check}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedRunbook(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Close Runbook
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
