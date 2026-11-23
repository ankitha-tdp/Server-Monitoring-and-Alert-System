import React from 'react';
import { Mail, Plus, Trash2 } from 'lucide-react';

export default function AlertRulesPanel({
  rules = [],
  onOpenRuleModal,
  onToggleRule,
  onDeleteRule
}) {
  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Configured Email Notification Rules</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated emails trigger when InfluxDB metrics breach thresholds beyond the cooldown window.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRuleModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium shrink-0 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New Alert Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold font-mono text-xs text-white truncate">
                  {rule.deviceName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-400">
                  {rule.metricLabel} &gt; {rule.threshold}%
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {rule.recipient} • Cooldown: {rule.cooldown}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={rule.enabled}
                onClick={() => onToggleRule(rule.id)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  rule.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title={rule.enabled ? 'Disable rule' : 'Enable rule'}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onDeleteRule(rule.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Delete alert rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}