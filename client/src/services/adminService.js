import { request } from './api';

export const adminService = {
  // Auth
  async login(email, password) {
    return request('/api/admin/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async forgotPassword(email) {
    return request('/api/admin/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword({ email, otp, newPassword, confirmPassword }) {
    return request('/api/admin/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword, confirmPassword },
    });
  },

  // Dashboard
  async getDashboard() {
    return request('/api/admin/dashboard', { method: 'GET' });
  },

  // Announcements
  async getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/announcements${query ? `?${query}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  async createAnnouncement(data) {
    return request('/api/admin/announcements', {
      method: 'POST',
      body: data,
    });
  },

  async updateAnnouncement(id, data) {
    return request(`/api/admin/announcements?id=${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteAnnouncement(id) {
    return request(`/api/admin/announcements?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Calendars
  async getCalendars() {
    return request('/api/admin/calendars', { method: 'GET' });
  },

  async uploadCalendar(formData) {
    return request('/api/admin/calendars', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteCalendar(id) {
    return request(`/api/admin/calendars?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Galleries
  async getGalleries() {
    return request('/api/admin/galleries', { method: 'GET' });
  },

  async uploadGallery(formData) {
    return request('/api/admin/galleries', {
      method: 'POST',
      body: formData,
    });
  },

  async updateGallery(id, data) {
    return request(`/api/admin/galleries?id=${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteGallery(id) {
    return request(`/api/admin/galleries?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Thirukkural
  async getKurals() {
    return request('/api/admin/thirukkural', { method: 'GET' });
  },

  async publishKural(data) {
    return request('/api/admin/thirukkural', {
      method: 'POST',
      body: data,
    });
  },

  async updateKural(id, data) {
    return request(`/api/admin/thirukkural?id=${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteKural(id) {
    return request(`/api/admin/thirukkural?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Profile
  async getProfile() {
    return request('/api/admin/profile', { method: 'GET' });
  },

  async updateProfile(data) {
    return request('/api/admin/profile', {
      method: 'PUT',
      body: data,
    });
  },
};
