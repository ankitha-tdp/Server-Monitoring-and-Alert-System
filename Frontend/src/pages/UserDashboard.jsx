import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Server,
  Plus,
  LogOut,
  Terminal,
  Copy,
  Check,
  Monitor,
  X,
  RefreshCw,
  Bell,
  AlertTriangle,
  Search,
  Mail,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import TelemetryGrid from '../components/telemetry/TelemetryGrid';

const DEFAULT_ALERTS = [
  {
    id: 'n1',
    deviceName: 'PROD-API-01',
    message: 'CPU Utilization reached 87.4% (Limit: 85%)',
    recipient: 'user@syspulse.dev',
    timeAgo: '3 mins ago',
    unread: true
  },
  {
    id: 'n2',
    deviceName: 'GPU-WORKER-01',
    message: 'CPU Utilization reached 91.2% (Limit: 85%)',
    recipient: 'ops-alerts@syspulse.dev',
    timeAgo: '19 mins ago',
    unread: true
  },
  {
    id: 'n3',
    deviceName: 'EDGE-GATEWAY-04',
    message: 'Heartbeat Offline reached Timeout (Limit: 60s)',
    recipient: 'user@syspulse.dev',
    timeAgo: '1 hour ago',
    unread: false
  }
];

const DEFAULT_RULES = [
  {
    id: 'r1',
    deviceName: 'DESKTOP-DEV01',
    metricLabel: 'CPU Utilization',
    metricKey: 'cpu',
    threshold: 80,
    recipient: 'user@syspulse.dev',
    cooldown: '15 mins',
    enabled: true
  },
  {
    id: 'r2',
    deviceName: 'DESKTOP-DEV01',
    metricLabel: 'Memory (RAM)',
    metricKey: 'ram',
    threshold: 85,
    recipient: 'user@syspulse.dev',
    cooldown: '1 hour',
    enabled: true
  },
  {
    id: 'r3',
    deviceName: 'PROD-API-01',
    metricLabel: 'CPU Utilization',
    metricKey: 'cpu',
    threshold: 85,
    recipient: 'user@syspulse.dev',
    cooldown: '15 mins',
    enabled: true
  },
  {
    id: 'r4',
    deviceName: 'GPU-WORKER-01',
    metricLabel: 'Memory (RAM)',
    metricKey: 'ram',
    threshold: 90,
    recipient: 'ops-alerts@syspulse.dev',
    cooldown: '30 mins',
    enabled: true
  }
];

