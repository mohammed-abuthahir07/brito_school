import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { getStoredToken, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getStoredToken());
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('brito_admin_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setStoredToken('');
    setToken('');
    setAdmin(null);
    localStorage.removeItem('brito_admin_info');
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('brito_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('brito_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      if (res.success && res.token) {
        setStoredToken(res.token);
        setToken(res.token);
        const adminData = res.admin || { email };
        setAdmin(adminData);
        localStorage.setItem('brito_admin_info', JSON.stringify(adminData));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loading, login, logout, setAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
