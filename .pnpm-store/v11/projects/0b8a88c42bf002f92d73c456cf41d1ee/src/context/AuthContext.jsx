import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('civicfix_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user || data);
      } catch (error) {
        console.error('Token validation failed', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_user');
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('civicfix_token', data.token);
    localStorage.setItem('civicfix_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('civicfix_token', res.token);
    localStorage.setItem('civicfix_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isManagement: ['management', 'operator', 'admin'].includes(user?.role),
    isCitizen: user?.role === 'citizen',
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
