import React, { useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_DEVICES, generateInitialSeries } from './data/mockData';
import LoginRegister from './components/LoginRegister';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [currentUser, setCurrentUser] = useState(null);

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmed = loginIdentifier.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => (u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed) && u.password === loginPassword
    );

    if (!matchedUser) {
      setAuthError('Invalid username/email or password. Use quick-fill buttons below!');
      return;
    }
    if (matchedUser.status === 'suspended') {
      setAuthError('This account has been suspended.');
      return;
    }

    setCurrentUser(matchedUser);
    setLoginIdentifier('');
    setLoginPassword('');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanUsername = regUsername.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !regPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }

    const exists = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase() || u.email.toLowerCase() === cleanEmail);
    if (exists) {
      setAuthError('Username or email is already registered.');
      return;
    }

    const newUser = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      role: regRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers((prev) => [...prev, newUser]);

    if (regRole === 'user') {
      const starterDevId = `dev_win_${Math.floor(1000 + Math.random() * 9000)}`;
      const starterDevice = {
        id: starterDevId,
        userId: newUser.id,
        ownerName: newUser.username,
        name: `${cleanUsername.toUpperCase()}-PC`,
        os: 'Windows 11 Pro (x64)',
        ip: `192.168.1.${Math.floor(50 + Math.random() * 180)}`,
        status: 'online',
        cpu: 24.5,
        ram: 46.0,
        disk: 14.2,
        uptime: '0d 01h 12m',
        lastSeen: 'Just now'
      };
      setDevices((prev) => [...prev, starterDevice]);
      setDeviceHistory((prev) => ({ ...prev, [starterDevId]: generateInitialSeries(24.5, 46.0, 14.2) }));
    }

    setAuthSuccess(`Account "${cleanUsername}" created! You can now log in.`);
    setLoginIdentifier(cleanUsername);
    setLoginPassword(regPassword);
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setAuthMode('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthError('');
    setAuthSuccess('');
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

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDevices((prev) => prev.filter((d) => d.userId !== userId));
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
        setRegEmail={setRegEmail}
        regPassword={regPassword}
        setRegPassword={setRegPassword}
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
        devices={devices}
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