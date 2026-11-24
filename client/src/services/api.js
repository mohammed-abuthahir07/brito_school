/**
 * Centralized API client for Brito School.
 * Base URL is VITE_API_BASE_URL (build-time). Never embed secrets here.
 */
import { isAbortError, toUserFacingMessage } from '../utils/userFacingError';

const configuredBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL =
  typeof configuredBase === 'string' && configuredBase.trim()
    ? configuredBase.trim().replace(/\/$/, '')
    : '';
const DEFAULT_TIMEOUT_MS = 20000;
const AUTH_EXPIRED_SKIP = [
  '/api/admin/login',
  '/api/admin/forgot-password',
  '/api/admin/reset-password',
];

export { API_BASE_URL };

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.aborted = false;
  }
}

export const getStoredToken = () => localStorage.getItem('brito_admin_token') || '';

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('brito_admin_token', token);
  } else {
    localStorage.removeItem('brito_admin_token');
  }
};

function shouldSkipAuthExpired(endpoint) {
  return AUTH_EXPIRED_SKIP.some((path) => endpoint.includes(path));
}

export async function request(endpoint, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: externalSignal,
    headers: extraHeaders,
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = { ...extraHeaders };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = fetchOptions.body instanceof FormData;
  if (!isFormData && fetchOptions.body && typeof fetchOptions.body === 'object') {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  } else if (isFormData) {
    delete headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort('timeout'), timeoutMs);

  const onExternalAbort = () => controller.abort();
  const hasAbortSignal =
    externalSignal &&
    typeof externalSignal.aborted === 'boolean' &&
    typeof externalSignal.addEventListener === 'function';
  if (hasAbortSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (response.status === 304) {
      return { success: true, notModified: true };
    }

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = { success: response.ok, message: 'Invalid response from server.' };
      }
    } else {
      const text = await response.text();
      data = { success: response.ok, message: text || undefined };
    }

    if (!response.ok) {
      const message = toUserFacingMessage(response.status, data?.message);
      if (response.status === 401 && token && !shouldSkipAuthExpired(endpoint)) {
        window.dispatchEvent(new CustomEvent('brito_auth_expired'));
      }
      throw new ApiError(message, response.status, data);
    }

    return data ?? { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (isAbortError(error) || error?.name === 'AbortError') {
      const abortedByCaller = Boolean(externalSignal?.aborted);
      const apiError = new ApiError(
        abortedByCaller
          ? 'Request cancelled'
          : toUserFacingMessage(408),
        abortedByCaller ? 0 : 408,
      );
      apiError.aborted = abortedByCaller;
      throw apiError;
    }
    throw new ApiError(toUserFacingMessage(0), 0);
  } finally {
    window.clearTimeout(timeoutId);
    if (hasAbortSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}
