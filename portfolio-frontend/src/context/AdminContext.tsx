import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { LoginResponse } from '../types';

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminToken') !== null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<{ valid: boolean }>('/admin/verify');
      if (response.error) throw new Error(response.error);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      try {
        const response = await api.post<LoginResponse>('/admin/refresh-token', {});
        if (response.error) throw new Error(response.error);
        if (!response.data?.token) throw new Error('No token received');
        
        localStorage.setItem('adminToken', response.data.token);
      } catch (error) {
        console.error('Token refresh failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    };

    const intervalId = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Listen for authentication errors
  useEffect(() => {
    const handleAuthError = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('adminToken');
    };

    window.addEventListener('auth:expired', handleAuthError);
    return () => window.removeEventListener('auth:expired', handleAuthError);
  }, []);

  // Initial authentication check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/admin/login', { email, password });
      if (response.error) throw new Error(response.error);
      if (!response.data?.token) throw new Error('No token received');
      
      localStorage.setItem('adminToken', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}