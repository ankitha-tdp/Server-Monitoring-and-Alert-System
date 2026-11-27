
import React from 'react';

export default function EditDeviceModal({
  isOpen,
  onClose,
  deviceName,
  setDeviceName,
  deviceOs,
  setDeviceOs,
  onSubmit,
  loading,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">

        <div>
          <h2 className="text-lg font-bold text-white">
            Edit Device
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Update your device information.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Enter device name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Operating System
            </label>
            <select
              value={deviceOs}
              onChange={(e) => setDeviceOs(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
