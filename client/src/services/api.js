/**
 * Centralized API Client for Brito School Management System
 * Base URL defaults to VITE_API_BASE_URL or http://localhost:5000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export { API_BASE_URL };

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get stored auth token
 */
export const getStoredToken = () => {
  return localStorage.getItem('brito_admin_token') || '';
};

/**
 * Set auth token
 */
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('brito_admin_token', token);
  } else {
    localStorage.removeItem('brito_admin_token');
  }
};

/**
 * Core request dispatcher
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  // Inject Bearer token if available
  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  } else if (isFormData) {
    // Let browser set the multipart boundary automatically
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 304 Not Modified
    if (response.status === 304) {
      return { success: true, notModified: true };
    }

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: response.ok, message: text };
    }

    if (!response.ok) {
      const message = data?.message || `Request failed with status ${response.status}`;
      if (response.status === 401) {
        // Trigger auth expired event
        window.dispatchEvent(new CustomEvent('brito_auth_expired'));
      }
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network connection failed. Please check your internet or server status.', 0);
  }
}
