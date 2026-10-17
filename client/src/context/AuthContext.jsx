import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('civicshield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicshield_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user details on load if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('civicshield_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Failed to authenticate stored session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('civicshield_token', receivedToken);
    localStorage.setItem('civicshield_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('civicshield_token', receivedToken);
    localStorage.setItem('civicshield_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('civicshield_token');
    localStorage.removeItem('civicshield_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('civicshield_user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch {
      return null;
    }
  };

  const isCitizen = user?.role === 'citizen';
  const isCrew = user?.role === 'crew';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isCitizen,
        isCrew,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
