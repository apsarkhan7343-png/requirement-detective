import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, signupApi, getMeApi, logoutApi } from '../lib/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    organization?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (user: User) => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-architect-1',
  email: 'jordan.lead@enterprise.io',
  name: 'Jordan Davis',
  role: 'Lead Software Architect',
  organization: 'Enterprise Core Platforms',
  avatar: 'JD',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'reqdetective_auth_token';
const USER_STORAGE_KEY = 'reqdetective_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || 'demo_token_architect';
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Validate session on mount if token exists
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) return;

      try {
        const res = await getMeApi(storedToken);
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session verification fallback to stored user:', err);
      }
    };

    verifySession();
  }, []);

  const login = async (
    email: string,
    password: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await loginApi({ email, password });
      if (res.user && res.token) {
        setCurrentUser(res.user);
        setToken(res.token);
        if (remember) {
          localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    organization?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await signupApi(data);
      if (res.user && res.token) {
        setCurrentUser(res.user);
        setToken(res.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Could not complete registration' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      await logoutApi(token);
    }
    setToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    const mockToken = `reqdet_switched_${user.id}`;
    setToken(mockToken);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        signup,
        logout,
        switchUser,
        updateProfile,
      }}
    >
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
