const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Standard fetch wrapper with JWT authentication and JSON error handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('eduwings_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle unauthorized expired token
  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('eduwings_token');
    localStorage.removeItem('eduwings_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle blob or text responses (e.g. CSV export)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    if (!response.ok) throw new Error('Download failed');
    return response.blob();
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
