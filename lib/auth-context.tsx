'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest' | 'founder';
  designation?: string;
  id?: string;
  profilePhoto?: string;
  fullName?: string;
  profilePictureUploaded?: boolean;
  phone?: string;
  companyName?: string;
  companyRole?: string;
  purposeOfVisit?: string;
  guestFormCompleted?: boolean;
  isProfileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: string) => void;
  guestLogin: (payload: { username: string; details: Partial<User> }) => void;
  logout: () => void;
  updateProfile: (data: any) => Promise<User | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      return null;
    }
    try {
      return JSON.parse(savedUser) as User;
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
      }
    }
  }, []);

  const generateUserId = (role: string) => {
    const roleCode: Record<string, string> = {
      admin: 'MIB-A',
      user: 'MIB-U',
      intern: 'MIB-I',
      freelancer: 'MIB-F',
      founder: 'MIB-FD',
    };
    const code = roleCode[role] || 'MIB-U';
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${code}-${randomNum}`;
  };

  const login = async (username: string, password: string, role: string) => {
    try {
      // Call backend API for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // User authenticated successfully
      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const guestLogin = ({ username, details }: { username: string; details: Partial<User> }) => {
    const normalized = username || details.fullName || 'Guest';
    const newUser: User = {
      username: normalized,
      email: details.email || `${normalized.toLowerCase().replace(/\s+/g, '.')}@guest.suryasmib.com`,
      role: 'guest',
      id: generateUserId('guest'),
      fullName: details.fullName || normalized,
      designation: details.designation || 'Guest',
      ...details,
      profilePictureUploaded: true,
      guestFormCompleted: true as any,
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = async () => {
    // Track guest logout if user is a guest
    if (user?.role === 'guest') {
      const guestId = localStorage.getItem('currentGuestId');
      if (guestId) {
        try {
          await fetch('/api/guest-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'logout',
              guestId,
              logoutTime: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Failed to track guest logout:', error);
        }
        localStorage.removeItem('currentGuestId');
        localStorage.removeItem('guestLoginTime');
      }
    }

    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (data: any) => {
    if (!user) {
      return null;
    }

    let nextUser: User = { ...user, ...data };

    if (user.role !== 'guest') {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername: user.username, updates: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const result = await response.json();
      nextUser = { ...nextUser, ...result.user };
    }

    setUser(nextUser);
    localStorage.setItem('currentUser', JSON.stringify(nextUser));
    return nextUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, guestLogin, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
