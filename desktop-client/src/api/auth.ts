import { dummyUsers } from '@/data/dummyData';
import type { User, UserRole } from '@/types';

/**
 * Authentication API
 * Handles user login, logout, and session management
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authenticate user with username and password
 */
export const login = (credentials: LoginCredentials): AuthResponse => {
  const user = dummyUsers.find(
    (u) => u.username === credentials.username && u.password === credentials.password
  );

  if (user) {
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  }

  return { success: false, error: 'Invalid username or password' };
};

/**
 * Logout current user
 */
export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

/**
 * Get current logged-in user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};
