/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 * Syncs with localStorage to ensure user data is always available
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/api';
import type { AuthContextType, User, LoginFormData, ApiResponse } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh user from localStorage
  const refreshUser = useCallback(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  // Initial load on mount
  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  // Listen for localStorage changes (for cross-tab/window sync and Electron compatibility)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        refreshUser();
      }
    };

    // Listen for storage events (works across tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also poll localStorage periodically for Electron compatibility
    // (Electron sometimes doesn't fire storage events properly)
    const pollInterval = setInterval(() => {
      const currentUser = authApi.getCurrentUser();
      if (currentUser?.user_id !== user?.user_id) {
        refreshUser();
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [refreshUser, user?.user_id]);

  const login = async (credentials: LoginFormData): Promise<ApiResponse<User>> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.user) {
        // User is already stored in localStorage by authApi.login()
        // Refresh from localStorage to ensure consistency
        refreshUser();
        return { success: true, data: response.user };
      }
      return { success: false, error: response.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  // Get current user (always from localStorage for reliability)
  const getCurrentUser = useCallback((): User | null => {
    return authApi.getCurrentUser();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    // Add helper method to get fresh user from localStorage
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};