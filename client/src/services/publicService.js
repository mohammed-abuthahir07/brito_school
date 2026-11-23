import { request } from './api';

export const publicService = {
  /**
   * Fetch public announcements
   */
  async getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/announcements${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Fetch public calendars
   */
  async getCalendars(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/calendars${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Fetch public galleries (max 30)
   */
  async getGalleries(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/galleries${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Fetch daily Thirukkural
   */
  async getDailyKural() {
    return request('/api/public/thirukkural/daily', { method: 'GET' });
  },

  /**
   * Fetch public Thirukkural list
   */
  async getKurals(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/public/thirukkural${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Check backend server health
   */
  async checkHealth() {
    return request('/health', { method: 'GET' });
  },
};
