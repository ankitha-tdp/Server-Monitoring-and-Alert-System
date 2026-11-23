export const INITIAL_USERS = [
  {
    id: 'usr_admin_01',
    username: 'admin',
    email: 'admin@syspulse.io',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    createdAt: '2026-10-12'
  },
  {
    id: 'usr_demo_01',
    username: 'user',
    email: 'user@syspulse.io',
    password: 'user123',
    role: 'user',
    status: 'active',
    createdAt: '2026-10-15'
  },
  {
    id: 'usr_demo_02',
    username: 'rohan_dev',
    email: 'rohan@syspulse.io',
    password: 'user123',
    role: 'user',
    status: 'active',
    createdAt: '2026-11-02'
  }
];

export const INITIAL_DEVICES = [
  {
    id: 'dev_win_8821',
    userId: 'usr_demo_01',
    ownerName: 'user',
    name: 'DESKTOP-DEV01',
    os: 'Windows 11 Pro (x64)',
    ip: '192.168.1.42',
    status: 'online',
    cpu: 34.2,
    ram: 61.8,
    disk: 18.4,
    uptime: '4d 12h 18m',
    lastSeen: 'Just now'
  },
  {
    id: 'dev_win_9044',
    userId: 'usr_demo_01',
    ownerName: 'user',
    name: 'LAPTOP-HOSTEL',
    os: 'Windows 11 Home (x64)',
    ip: '10.24.88.15',
    status: 'online',
    cpu: 19.5,
    ram: 48.2,
    disk: 12.1,
    uptime: '1d 06h 44m',
    lastSeen: 'Just now'
  },
  {
    id: 'dev_win_3319',
    userId: 'usr_demo_02',
    ownerName: 'rohan_dev',
    name: 'WORKSTATION-LAB04',
    os: 'Windows Server 2022',
    ip: '172.16.0.108',
    status: 'online',
    cpu: 72.4,
    ram: 84.1,
    disk: 45.9,
    uptime: '18d 03h 11m',
    lastSeen: 'Just now'
  },
  {
    id: 'dev_win_1102',
    userId: 'usr_admin_01',
    ownerName: 'admin',
    name: 'CENTRAL-INFLUX-NODE',
    os: 'Windows 11 Enterprise',
    ip: '192.168.1.10',
    status: 'online',
    cpu: 28.7,
    ram: 53.0,
    disk: 31.2,
    uptime: '32d 19h 02m',
    lastSeen: 'Just now'
  }
];

export const generateInitialSeries = (baseCpu = 35, baseRam = 60, baseDisk = 20) => {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => {
    const t = new Date(now - (19 - i) * 2000);
    const timeLabel = t.toTimeString().split(' ')[0];
    return {
      time: timeLabel,
      cpu: Math.min(99, Math.max(4, Number((baseCpu + (Math.random() * 16 - 8)).toFixed(1)))),
      ram: Math.min(98, Math.max(15, Number((baseRam + (Math.random() * 6 - 3)).toFixed(1)))),
      disk: Math.min(95, Math.max(2, Number((baseDisk + (Math.random() * 14 - 7)).toFixed(1))))
    };
  });
};


export const DEFAULT_ALERTS = [
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

export const DEFAULT_RULES = [
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
  }
];