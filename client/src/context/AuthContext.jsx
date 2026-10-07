import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('eduwings_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('eduwings_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('eduwings_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('eduwings_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      localStorage.setItem('eduwings_token', res.token);
      localStorage.setItem('eduwings_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('eduwings_token');
    localStorage.removeItem('eduwings_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isFaculty: user?.role === 'faculty',
        isCounsellor: user?.role === 'counsellor',
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
