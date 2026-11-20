import React from 'react';
import { Plus, Search } from 'lucide-react';

export default function DeviceSidebar({
  devices = [],
  totalCount = 0,
  onlineCount = 0,
  alertCount = 0,
  selectedDeviceId,
  onSelectDevice,
  searchQuery = '',
  onSearchChange,
  filter = 'all',
  onFilterChange,
  onOpenAddModal,
  isAlertDevice = () => false
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white">Target Fleet</h2>
          <p className="text-[11px] text-slate-400">Select node to inspect metrics</p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-medium"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, device_id, IP..."
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[11px] font-medium">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={py-1.5 rounded-lg border transition-colors }
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('online')}
          className={py-1.5 rounded-lg border transition-colors }
        >
          Online ({onlineCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('alert')}
          className={py-1.5 rounded-lg border transition-colors }
        >
          Alert ({alertCount})
        </button>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
        {devices.map((dev) => {
          const isSelected = dev.id === selectedDeviceId;
          const devAlert = isAlertDevice(dev);
          return (
            <button
              key={dev.id}
              type="button"
              onClick={() => onSelectDevice(dev.id)}
              className={w-full text-left p-3 rounded-xl border transition-all }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs truncate">{dev.name}</span>
                <span
                  className={inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full }
                >
                  {dev.status !== 'online' ? 'offline' : devAlert ? 'warning' : 'online'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span className="truncate">{dev.id}</span>
                <span>{dev.ip}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
