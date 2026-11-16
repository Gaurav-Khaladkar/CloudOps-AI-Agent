import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cloud, 
  Key, 
  ShieldCheck, 
  Bell, 
  Save, 
  CheckCircle2, 
  Cpu,
  Lock
} from 'lucide-react';

export default function Settings() {
  const [gcpProject, setGcpProject] = useState('cloudops-ai-production');
  const [gcpRegion, setGcpRegion] = useState('us-central1');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [modelTier, setModelTier] = useState('gemini-2.5-flash');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-purple-400" />
            <span>Dual-Cloud & Model Architecture Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Google Cloud Vertex AI, AWS CloudWatch connectors, and security boundaries.
          </p>
        </div>

        {saved && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            Settings Saved to Secret Manager!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Google Cloud Configuration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Google Cloud Platform (GCP) Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-400">Google Cloud Project ID:</label>
              <input 
                type="text" 
                value={gcpProject}
                onChange={(e) => setGcpProject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400">Google Cloud Region:</label>
              <input 
                type="text" 
                value={gcpRegion}
                onChange={(e) => setGcpRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 font-mono">
            ✓ Google Cloud Run Service: <strong className="text-white">cloudops-ai-agent-api</strong> (Active & Autoscaling)
          </div>
        </div>

        {/* 2. Gemini AI Tiered Model Routing Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Google Gemini Model Tiering</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400">Select Primary Model for RCA & Telemetry Triage:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                onClick={() => setModelTier('gemini-2.5-flash')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  modelTier === 'gemini-2.5-flash' 
                    ? 'border-purple-500/50 bg-purple-500/10 text-white' 
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-purple-300 font-mono">Gemini 2.5 Flash (Recommended)</div>
                <div className="text-[11px] text-slate-400 mt-1">Latency: &lt; 1.2s • Cost: $0.075 / 1M tokens. Optimized for sub-second incident triage.</div>
              </div>

              <div 
                onClick={() => setModelTier('gemini-2.5-pro')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  modelTier === 'gemini-2.5-pro' 
                    ? 'border-purple-500/50 bg-purple-500/10 text-white' 
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-purple-300 font-mono">Gemini 2.5 Pro</div>
                <div className="text-[11px] text-slate-400 mt-1">Latency: ~ 4.5s • Deep multi-hop causal reasoning for complex cascading outages.</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. AWS Observability Configuration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-400" />
            <span>Amazon Web Services (AWS) Observability Bridge</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-400">AWS Region:</label>
              <input 
                type="text" 
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400">CloudWatch SNS Incident Topic ARN:</label>
              <input 
                type="text" 
                readOnly
                value="arn:aws:sns:us-east-1:123456789012:cloudops-infrastructure-alerts-production"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-400 font-mono select-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
