/**
 * CredVault Frontend API Client
 * Centralized service layer connecting the UI directly to the Express backend.
 */

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('credvault_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error: could not connect to backend server';
    }
    throw error;
  }
}

export const api = {
  // Public Citizen Endpoints
  submitApplication: (formData) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  trackApplication: (applicationId) =>
    request(`/applications/track/${encodeURIComponent(applicationId)}`, {
      method: 'GET',
    }),

  verifyCertificate: (certificateId) =>
    request(`/certificates/verify/${encodeURIComponent(certificateId)}`, {
      method: 'GET',
    }),

  getStats: () =>
    request('/stats', {
      method: 'GET',
    }),

  // Admin Endpoints
  adminLogin: async (username, password) => {
    const res = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      localStorage.setItem('credvault_token', res.token);
      localStorage.setItem('credvault_admin_user', JSON.stringify(res.admin || { username }));
    }
    return res;
  },

  adminLogout: () => {
    localStorage.removeItem('credvault_token');
    localStorage.removeItem('credvault_admin_user');
  },

  getAdminApplications: () =>
    request('/admin/applications', {
      method: 'GET',
    }),

  approveApplication: (applicationId) =>
    request(`/admin/applications/${encodeURIComponent(applicationId)}/approve`, {
      method: 'PATCH',
    }),

  rejectApplication: (applicationId, reason = '') =>
    request(`/admin/applications/${encodeURIComponent(applicationId)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  getAdminCertificates: () =>
    request('/admin/certificates', {
      method: 'GET',
    }),

  revokeCertificate: (certificateId) =>
    request(`/admin/certificates/${encodeURIComponent(certificateId)}/revoke`, {
      method: 'GET',
    }),
};
