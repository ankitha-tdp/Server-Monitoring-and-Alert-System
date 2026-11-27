
import React from 'react';

export default function DeleteDeviceModal({
  isOpen,
  onClose,
  onConfirm,
  deviceName,
  loading,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">

        <div>
          <h2 className="text-lg font-bold text-white">
            Delete Device?
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Are you sure you want to delete
            {' '}
            <span className="text-white font-semibold">
              {deviceName}
            </span>
            ?
          </p>

          <p className="text-xs text-red-400 mt-2">
            This action cannot be undone.
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
