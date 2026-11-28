
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ADMIN_URL = `${API_BASE_URL}/api/admin`;

export async function getAdminUsers(accessToken) {
    const response = await fetch(`${ADMIN_URL}/users`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
    }

    return data.users;
}

export async function getAdminDevices(accessToken) {
    const response = await fetch(`${ADMIN_URL}/devices`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch devices');
    }

    return data.devices;
}


export async function deleteAdminUser(accessToken, userId) {
    const response = await fetch(`${ADMIN_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
    }

    return data;
}
