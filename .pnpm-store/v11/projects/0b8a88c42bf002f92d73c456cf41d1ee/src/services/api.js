// Accept either an origin (http://localhost:3001) or a full API base
// (http://localhost:3001/api) so local and deployed environment values work.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api`;

export const assetUrl = (fileUrl) => {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_ORIGIN}${fileUrl}`;
};

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Complaints
  createComplaint: (formData) => request('/complaints', { method: 'POST', body: formData, headers: {} }),
  analyzeComplaint: (id) => request(`/complaints/${id}/analyze`, { method: 'POST' }),
  getComplaint: (id) => request(`/complaints/${id}`),
  getComplaints: (params) => request(`/complaints?${new URLSearchParams(params)}`),
  verifyComplaint: (id, formData) => request(`/complaints/${id}/verify`, { method: 'POST', body: formData, headers: {} }),
  reviewComplaint: (id, data) => request(`/complaints/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  // Departments
  getDepartments: () => request('/departments'),
  // Evaluation
  runEvaluation: () => request('/evaluation/run', { method: 'POST' }),
  getEvaluationResults: () => request('/evaluation/results'),
};