export default function UserDashboard({
  currentUser,
  devices = [],
  selectedDeviceId,
  setSelectedDeviceId,
  deviceHistory = {},
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
  handleLogout,
  alertRules,
  setAlertRules,
  dispatchedAlerts,
  setDispatchedAlerts
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [fleetFilter, setFleetFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [localRules, setLocalRules] = useState(DEFAULT_RULES);
  const [localAlerts, setLocalAlerts] = useState(DEFAULT_ALERTS);

  const rules = alertRules ?? localRules;
  const setRules = setAlertRules ?? setLocalRules;
  const alerts = dispatchedAlerts ?? localAlerts;
  const setAlerts = setDispatchedAlerts ?? setLocalAlerts;

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [ruleDeviceName, setRuleDeviceName] = useState('');
  const [ruleMetric, setRuleMetric] = useState('cpu');
  const [ruleThreshold, setRuleThreshold] = useState(85);
  const [ruleEmail, setRuleEmail] = useState(currentUser?.email || 'user@syspulse.dev');
  const [ruleCooldown, setRuleCooldown] = useState('15 minutes');

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

  const myDevices = devices.filter((d) => d.userId === currentUser?.id);
  const fleetSource = myDevices.length > 0 ? myDevices : devices;

  const isDeviceAlert = (d) => d.status !== 'online' || d.cpu > 80 || d.ram > 85;
  const onlineCount = fleetSource.filter((d) => d.status === 'online').length;
  const warningCount = fleetSource.filter(isDeviceAlert).length;

  const filteredFleet = fleetSource.filter((dev) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      dev.name?.toLowerCase().includes(q) ||
      dev.id?.toLowerCase().includes(q) ||
      dev.ip?.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (fleetFilter === 'online') return dev.status === 'online';
    if (fleetFilter === 'alert') return isDeviceAlert(dev);
    return true;
  });

  const activeDevice =
    filteredFleet.find((d) => d.id === selectedDeviceId) ||
    fleetSource.find((d) => d.id === selectedDeviceId) ||
    filteredFleet[0] ||
    fleetSource[0] ||
    null;

  const activeSeries = activeDevice ? deviceHistory[activeDevice.id] || [] : [];
  const unreadCount = alerts.filter((a) => a.unread).length;

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
    setShowNotifications(false);
  };

  const openAlertModal = () => {
    setRuleDeviceName(activeDevice?.name || fleetSource[0]?.name || 'DESKTOP-DEV01');
    setRuleMetric('cpu');
    setRuleThreshold(85);
    setRuleEmail(currentUser?.email || 'user@syspulse.dev');
    setRuleCooldown('15 minutes');
    setIsAlertModalOpen(true);
  };

  const handleSaveAlertRule = (e) => {
    e.preventDefault();
    const metricLabel =
      ruleMetric === 'cpu' ? 'CPU Utilization' : ruleMetric === 'ram' ? 'Memory (RAM)' : 'Disk I/O';
    const newRule = {
      id: `rule_${Date.now()}`,
      deviceName: ruleDeviceName,
      metricLabel,
      metricKey: ruleMetric,
      threshold: Number(ruleThreshold) || 85,
      recipient: ruleEmail.trim() || 'user@syspulse.dev',
      cooldown: ruleCooldown,
      enabled: true
    };
    setRules((prev) => [newRule, ...prev]);
    setIsAlertModalOpen(false);
  };

  const toggleRuleEnabled = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (ruleId) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const deviceThresholds = rules.reduce((acc, r) => {
    if (r.enabled && activeDevice && r.deviceName === activeDevice.name) {
      acc[r.metricKey] = r.threshold;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">SysPulse</span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
                Telemetry & Alerting
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>InfluxDB Live (10s)</span>
            </div>

            {/* Notification Bell + Dispatched Email Alerts Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Dispatched Email Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className=" -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center">
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
                      onClick={handleMarkAllRead}
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

            <button
              type="button"
              onClick={() => {
                setGeneratedDevice?.(null);
                setNewDeviceName?.('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
            </button>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentUser?.email || `${currentUser?.username}@syspulse.dev`}</span>
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

      {/* Top 3 KPI Summary Cards */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Total Devices
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-white">{fleetSource.length}</span>
                <span className="text-xs text-slate-400">registered nodes</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300">
              <Server className="w-4 h-4" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                Online / Healthy
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-emerald-400">{onlineCount}</span>
                <span className="text-xs text-slate-400">within limits</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                Warning / Offline
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-amber-400">{warningCount}</span>
                <span className="text-xs text-slate-400">needs attention</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Fleet + Telemetry + Alert Rules Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar: Target Fleet */}
          <aside className="w-full lg:w-72 shrink-0 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">Target Fleet</h2>
                <p className="text-[11px] text-slate-400">Select node to inspect metrics</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGeneratedDevice?.(null);
                  setNewDeviceName?.('');
                  setIsAddModalOpen(true);
                }}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, device_id, IP..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setFleetFilter('all')}
                className={`py-1.5 rounded-lg border transition-colors ${
                  fleetFilter === 'all'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                All ({fleetSource.length})
              </button>
              <button
                type="button"
                onClick={() => setFleetFilter('online')}
                className={`py-1.5 rounded-lg border transition-colors ${
                  fleetFilter === 'online'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Online ({onlineCount})
              </button>
              <button
                type="button"
                onClick={() => setFleetFilter('alert')}
                className={`py-1.5 rounded-lg border transition-colors ${
                  fleetFilter === 'alert'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Alert ({warningCount})
              </button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
              {filteredFleet.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  No matching devices.
                </div>
              ) : (
                filteredFleet.map((dev) => {
                  const isSelected = activeDevice?.id === dev.id;
                  const devAlert = isDeviceAlert(dev);
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setSelectedDeviceId?.(dev.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-slate-600 text-white'
                          : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs truncate">{dev.name}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            dev.status !== 'online'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : devAlert
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dev.status !== 'online'
                                ? 'bg-rose-400'
                                : devAlert
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          {dev.status !== 'online' ? 'offline' : devAlert ? 'warning' : 'online'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
                        <span className="truncate">{dev.id}</span>
                        <span>{dev.ip}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-slate-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9px]">CPU</span>
                          <span className="text-slate-200">{dev.cpu}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">RAM</span>
                          <span className="text-slate-200">{dev.ram}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">DISK</span>
                          <span className="text-slate-200">{dev.disk}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Main Panel: Active Device + 3 Telemetry Charts + Configured Alert Rules */}
          <div className="flex-1 w-full space-y-6">
            {activeDevice ? (
              <>
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-bold text-white tracking-tight">{activeDevice.name}</h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {activeDevice.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                        device_id: {activeDevice.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {activeDevice.os} • Host IP: {activeDevice.ip} • Bucket: hardware-metrics
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAlertModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium shrink-0 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Add Email Alert</span>
                  </button>
                </div>

                <TelemetryGrid data={activeSeries} thresholds={deviceThresholds} />
              </>
            ) : (
              <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <Monitor className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No Devices Registered Yet</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Click "+ Add Device" to register a target device and generate its Telegraf installer command.
                </p>
              </div>
            )}

            {/* Configured Email Notification Rules */}
            <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      Configured Email Notification Rules
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated emails trigger when InfluxDB metrics breach thresholds beyond the cooldown window.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAlertModal}
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
                        onClick={() => toggleRuleEnabled(rule.id)}
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
                        onClick={() => deleteRule(rule.id)}
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
          </div>
        </div>
      </main>

      {/* Modal 1: Register New Target Device */}
      {isAddModalOpen && (
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
                onClick={() => {
                  setIsAddModalOpen(false);
                  setGeneratedDevice?.(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!generatedDevice ? (
              <form onSubmit={handleCreateDevice} className="space-y-4 text-xs">
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
                        newDeviceOs?.toLowerCase().includes('windows')
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Windows (PowerShell)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDeviceOs('Linux Ubuntu 22.04')}
                      className={`py-2.5 px-3 rounded-xl border font-medium transition-all ${
                        !newDeviceOs?.toLowerCase().includes('windows')
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Linux (Bash)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-emerald-400 font-semibold">Auto-ID Provisioning:</span>{' '}
                  Submitting provisions a unique <code className="text-slate-200 font-mono">device_id</code> tag and generates the agent setup command.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Device <strong>{generatedDevice.name}</strong> registered with ID{' '}
                  <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                    {generatedDevice.id}
                  </code>
                  .
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300 break-all leading-relaxed">
                  {getPowerShellCommand?.(generatedDevice)}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all"
                  >
                    {copiedCmd ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setGeneratedDevice?.(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Configure Email Alert Rule */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base text-white">Configure Email Alert Rule</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlertRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Target Device</label>
                <select
                  value={ruleDeviceName}
                  onChange={(e) => setRuleDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  {fleetSource.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.id})
                    </option>
                  ))}
                  {!fleetSource.some((d) => d.name === 'DESKTOP-DEV01') && (
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
                <label className="block font-medium text-slate-300 mb-1.5">
                  Notification Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={ruleEmail}
                  onChange={(e) => setRuleEmail(e.target.value)}
                  placeholder="user@syspulse.dev"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Email Cooldown Window
                </label>
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
                  onClick={() => setIsAlertModalOpen(false)}
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
      )}
    </div>
  );
}