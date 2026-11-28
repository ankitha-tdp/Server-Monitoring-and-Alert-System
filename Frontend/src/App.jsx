import React, { useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_DEVICES, generateInitialSeries } from './data/mockData';
import LoginRegister from './pages/LoginRegister';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { loginUser, registerUser, getCurrentUser, logoutUser } from './api/authApi';
import { getDevices } from './api/deviceApi';
import { getAdminUsers, getAdminDevices, deleteAdminUser } from './api/adminApi';

const INITIAL_ALERT_RULES = [
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

const INITIAL_DISPATCHED_ALERTS = [
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

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [currentUser, setCurrentUser] = useState(null);

  const [session, setSession] = useState(null);

  const [authMode, setAuthMode] = useState('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [selectedDeviceId, setSelectedDeviceId] = useState('dev_win_8821');
  const [deviceHistory, setDeviceHistory] = useState(() => ({
    dev_win_8821: generateInitialSeries(34, 62, 18),
    dev_win_9044: generateInitialSeries(20, 48, 12),
    dev_win_3319: generateInitialSeries(72, 84, 45),
    dev_win_1102: generateInitialSeries(29, 53, 31)
  }));

  const [globalInfluxHistory, setGlobalInfluxHistory] = useState(() => generateInitialSeries(44, 64, 28));

  const [alertRules, setAlertRules] = useState(INITIAL_ALERT_RULES);
  const [dispatchedAlerts, setDispatchedAlerts] = useState(INITIAL_DISPATCHED_ALERTS);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceOs, setNewDeviceOs] = useState('Windows 11 Pro (x64)');
  const [generatedDevice, setGeneratedDevice] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const [adminTab, setAdminTab] = useState('overview');

  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = new Date().toTimeString().split(' ')[0];

      setDevices((prevDevices) => {
        const updated = prevDevices.map((dev) => {
          if (dev.status !== 'online') return dev;
          const nextCpu = Math.min(98, Math.max(3, Number((dev.cpu + (Math.random() * 10 - 5)).toFixed(1))));
          const nextRam = Math.min(96, Math.max(18, Number((dev.ram + (Math.random() * 4 - 2)).toFixed(1))));
          const nextDisk = Math.min(95, Math.max(1, Number((dev.disk + (Math.random() * 8 - 4)).toFixed(1))));
          return { ...dev, cpu: nextCpu, ram: nextRam, disk: nextDisk, lastSeen: 'Just now' };
        });

        setDeviceHistory((prevHist) => {
          const nextHist = { ...prevHist };
          updated.forEach((dev) => {
            const series = nextHist[dev.id] || generateInitialSeries(dev.cpu, dev.ram, dev.disk);
            nextHist[dev.id] = [...series.slice(1), { time: nowTime, cpu: dev.cpu, ram: dev.ram, disk: dev.disk }];
          });
          return nextHist;
        });

        const onlineDevs = updated.filter((d) => d.status === 'online');
        const avgCpu = onlineDevs.length ? Number((onlineDevs.reduce((acc, d) => acc + d.cpu, 0) / onlineDevs.length).toFixed(1)) : 0;
        const avgRam = onlineDevs.length ? Number((onlineDevs.reduce((acc, d) => acc + d.ram, 0) / onlineDevs.length).toFixed(1)) : 0;
        const avgDisk = onlineDevs.length ? Number((onlineDevs.reduce((acc, d) => acc + d.disk, 0) / onlineDevs.length).toFixed(1)) : 0;

        setGlobalInfluxHistory((prev) => [...prev.slice(1), { time: nowTime, cpu: avgCpu, ram: avgRam, disk: avgDisk }]);
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const loadDevices = async () => {
    if (!session?.access_token || currentUser?.role !== 'user') return;

    try {
      const fetchedDevices = await getDevices(session.access_token);
      setDevices(fetchedDevices);
      if (fetchedDevices.length > 0) {
        setSelectedDeviceId(fetchedDevices[0].id);
      }
    } catch (error) {
      setAuthError(error.message || 'Failed to load devices');
    }
  };

  loadDevices();
}, [session, currentUser]);


useEffect(() => {
    if (currentUser?.role !== 'admin' || !session?.access_token) {
        return;
    }

    let cancelled = false;

    const loadAdminData = async () => {
        try {
            const [usersData, devicesData] = await Promise.all([
                getAdminUsers(session.access_token),
                getAdminDevices(session.access_token)
            ]);

            if (cancelled) return;

            setUsers(usersData.map((u) => ({
                id: u.id,
                email: u.email,
                username: u.username || u.full_name || u.email,
                role: u.role,
                status: u.status || 'active',
                createdAt: u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : 'N/A'
            })));

            setDevices(devicesData.map((d) => ({
                ...d,
                userId: d.user_id,
                name: d.device_name,
                ownerName: d.owner_name || 'Unknown',
                os: d.os_name || 'Unknown',
                ip: d.ip_address || 'N/A',
                status: d.agent_status === 'online' ? 'online' : 'offline',
                cpu: 0,
                ram: 0,
                disk: 0
            })));

        } catch (error) {
            if (!cancelled) {
                console.error('Failed to load admin data:', error);
                setAuthError(error.message);
            }
        }
    };

    loadAdminData();

    return () => {
        cancelled = true;
    };
}, [currentUser, session]);


  useEffect(() => {
    if (currentUser && currentUser.role === 'user') {
      const userDevs = devices.filter((d) => d.userId === currentUser.id);
      if (userDevs.length > 0 && !userDevs.some((d) => d.id === selectedDeviceId)) {
        setSelectedDeviceId(userDevs[0].id);
      }
    }
  }, [currentUser, devices, selectedDeviceId]);

  const handleQuickFill = (roleType) => {
    setAuthMode('login');
    setAuthError('');
    setAuthSuccess('');
    if (roleType === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin123');
    } else {
      setLoginIdentifier('user');
      setLoginPassword('user123');
    }
  };

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthSuccess('');

  try {
    const result = await loginUser(loginIdentifier.trim(), loginPassword);

    const profile = await getCurrentUser(result.session.access_token);

    setCurrentUser(profile);
    setSession(result.session);
    setLoginPassword('');
  } catch (error) {
    setAuthError(error.message || 'Login failed');
  }
};

  const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  setAuthError('');
  setAuthSuccess('');

  try {
    await registerUser(
      regUsername.trim(),
      regEmail.trim(),
      regPassword
    );

    setAuthSuccess(
      'Registration successful. Check your email to confirm your account before logging in.'
    );

    setAuthMode('login');
    setLoginIdentifier(regEmail.trim());
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
  } catch (error) {
    setAuthError(error.message || 'Registration failed');
  }
};

  const handleLogout = async () => {
  try {
    if (session?.access_token) {
      await logoutUser(session.access_token);
    }
  } catch (error) {
    console.error('Logout error:', error.message);
  } finally {
    setCurrentUser(null);
    setSession(null);
    setAuthError('');
    setAuthSuccess('');
  }
};

  const handleCreateDevice = (e) => {
    e.preventDefault();
    if (!newDeviceName.trim() || !currentUser) return;

    const newDevId = `dev_win_${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      id: newDevId,
      userId: currentUser.id,
      ownerName: currentUser.username,
      name: newDeviceName.trim().toUpperCase(),
      os: newDeviceOs,
      ip: `192.168.1.${Math.floor(100 + Math.random() * 140)}`,
      status: 'online',
      cpu: 18.4,
      ram: 42.6,
      disk: 9.8,
      uptime: '0d 00h 01m',
      lastSeen: 'Just now'
    };

    setDevices((prev) => [...prev, created]);
    setDeviceHistory((prev) => ({ ...prev, [newDevId]: generateInitialSeries(18.4, 42.6, 9.8) }));
    setSelectedDeviceId(newDevId);
    setGeneratedDevice(created);
    setNewDeviceName('');
    setCopiedCmd(false);
  };

  const getPowerShellCommand = (device) => {
    if (!device || !currentUser) return '';
    return `irm http://192.168.1.10:5000/api/install.ps1 | iex; Install-SysPulseTelegraf -UserId "${currentUser.id}" -DeviceId "${device.id}" -InfluxUrl "http://192.168.1.10:8086"`;
  };

  const handleCopyCommand = () => {
    if (!generatedDevice) return;
    navigator.clipboard?.writeText(getPowerShellCommand(generatedDevice));
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleToggleUserStatus = (userId) => {
    if (userId === currentUser.id) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)));
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) return;

    if (!window.confirm('Are you sure you want to permanently delete this user?')) {
        return;
    }

    try {
        await deleteAdminUser(session.access_token, userId);

        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setDevices((prev) => prev.filter((d) => d.userId !== userId));

    } catch (error) {
        alert(error.message || 'Failed to delete user');
    }
};

  const handleToggleDeviceStatus = (deviceId) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, status: d.status === 'online' ? 'offline' : 'online', lastSeen: d.status === 'online' ? '2 mins ago' : 'Just now' } : d
      )
    );
  };

  if (!currentUser) {
    return (
      <LoginRegister
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginIdentifier={loginIdentifier}
        setLoginIdentifier={setLoginIdentifier}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        regUsername={regUsername}
        setRegUsername={setRegUsername}
        regEmail={regEmail}
        setRegEmail={regEmail}
        regPassword={regPassword}
        setRegPassword={regPassword}
        regRole={regRole}
        setRegRole={setRegRole}
        authError={authError}
        authSuccess={authSuccess}
        handleQuickFill={handleQuickFill}
        handleLoginSubmit={handleLoginSubmit}
        handleRegisterSubmit={handleRegisterSubmit}
      />
    );
  }

  if (currentUser.role === 'user') {
    return (
      <UserDashboard
        currentUser={currentUser}
        session={session}
        devices={devices}
        setDevices={setDevices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
        deviceHistory={deviceHistory}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        newDeviceName={newDeviceName}
        setNewDeviceName={setNewDeviceName}
        newDeviceOs={newDeviceOs}
        setNewDeviceOs={setNewDeviceOs}
        generatedDevice={generatedDevice}
        setGeneratedDevice={setGeneratedDevice}
        copiedCmd={copiedCmd}
        handleCreateDevice={handleCreateDevice}
        getPowerShellCommand={getPowerShellCommand}
        handleCopyCommand={handleCopyCommand}
        handleLogout={handleLogout}
        alertRules={alertRules}
        setAlertRules={setAlertRules}
        dispatchedAlerts={dispatchedAlerts}
        setDispatchedAlerts={setDispatchedAlerts}
      />
    );
  }

  return (
    <AdminDashboard
      currentUser={currentUser}
      users={users}
      devices={devices}
      adminTab={adminTab}
      setAdminTab={setAdminTab}
      globalInfluxHistory={globalInfluxHistory}
      handleToggleUserStatus={handleToggleUserStatus}
      handleDeleteUser={handleDeleteUser}
      handleToggleDeviceStatus={handleToggleDeviceStatus}
      handleLogout={handleLogout}
    />
  );
}
