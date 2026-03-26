const BASE = import.meta.env.VITE_API_URL ?? '/api';

function getToken() {
  return localStorage.getItem('calorie:token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('calorie:token');
    window.location.reload();
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (dailyGoal) => request('/settings', { method: 'PUT', body: JSON.stringify({ dailyGoal }) }),

  // Entries
  getEntries: (date) => request(`/entries?date=${date}`),
  createEntry: (entry) => request('/entries', { method: 'POST', body: JSON.stringify(entry) }),
  deleteEntry: (id) => request(`/entries/${id}`, { method: 'DELETE' }),

  // Analytics
  getWeekly: () => request('/analytics/weekly'),
  getMonthly: () => request('/analytics/monthly'),
};
