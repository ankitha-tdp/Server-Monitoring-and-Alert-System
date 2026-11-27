import React, { useState, useEffect } from 'react';
import { Monitor, Mail } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import FleetSummaryBar from '../components/layout/FleetSummaryBar';
import DeviceSidebar from '../components/fleet/DeviceSidebar';
import TelemetryGrid from '../components/telemetry/TelemetryGrid';
import AlertRulesPanel from '../components/alerts/AlertRulesPanel';
import AddDeviceModal from '../components/modals/AddDeviceModal';
import AddAlertModal from '../components/modals/AddAlertModal';
import { createDevice } from '../api/deviceApi';
import { getDeviceTelemetry } from '../api/telemetryApi';
import { DEFAULT_ALERTS, DEFAULT_RULES } from '../data/mockData';

function parseOsSelection(osLabel = '') {
  if (osLabel.toLowerCase().includes('linux')) {
    return { os_name: 'Linux', os_version: 'Ubuntu 22.04' };
  }
  return { os_name: 'Windows', os_version: '11' };
}

function toHostname(name = '') {
  const cleaned = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || 'WORKSTATION-01';
}

function normalizeTelemetryPoints(rawPoints = []) {
  return rawPoints.map((pt, idx) => ({
    time:
      pt.time ||
      pt._time ||
      pt.timestamp ||
      new Date(Date.now() - (rawPoints.length - idx) * 10000).toLocaleTimeString(),
    cpu: Number(pt.cpu ?? pt.cpu_usage ?? pt.usage_user ?? 0),
    ram: Number(pt.ram ?? pt.mem_used_percent ?? pt.used_percent ?? 0),
    disk: Number(pt.disk ?? pt.disk_used_percent ?? 0),
  }));
}

