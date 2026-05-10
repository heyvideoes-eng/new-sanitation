import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  role: 'admin' | 'cleaner';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('saaf_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Keep session for demo purposes even if expired
          const savedUser = localStorage.getItem('saaf_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        } else {
          const savedUser = localStorage.getItem('saaf_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        // Fallback to demo user
        setUser({ id: 0, name: 'Guest Admin', role: 'admin' });
      }
    } else {
      // DEFAULT TO ADMIN FOR PASSWORD-LESS ACCESS
      setUser({ id: 0, name: 'Guest Admin', role: 'admin' });
    }
    setIsLoading(false);
  }, [token]);

  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Always point to port 4000 for SAAF backend unless overridden
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:4000`;
    }
    return `${protocol}//${hostname}:4000`;
  };

  const login = async (credentials: any) => {
    const response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('saaf_token', data.token);
    localStorage.setItem('saaf_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('saaf_token');
    localStorage.removeItem('saaf_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
