const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getDeviceTelemetry(deviceId, accessToken, range = '-1h') {
  if (!deviceId) return [];

  const params = new URLSearchParams({ range });
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(
    `${API_BASE_URL}/api/metrics/${encodeURIComponent(deviceId)}?${params.toString()}`,
    { headers }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Failed to load telemetry (${res.status})`);
  }

  return Array.isArray(data) ? data : data.data || data.series || [];
}