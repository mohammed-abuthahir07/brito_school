import { request } from './api';

export const publicService = {
  async getAnnouncements(params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/announcements${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET', ...options });
  },

  async getCalendars(params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/calendars${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET', ...options });
  },

  async getGalleries(params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/galleries${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET', ...options });
  },

  async getDailyKural(options = {}) {
    return request('/api/public/thirukkural/daily', { method: 'GET', ...options });
  },

  async getKurals(params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/thirukkural${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET', ...options });
  },

  async checkHealth(options = {}) {
    return request('/health', { method: 'GET', timeoutMs: 8000, ...options });
  },
};
