import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, Users, Shield, Database, Monitor, Wifi, WifiOff, Trash2, User, Layers, LogOut, Bell, AlertTriangle } from 'lucide-react';
import TelemetryGrid from '../components/telemetry/TelemetryGrid';

export default function AdminDashboard({
  currentUser,
  users,
  devices,
  adminTab,
  setAdminTab,
  globalInfluxHistory,
  handleToggleUserStatus,
  handleDeleteUser,
  handleToggleDeviceStatus,
  handleLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
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

  const onlineDevicesCount = devices.filter((d) => d.status === 'online').length;
  const ingestionRate = onlineDevicesCount * 14;

  const handleMarkAllRead = () => {
    setNotificationsRead(true);
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-amber-500/15 border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">SysPulse</span>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded border bg-amber-500/15 border-amber-500/30 text-amber-400">
                  Admin Control Plane
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Button */}
            <div className="relative" ref={notificationRef}>
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {!notificationsRead && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 text-xs space-y-2">
                  <div className="font-semibold text-white border-b border-slate-800 pb-1.5 flex justify-between items-center">
                    <span>Admin Security Log</span>
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-amber-400 hover:underline font-mono text-[11px]"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="text-slate-300 py-1">All SQLite user tokens valid. InfluxDB write proxy healthy.</div>
                  <div className="text-slate-500 text-[10px]">Port 8086 • Port 5000</div>
                </div>
              )}
            </div>

            {/* Alert Button */}
            <button 
              type="button"
              onClick={() => alert(`Admin Fleet Check: ${onlineDevicesCount} of ${devices.length} edge nodes online.`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alerts (0)</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Logged in as</span>
              <span className="font-mono font-semibold text-white">{currentUser.username}</span>
            </div>

            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout / Switch Role</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Administration & Central Server</h1>
            <p className="text-sm text-slate-400">System-wide oversight of registered SQLite users, deployed edge agents, and InfluxDB ingestion</p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            {[
              { id: 'overview', label: 'Global Telemetry', icon: Layers },
              { id: 'users', label: `Users (${users.length})`, icon: Users },
              { id: 'devices', label: `All Devices (${devices.length})`, icon: Server }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} type="button" onClick={() => setAdminTab(tab.id)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${adminTab === tab.id ? 'bg-amber-500 text-slate-950 font-semibold shadow' : 'text-slate-400 hover:text-white'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>TOTAL REGISTERED USERS</span><Users className="w-4 h-4 text-amber-400" /></div>
            <div className="text-3xl font-bold font-mono text-white">{users.length}</div>
            <div className="text-xs text-slate-400 mt-1">{users.filter((u) => u.role === 'admin').length} Admin • {users.filter((u) => u.role === 'user').length} Standard Users</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>ACTIVE TARGET DEVICES</span><Monitor className="w-4 h-4 text-emerald-400" /></div>
            <div className="text-3xl font-bold font-mono text-white">{onlineDevicesCount} <span className="text-sm font-normal text-slate-500">/ {devices.length}</span></div>
            <div className="text-xs text-emerald-400 mt-1">Telegraf Windows Services Active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>INFLUXDB INGESTION RATE</span><Database className="w-4 h-4 text-cyan-400" /></div>
            <div className="text-3xl font-bold font-mono text-white">{ingestionRate} <span className="text-sm font-normal text-slate-400">pts/s</span></div>
            <div className="text-xs text-slate-400 mt-1">HTTP Write API • Port 8086</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>CENTRAL SERVER STATUS</span><Activity className="w-4 h-4 text-emerald-400" /></div>
            <div className="text-2xl font-bold font-mono text-emerald-400">HEALTHY</div>
            <div className="text-xs text-slate-400 mt-2">SQLite WAL + Express Proxy OK</div>
          </div>
        </div>

        {adminTab === 'overview' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Global Fleet Telemetry Aggregation (Central InfluxDB)</h2>
              <p className="text-xs text-slate-400">Mean CPU, Memory, and Disk I/O across all online remote Windows target machines</p>
            </div>

            <TelemetryGrid data={globalInfluxHistory} />
          </div>
        )}

        {(adminTab === 'overview' || adminTab === 'users') && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Registered Users (SQLite Directory)</h2>
                <p className="text-xs text-slate-400">Manage user roles, account status, and associated device counts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Devices</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {users.map((u) => {
                    const userDevCount = devices.filter((d) => d.userId === u.id).length;
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{u.username}</div>
                          <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border ${u.role === 'admin' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{userDevCount} node(s)</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{u.createdAt}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isSelf ? (
                            <span className="text-xs font-mono text-slate-500">Current Session</span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button type="button" onClick={() => handleToggleUserStatus(u.id)} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors">
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button type="button" onClick={() => handleDeleteUser(u.id)} title="Delete" className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(adminTab === 'overview' || adminTab === 'devices') && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Global Edge Device Fleet</h2>
                <p className="text-xs text-slate-400">All Windows Telegraf agents pushing telemetry to InfluxDB</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3 px-4">Device / ID</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">OS & IP</th>
                    <th className="py-3 px-4">Live Metrics</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Simulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{dev.name}</div>
                        <div className="text-xs font-mono text-slate-500">{dev.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">@{dev.ownerName}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-300">{dev.os}</div>
                        <div className="text-xs font-mono text-slate-500">{dev.ip}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {dev.status === 'online' ? (
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400">CPU {dev.cpu}%</span>
                            <span className="text-cyan-400">RAM {dev.ram}%</span>
                            <span className="text-amber-400">DSK {dev.disk}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No telemetry stream</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {dev.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button type="button" onClick={() => handleToggleDeviceStatus(dev.id)} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors">
                          {dev.status === 'online' ? 'Simulate Offline' : 'Bring Online'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
