// Support either http://host:port or http://host:port/api in environment settings.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '') + '/api';

export const assetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const origin = API_URL.replace(/\/api$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};

function getToken() {
  return localStorage.getItem('civicfix_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers !== undefined ? options.headers : { 'Content-Type': 'application/json' }),
  };
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (res.status === 401) {
    // Token expired or invalid — clear auth
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_user');
    // Only redirect if we're not already on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Authentication required');
  }
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth endpoints
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Existing endpoints
  createComplaint: (formData) => request('/complaints', { method: 'POST', body: formData, headers: {} }),
  analyzeComplaint: (id) => request(`/complaints/${id}/analyze`, { method: 'POST' }),
  getComplaint: (id) => request(`/complaints/${id}`),
  getComplaints: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/complaints${qs ? `?${qs}` : ''}`);
  },
  verifyComplaint: (id, formData) => request(`/complaints/${id}/verify`, { method: 'POST', body: formData, headers: {} }),
  reviewComplaint: (id, data) => request(`/complaints/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getDepartments: () => request('/departments'),
  runEvaluation: () => request('/evaluation/run', { method: 'POST' }),
  getEvaluationResults: () => request('/evaluation/results'),
  assetUrl
};
