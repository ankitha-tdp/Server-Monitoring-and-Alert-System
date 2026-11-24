
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH_URL = `${API_BASE_URL}/api/auth`;

// Register a new user
export async function registerUser(fullName, email, password) {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}

// Login an existing user
export async function loginUser(email, password) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

// Verify the access token and get the logged-in user
export async function getCurrentUser(accessToken) {
  const response = await fetch(`${AUTH_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed');
  }

  return data.user;
}
