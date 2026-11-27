
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ALERTS_URL = `${API_BASE_URL}/api/alerts`;

function buildHeaders(accessToken) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      json.error || json.message || `Request failed (${res.status})`
    );
  }

  return json;
}

// Create an alert rule
export async function createAlertRule(payload, accessToken) {
  const res = await fetch(`${ALERTS_URL}/rules`, {
    method: 'POST',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// Fetch all alert rules
export async function getAlertRules(accessToken) {
  const res = await fetch(`${ALERTS_URL}/rules`, {
    method: 'GET',
    headers: buildHeaders(accessToken),
  });

  return handleResponse(res);
}

// Update an alert rule
export async function updateAlertRule(ruleId, updates, accessToken) {
  const res = await fetch(`${ALERTS_URL}/rules/${ruleId}`, {
    method: 'PATCH',
    headers: buildHeaders(accessToken),
    body: JSON.stringify(updates),
  });

  return handleResponse(res);
}

// Delete an alert rule
export async function deleteAlertRule(ruleId, accessToken) {
  const res = await fetch(`${ALERTS_URL}/rules/${ruleId}`, {
    method: 'DELETE',
    headers: buildHeaders(accessToken),
  });

  return handleResponse(res);
}

// Fetch alert history
export async function getAlerts(accessToken) {
  const res = await fetch(ALERTS_URL, {
    method: 'GET',
    headers: buildHeaders(accessToken),
  });

  return handleResponse(res);
}

// Acknowledge an alert
export async function acknowledgeAlert(alertId, accessToken) {
  const res = await fetch(`${ALERTS_URL}/${alertId}/acknowledge`, {
    method: 'PATCH',
    headers: buildHeaders(accessToken),
  });

  return handleResponse(res);
}

// Resolve an alert
export async function resolveAlert(alertId, accessToken) {
  const res = await fetch(`${ALERTS_URL}/${alertId}/resolve`, {
    method: 'PATCH',
    headers: buildHeaders(accessToken),
  });

  return handleResponse(res);
}