export default function UserDashboard({
  currentUser,
  session,
  devices = [],
  setDevices,
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
  setupScript = '',
  setSetupScript,
  copiedCmd,
  setCopiedCmd,
  getPowerShellCommand,
  onCopyCommand,
  handleLogout,
  alertRules,
  setAlertRules,
  dispatchedAlerts,
  setDispatchedAlerts
}) {
  const [fleetFilter, setFleetFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [localDevices, setLocalDevices] = useState(devices);
  const [localRules, setLocalRules] = useState(DEFAULT_RULES);
  const [localAlerts, setLocalAlerts] = useState(DEFAULT_ALERTS);
  const [localScript, setLocalScript] = useState(setupScript);
  const [localCopied, setLocalCopied] = useState(false);
  const [submittingDevice, setSubmittingDevice] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  const [liveSeries, setLiveSeries] = useState([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState('');

  const deviceList = setDevices ? devices : localDevices;
  const updateDevices = setDevices ?? setLocalDevices;
  const rules = alertRules ?? localRules;
  const setRules = setAlertRules ?? setLocalRules;
  const alerts = dispatchedAlerts ?? localAlerts;
  const setAlerts = setDispatchedAlerts ?? setLocalAlerts;
  const activeScript = setSetupScript ? setupScript : localScript;
  const updateScript = setSetupScript ?? setLocalScript;
  const isCopied = setCopiedCmd ? copiedCmd : localCopied;
  const updateCopied = setCopiedCmd ?? setLocalCopied;

  const myDevices = deviceList.filter((d) => (d.userId ?? d.user_id) === currentUser?.id);
  const fleetSource = myDevices.length > 0 ? myDevices : deviceList;

  const isDeviceAlert = (d) => d.status !== 'online' || d.cpu > 80 || d.ram > 85;
  const onlineCount = fleetSource.filter((d) => d.status === 'online').length;
  const warningCount = fleetSource.filter(isDeviceAlert).length;

  const filteredFleet = fleetSource.filter((dev) => {
    const q = searchQuery.trim().toLowerCase();
    const devName = dev.name || dev.device_name || '';
    const devIp = dev.ip || dev.ip_address || '';
    const matchesSearch =
      !q ||
      devName.toLowerCase().includes(q) ||
      dev.id?.toLowerCase().includes(q) ||
      devIp.toLowerCase().includes(q);
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

  const authToken = session?.access_token || currentUser?.access_token || '';

  useEffect(() => {
    const targetId = activeDevice?.id;
    if (!targetId) {
      setLiveSeries([]);
      setTelemetryError('');
      return;
    }

    let cancelled = false;

    const fetchTelemetry = async (isInitial = false) => {
      try {
        if (isInitial) setTelemetryLoading(true);
        setTelemetryError('');

        const raw = await getDeviceTelemetry(targetId, authToken, '-1h');
        if (!cancelled) {
          setLiveSeries(normalizeTelemetryPoints(raw));
        }
      } catch (err) {
        if (!cancelled) {
          setTelemetryError(err.message || 'Failed to load InfluxDB telemetry');
        }
      } finally {
        if (!cancelled && isInitial) setTelemetryLoading(false);
      }
    };

    fetchTelemetry(true);
    const intervalId = setInterval(() => fetchTelemetry(false), 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeDevice?.id, authToken]);

  const activeSeries =
    liveSeries.length > 0 ? liveSeries : activeDevice ? deviceHistory[activeDevice.id] || [] : [];

  const deviceThresholds = rules.reduce((acc, r) => {
    const activeName = activeDevice?.name || activeDevice?.device_name;
    if (r.enabled && activeName && r.deviceName === activeName) {
      acc[r.metricKey] = r.threshold;
    }
    return acc;
  }, {});

  const handleOpenAddModal = () => {
    setDeviceError('');
    updateCopied(false);
    updateScript('');
    setGeneratedDevice?.(null);
    setNewDeviceName?.('');
    setIsAddModalOpen(true);
  };

  async function onAddDeviceSubmit(e) {
    e.preventDefault();
    const trimmedName = (newDeviceName || '').trim();
    if (!trimmedName) return;

    try {
      setSubmittingDevice(true);
      setDeviceError('');
      updateCopied(false);

      const { os_name, os_version } = parseOsSelection(newDeviceOs);

      const payload = {
        device_name: trimmedName,
        hostname: toHostname(trimmedName),
        os_name,
        os_version,
      };

      const result = await createDevice(payload, authToken);
      const created = result.data || result.device;

      if (created) {
        setGeneratedDevice?.(created);
        updateDevices((prev) => [created, ...prev]);
        setSelectedDeviceId?.(created.id);
      }

      updateScript(result.setup_script || '');
    } catch (err) {
      setDeviceError(err.message || 'Could not register device');
    } finally {
      setSubmittingDevice(false);
    }
  }

  async function handleCopyCommand() {
    if (onCopyCommand) {
      return onCopyCommand(activeScript);
    }
    if (!activeScript) return;
    await navigator.clipboard.writeText(activeScript);
    updateCopied(true);
    setTimeout(() => updateCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopNavbar
        currentUser={currentUser}
        alerts={alerts}
        onMarkAllRead={() => setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })))}
        onOpenAddModal={handleOpenAddModal}
        onLogout={handleLogout}
      />

      <FleetSummaryBar
        totalCount={fleetSource.length}
        onlineCount={onlineCount}
        warningCount={warningCount}
      />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <DeviceSidebar
            devices={filteredFleet}
            totalCount={fleetSource.length}
            onlineCount={onlineCount}
            alertCount={warningCount}
            selectedDeviceId={activeDevice?.id}
            onSelectDevice={setSelectedDeviceId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={fleetFilter}
            onFilterChange={setFleetFilter}
            onOpenAddModal={handleOpenAddModal}
            isAlertDevice={isDeviceAlert}
          />

          <div className="flex-1 w-full space-y-6">
            {activeDevice ? (
              <>
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {activeDevice.name || activeDevice.device_name}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {activeDevice.status || 'online'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                        device_id: {activeDevice.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {activeDevice.os || activeDevice.os_name || 'Windows'} • Host IP:{' '}
                      {activeDevice.ip || activeDevice.ip_address || '—'} • Bucket: hardware-metrics
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAlertModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium shrink-0 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Add Email Alert</span>
                  </button>
                </div>

                {telemetryError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
                    InfluxDB sync notice: {telemetryError}
                  </div>
                )}

                {telemetryLoading && activeSeries.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-xs font-mono text-slate-400">
                    Loading InfluxDB telemetry for {activeDevice.id}...
                  </div>
                ) : (
                  <TelemetryGrid data={activeSeries} thresholds={deviceThresholds} />
                )}
              </>
            ) : (
              <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <Monitor className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No Devices Registered Yet</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Click &quot;+ Add Device&quot; to register a target device and generate its Telegraf installer command.
                </p>
              </div>
            )}

            <AlertRulesPanel
              rules={rules}
              onOpenRuleModal={() => setIsAlertModalOpen(true)}
              onToggleRule={(ruleId) =>
                setRules((prev) =>
                  prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
                )
              }
              onDeleteRule={(ruleId) =>
                setRules((prev) => prev.filter((r) => r.id !== ruleId))
              }
            />
          </div>
        </div>
      </main>

      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setGeneratedDevice?.(null);
          setDeviceError('');
        }}
        newDeviceName={newDeviceName}
        setNewDeviceName={setNewDeviceName}
        newDeviceOs={newDeviceOs}
        setNewDeviceOs={setNewDeviceOs}
        generatedDevice={generatedDevice}
        setGeneratedDevice={setGeneratedDevice}
        setupScript={activeScript}
        copiedCmd={isCopied}
        submitting={submittingDevice}
        error={deviceError}
        onSubmit={onAddDeviceSubmit}
        getPowerShellCommand={getPowerShellCommand}
        onCopyCommand={handleCopyCommand}
      />

      <AddAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        defaultDeviceName={
          activeDevice?.name ||
          activeDevice?.device_name ||
          fleetSource[0]?.name ||
          fleetSource[0]?.device_name ||
          'DESKTOP-DEV01'
        }
        defaultEmail={currentUser?.email || 'user@syspulse.dev'}
        onSaveRule={(newRule) => setRules((prev) => [newRule, ...prev])}
      />
    </div>
  );
}