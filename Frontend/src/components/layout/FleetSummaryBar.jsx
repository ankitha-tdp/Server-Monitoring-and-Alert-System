import React from 'react';
import { Server, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FleetSummaryBar({ total = 0, online = 0, warning = 0 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Devices</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{total}</span>
            <span className="text-xs text-slate-400">registered nodes</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300">
          <Server className="w-4 h-4" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Online / Healthy</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{online}</span>
            <span className="text-xs text-slate-400">within limits</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Warning / Offline</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">{warning}</span>
            <span className="text-xs text-slate-400">needs attention</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
