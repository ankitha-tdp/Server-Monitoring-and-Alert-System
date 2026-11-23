const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEVICES_URL = `${API_BASE_URL}/api/devices`;

function buildHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }
  return json;
}

// 1. GET devices (scoped to user_id for 'user', all devices for 'admin' via req.user.id)
export async function getDevices(accessToken) {
  const res = await fetch(DEVICES_URL, {
    method: 'GET',
    headers: buildHeaders(accessToken),
  });

  const data = await handleResponse(res);
  return data.devices ?? [];
}

// 2. POST register a new device + receive generated Telegraf setup script
export async function createDevice(payload, accessToken) {
  const res = await fetch(DEVICES_URL, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// 3. PATCH update an existing device by ID
export async function updateDevice(deviceId, updates, accessToken) {
  if (!deviceId) {
    throw new Error('deviceId is required to update a device');
  }

  const res = await fetch(`${DEVICES_URL}/${deviceId}`, {
    method: 'PATCH',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(updates),
  });

  const data = await handleResponse(res);
  return data.data || data.device;
}

// 4. DELETE a device by ID
export async function deleteDevice(deviceId, accessToken) {
  if (!deviceId) {
    throw new Error('deviceId is required to delete a device');
  }

  const res = await fetch(`${DEVICES_URL}/${deviceId}`, {
    method: 'DELETE',
    headers: buildHeaders(accessToken),
  });

  await handleResponse(res);
}