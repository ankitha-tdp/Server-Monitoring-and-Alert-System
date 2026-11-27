import React, { useState } from 'react';

const stopAgentCommand = 'Stop-Service -Name "telegraf" -Force';

export default function DeleteDeviceModal({
  isOpen,
  onClose,
  onConfirm,
  deviceName,
  loading,
  error
}) {
  const [commandCopied, setCommandCopied] = useState(false);

  async function handleCopyStopCommand() {
    await navigator.clipboard.writeText(stopAgentCommand);
    setCommandCopied(true);
    setTimeout(() => setCommandCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            Delete Device?
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Are you sure you want to delete{' '}
            <span className="text-white font-semibold">
              {deviceName}
            </span>
            ?
          </p>

          <p className="text-xs text-red-400 mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2">
          <p className="text-xs text-slate-300">
            Before deleting, stop the Telegraf agent on this device.
          </p>

          <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded px-3 py-2">
            <code className="text-xs text-amber-400 font-mono truncate">
              {stopAgentCommand}
            </code>
            <button
              type="button"
              onClick={handleCopyStopCommand}
              className="shrink-0 px-2 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {commandCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Run this command on the device itself, not on the dashboard.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Device'}
          </button>
        </div>
      </div>
    </div>
  );
}
