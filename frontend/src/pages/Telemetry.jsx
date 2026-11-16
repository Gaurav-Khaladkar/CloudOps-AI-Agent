import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  HardDrive, 
  Cpu, 
  Zap, 
  AlertCircle 
} from 'lucide-react';

export default function Telemetry() {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedNode, setSelectedNode] = useState('i-0a81f3e9b142');

  // Simulated continuous high-resolution telemetry points
  const cpuPoints = [32, 38, 42, 45, 48, 52, 60, 78, 89, 94, 96, 96.8];
  const memPoints = [54, 55, 56, 57, 58, 59, 60, 61, 61.5, 62, 62.4, 62.4];
  const p99Points = [42, 45, 48, 55, 70, 95, 140, 220, 290, 320, 340, 342];
  const diskPoints = [39, 39, 39.5, 40, 40, 40.5, 40.5, 41, 41, 41, 41, 41];

  const renderSparkline = (points, strokeColor, fillColor, maxY = 100, unit = '%', hasThreshold = true) => {
    const width = 360;
    const height = 90;
    const step = width / (points.length - 1);

    const coords = points.map((p, i) => {
      const x = i * step;
      const y = height - (p / maxY) * height;
      return `${x},${y}`;
    });

    const pathD = `M ${coords.join(' L ')}`;
    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    const thresholdY = height - (90 / maxY) * height;

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id={`grad-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 90% Threshold line if applicable */}
          {hasThreshold && (
            <line 
              x1="0" 
              y1={thresholdY} 
              x2={width} 
              y2={thresholdY} 
              stroke="#ef4444" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
              opacity="0.6" 
            />
          )}

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${strokeColor})`} />

          {/* Stroke path */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Highlight end point */}
          <circle 
            cx={width} 
            cy={height - (points[points.length - 1] / maxY) * height} 
            r="4" 
            fill={strokeColor} 
            className="animate-ping" 
          />
          <circle 
            cx={width} 
            cy={height - (points[points.length - 1] / maxY) * height} 
            r="3" 
            fill={strokeColor} 
          />
        </svg>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
          <span>-60m ago</span>
          <span>-30m ago</span>
          <span>-15m ago</span>
          <span className="text-white font-bold">Now: {points[points.length - 1]}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <span>Deep Telemetry & Observability</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">High-frequency sub-second metric streams with CloudWatch composite threshold alarm overlays.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500/50"
          >
            <option value="i-0a81f3e9b142">prod-worker-01 (i-0a81f3e9b142)</option>
            <option value="i-07c8914b99aa">redis-cluster-node-02 (i-07c8914b)</option>
            <option value="i-038f9210ee44">nginx-ingress-prod-01 (i-038f9210)</option>
            <option value="i-05ba2919aa33">postgres-primary-01 (i-05ba2919)</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {['15m', '1h', '6h', '24h'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  timeRange === t ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. CPU Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white">CPU Utilization (% Across 4 vCPUs)</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">96.8% (CRITICAL)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            CloudWatch Alarm: <code className="text-rose-400">cpu-utilization-breach-95%</code> triggered 2m ago.
          </div>
          {renderSparkline(cpuPoints, '#fbbf24', '#f59e0b', 100, '%', true)}
        </div>

        {/* 2. Memory Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-white">Memory (RAM Consumption)</span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400">62.4% (9.98 GB / 16.0 GB)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Linux Kernel buffer/cache healthy: 5.1 GB active caching.
          </div>
          {renderSparkline(memPoints, '#38bdf8', '#0284c7', 100, '%', false)}
        </div>

        {/* 3. P99 Response Latency */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-white">P99 Latency (CloudWatch Synthetics)</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">342 ms (Elevated)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Baseline: 45 ms. Degraded due to socket poll contention in worker thread pool.
          </div>
          {renderSparkline(p99Points, '#c084fc', '#9333ea', 400, ' ms', false)}
        </div>

        {/* 4. Disk Usage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Root Filesystem (/dev/nvme0n1p1)</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">41.0% (41 GB / 100 GB)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Inode capacity at 18.2%. Storage operating in safe bounds.
          </div>
          {renderSparkline(diskPoints, '#34d399', '#059669', 100, '%', false)}
        </div>

      </div>

    </div>
  );
}
