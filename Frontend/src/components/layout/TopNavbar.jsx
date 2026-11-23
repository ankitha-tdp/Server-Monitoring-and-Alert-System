import React, { useState, useEffect, useRef } from 'react';
import { Activity, LogOut, Plus, Bell } from 'lucide-react';

export default function TopNavbar({
  currentUser,
  handleLogout,
  onOpenAddModal,
  alerts = [],
  onMarkAllRead
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const isAdmin = currentUser?.role === 'admin';
  const unreadCount = alerts.filter((a) => a.unread).length;
  const userLabel =
    currentUser?.email ||
    (currentUser?.username ? `${currentUser.username}@syspulse.dev` : 'user@syspulse.dev');

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Mode Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">SysPulse</span>
            <span
              className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
                isAdmin
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isAdmin ? 'Admin Control Plane' : 'Telemetry & Alerting'}
            </span>
          </div>
        </div>

        {/* Right: Live Pill, Bell, + Add Device, User Pill, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>InfluxDB Live (10s)</span>
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
              title="Dispatched Email Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-[11px] font-mono uppercase tracking-wider text-slate-300">
                    Dispatched Email Alerts
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAllRead?.();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      No dispatched email alerts.
                    </div>
                  ) : (
                    alerts.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-white">{item.deviceName}</span>
                          <span className="text-slate-500">{item.timeAgo}</span>
                        </div>
                        <div className="text-amber-400 font-medium">{item.message}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Emailed to: {item.recipient}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{userLabel}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-all"
            title="Logout / Switch Role"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout / Switch Role</span>
          </button>
        </div>
      </div>
    </header>
  );
}