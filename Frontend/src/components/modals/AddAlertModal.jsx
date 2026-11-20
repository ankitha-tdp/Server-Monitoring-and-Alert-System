import React from 'react';
import { Mail, X } from 'lucide-react';

export default function AddAlertModal({
  isOpen,
  onClose,
  devices = [],
  ruleDeviceName,
  setRuleDeviceName,
  ruleMetric,
  setRuleMetric,
  ruleThreshold,
  setRuleThreshold,
  ruleEmail,
  setRuleEmail,
  ruleCooldown,
  setRuleCooldown,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-base text-white">Configure Email Alert Rule</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Target Device</label>
            <select
              value={ruleDeviceName}
              onChange={(e) => setRuleDeviceName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              {devices.length > 0 ? (
                devices.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.id})
                  </option>
                ))
              ) : (
                <option value="DESKTOP-DEV01">DESKTOP-DEV01</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Hardware Metric</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'cpu', label: 'CPU (%)' },
                { key: 'ram', label: 'RAM (%)' },
                { key: 'disk', label: 'Disk (%)' }
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setRuleMetric(m.key)}
                  className={`py-2 px-3 rounded-xl border font-medium transition-all ${
                    ruleMetric === m.key
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-300">Trigger Threshold (%)</label>
              <span className="font-mono font-bold text-amber-400">&gt; {ruleThreshold}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="99"
                value={ruleThreshold}
                onChange={(e) => setRuleThreshold(Number(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="99"
                value={ruleThreshold}
                onChange={(e) => setRuleThreshold(Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-center text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Notification Recipient Email</label>
            <input
              type="email"
              required
              value={ruleEmail}
              onChange={(e) => setRuleEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Email Cooldown Window</label>
            <select
              value={ruleCooldown}
              onChange={(e) => setRuleCooldown(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="5 minutes">5 minutes</option>
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
            >
              Save Alert Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}