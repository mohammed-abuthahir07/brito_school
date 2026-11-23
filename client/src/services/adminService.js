import { request } from './api';

export const adminService = {
  async login(email, password, options = {}) {
    return request('/api/admin/login', {
      method: 'POST',
      body: { email, password },
      ...options,
    });
  },

  async forgotPassword(email, options = {}) {
    return request('/api/admin/forgot-password', {
      method: 'POST',
      body: { email },
      ...options,
    });
  },

  async resetPassword({ email, otp, newPassword, confirmPassword }, options = {}) {
    return request('/api/admin/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword, confirmPassword },
      ...options,
    });
  },

  async getDashboard(options = {}) {
    return request('/api/admin/dashboard', { method: 'GET', ...options });
  },

  async getAnnouncements(params = {}, options = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/announcements${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET', ...options });
  },

  async createAnnouncement(data, options = {}) {
    return request('/api/admin/announcements', {
      method: 'POST',
      body: data,
      ...options,
    });
  },

  async updateAnnouncement(id, data, options = {}) {
    return request(`/api/admin/announcements?id=${id}`, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },

  async deleteAnnouncement(id, options = {}) {
    return request(`/api/admin/announcements?id=${id}`, {
      method: 'DELETE',
      ...options,
    });
  },

  async getCalendars(options = {}) {
    return request('/api/admin/calendars', { method: 'GET', ...options });
  },

  async uploadCalendar(formData, options = {}) {
    return request('/api/admin/calendars', {
      method: 'POST',
      body: formData,
      timeoutMs: 60000,
      ...options,
    });
  },

  async deleteCalendar(id, options = {}) {
    return request(`/api/admin/calendars?id=${id}`, {
      method: 'DELETE',
      ...options,
    });
  },

  async getGalleries(options = {}) {
    return request('/api/admin/galleries', { method: 'GET', ...options });
  },

  async uploadGallery(formData, options = {}) {
    return request('/api/admin/galleries', {
      method: 'POST',
      body: formData,
      timeoutMs: 60000,
      ...options,
    });
  },

  async updateGallery(id, data, options = {}) {
    return request(`/api/admin/galleries?id=${id}`, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },

  async deleteGallery(id, options = {}) {
    return request(`/api/admin/galleries?id=${id}`, {
      method: 'DELETE',
      ...options,
    });
  },

  async getKurals(options = {}) {
    return request('/api/admin/thirukkural', { method: 'GET', ...options });
  },

  async publishKural(data, options = {}) {
    return request('/api/admin/thirukkural', {
      method: 'POST',
      body: data,
      ...options,
    });
  },

  async updateKural(id, data, options = {}) {
    return request(`/api/admin/thirukkural?id=${id}`, {
      method: 'PUT',
      body: data,
      ...options,
    });
  },

  async deleteKural(id, options = {}) {
    return request(`/api/admin/thirukkural?id=${id}`, {
      method: 'DELETE',
      ...options,
    });
  },

  async getProfile(options = {}) {
    return request('/api/admin/profile', { method: 'GET', ...options });
  },

  async updateProfile(data, options = {}) {
    return request('/api/admin/profile', {
      method: 'PUT',
      body: data,
      ...options,
    });
  },
};
