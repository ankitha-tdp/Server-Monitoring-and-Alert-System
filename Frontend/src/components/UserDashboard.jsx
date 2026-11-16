import React from 'react';
import { Activity, Server, Cpu, HardDrive, Plus, LogOut, Terminal, Copy, Check, Monitor, X, RefreshCw } from 'lucide-react';
import TelemetryLineChart from './TelemetryLineChart';

export default function UserDashboard({
  currentUser,
  devices,
  selectedDeviceId,
  setSelectedDeviceId,
  deviceHistory,
  isAddModalOpen,
  setIsAddModalOpen,
  newDeviceName,
  setNewDeviceName,
  newDeviceOs,
  setNewDeviceOs,
  generatedDevice,
  setGeneratedDevice,
  copiedCmd,
  handleCreateDevice,
  getPowerShellCommand,
  handleCopyCommand,
  handleLogout
}) {
  const myDevices = devices.filter((d) => d.userId === currentUser.id);
  const activeDevice = myDevices.find((d) => d.id === selectedDeviceId) || myDevices[0] || null;
  const activeSeries = activeDevice ? deviceHistory[activeDevice.id] || [] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">SysPulse</span>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
                  User Telemetry Workspace
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Logged in as</span>
              <span className="font-mono font-semibold text-white">{currentUser.username}</span>
            </div>

            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout / Switch Role</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Target Devices</h1>
            <p className="text-sm text-slate-400">Real-time Telegraf metrics streamed every 10s from InfluxDB</p>
          </div>

          <button onClick={() => { setGeneratedDevice(null); setNewDeviceName(''); setIsAddModalOpen(true); }} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/10 transition-all">
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>

        {myDevices.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Monitor className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No Devices Registered Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Click "+ Add Device" to register your Windows laptop and generate your one-line PowerShell Telegraf installer.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDevices.map((dev) => {
                const isSelected = activeDevice && dev.id === activeDevice.id;
                return (
                  <button key={dev.id} onClick={() => setSelectedDeviceId(dev.id)} className={`text-left p-4 rounded-2xl border transition-all ${isSelected ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm text-white">{dev.name}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        {dev.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-3 font-mono">{dev.os} • {dev.ip}</div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <div><span className="text-slate-500 block text-[10px]">CPU</span><span className="text-emerald-400 font-semibold">{dev.cpu}%</span></div>
                      <div><span className="text-slate-500 block text-[10px]">RAM</span><span className="text-cyan-400 font-semibold">{dev.ram}%</span></div>
                      <div><span className="text-slate-500 block text-[10px]">DISK I/O</span><span className="text-amber-400 font-semibold">{dev.disk}%</span></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeDevice && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>CPU UTILIZATION</span><Cpu className="w-4 h-4 text-emerald-400" /></div>
                    <div className="text-3xl font-bold font-mono text-white">{activeDevice.cpu}%</div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${activeDevice.cpu}%` }} />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>MEMORY (RAM)</span><Server className="w-4 h-4 text-cyan-400" /></div>
                    <div className="text-3xl font-bold font-mono text-white">{activeDevice.ram}%</div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${activeDevice.ram}%` }} />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>DISK I/O LOAD</span><HardDrive className="w-4 h-4 text-amber-400" /></div>
                    <div className="text-3xl font-bold font-mono text-white">{activeDevice.disk}%</div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${activeDevice.disk}%` }} />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2"><span>TELEGRAF TAGS</span><Terminal className="w-4 h-4 text-purple-400" /></div>
                    <div className="text-xs font-mono text-slate-300 space-y-1 mt-1">
                      <div className="truncate"><span className="text-slate-500">device_id:</span> {activeDevice.id}</div>
                      <div className="truncate"><span className="text-slate-500">user_id:</span> {currentUser.id}</div>
                      <div><span className="text-slate-500">uptime:</span> {activeDevice.uptime}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">Live Hardware Telemetry — {activeDevice.name}</h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Streaming
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">InfluxDB Bucket: <span className="font-mono text-slate-300">telegraf_metrics</span></p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />CPU (%)</span>
                      <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />RAM (%)</span>
                      <span className="flex items-center gap-1.5 text-slate-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Disk I/O (%)</span>
                    </div>
                  </div>

                  <TelemetryLineChart data={activeSeries} height={260} metrics={[{ key: 'cpu', color: '#34d399' }, { key: 'ram', color: '#22d3ee' }, { key: 'disk', color: '#fbbf24' }]} />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Register Remote Target Device</h3>
                  <p className="text-xs text-slate-400">Generates a customized Windows Telegraf background service script</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>

            {!generatedDevice ? (
              <form onSubmit={handleCreateDevice} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Device Hostname / Label</label>
                  <input type="text" required value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} placeholder="e.g. LAPTOP-GAMING-02" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Operating System</label>
                  <select value={newDeviceOs} onChange={(e) => setNewDeviceOs(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white focus:outline-none">
                    <option value="Windows 11 Pro (x64)">Windows 11 Pro (x64)</option>
                    <option value="Windows 11 Home (x64)">Windows 11 Home (x64)</option>
                    <option value="Windows 10 Enterprise (x64)">Windows 10 Enterprise (x64)</option>
                    <option value="Windows Server 2022">Windows Server 2022</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold">Register & Generate Script</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  Device <strong>{generatedDevice.name}</strong> registered in SQLite with ID <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded">{generatedDevice.id}</code>.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Run this 1-line command in PowerShell (as Administrator):</label>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all leading-relaxed">
                    {getPowerShellCommand(generatedDevice)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handleCopyCommand} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all">
                    {copiedCmd ? <><Check className="w-4 h-4" /><span>Copied!</span></> : <><Copy className="w-4 h-4" /><span>Copy Command</span></>}
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium">Done & View Live Charts</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}