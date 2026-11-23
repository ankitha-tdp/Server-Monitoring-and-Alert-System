import React from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function AddDeviceModal({
  isOpen,
  onClose,
  newDeviceName,
  setNewDeviceName,
  newDeviceOs,
  setNewDeviceOs,
  generatedDevice,
  setGeneratedDevice,
  setupScript = '',
  copiedCmd,
  onSubmit,
  getPowerShellCommand,
  onCopyCommand,
}) {
  if (!isOpen) return null;

  const isWindowsSelected = newDeviceOs?.toLowerCase().includes('windows');
  const isLinuxSelected = newDeviceOs?.toLowerCase().includes('linux');

  const scriptOutput =
    setupScript ||
    generatedDevice?.setup_script ||
    getPowerShellCommand?.(generatedDevice) ||
    '';

  const handleClose = () => {
    setGeneratedDevice?.(null);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-white">Register New Target Device</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Backend automatically provisions a unique device_id and Telegraf installer.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!generatedDevice ? (
          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Device Display Name
              </label>
              <input
                type="text"
                required
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Home Lab Server or Workstation-02"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Target Operating System
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewDeviceOs('Windows 11 Pro (x64)')}
                  className={`py-2.5 px-3 rounded-xl border font-medium transition-all ${
                    isWindowsSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Windows (PowerShell)
                </button>
                <button
                  type="button"
                  onClick={() => setNewDeviceOs('Linux Ubuntu 22.04')}
                  className={`py-2.5 px-3 rounded-xl border font-medium transition-all ${
                    isLinuxSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Linux (Bash)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
              >
                Register Device
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 whitespace-pre-wrap break-words max-h-64 overflow-y-auto leading-relaxed">
              <code>{scriptOutput}</code>
            </pre>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onCopyCommand}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}