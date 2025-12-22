import type { User, UserRole } from '@/types';
import { getApiUrl } from '@/config/api';

/**
 * Authentication API
 * Handles user login, logout, and session management
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Transform backend user to frontend User format
 */
const transformBackendUser = (backendUser: any): User => {
  // Map backend role to frontend role
  let frontendRole: 'receptionist' | 'doctor';
  
  if (backendUser.role === 'hospital_staff') {
    // Map hospital role to frontend role
    if (backendUser.hospitalRole === 'receptionist') {
      frontendRole = 'receptionist';
    } else if (backendUser.hospitalRole === 'doctor') {
      frontendRole = 'doctor';
    } else {
      // Default to receptionist for other hospital_staff roles
      frontendRole = 'receptionist';
    }
  } else {
    // For non-hospital staff, default to receptionist (shouldn't happen in demo)
    frontendRole = 'receptionist';
  }

  return {
    id: backendUser.user_id, // UUID from backend
    user_id: backendUser.user_id, // Same as id, for clarity
    username: backendUser.email, // Use email as username for compatibility
    email: backendUser.email, // Email from backend
    password: '', // Don't store password
    role: frontendRole,
    name: backendUser.full_name,
    hospitalRole: backendUser.hospitalRole, // Store hospital role for reference
  };
};

/**
 * Authenticate user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(getApiUrl('auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.message || data.error || 'Invalid email or password',
      };
    }

    // Transform backend user to frontend format
    const user = transformBackendUser(data.data.user);

    // Store user and tokens
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error. Please try again.',
    };
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      // Call backend logout endpoint
      await fetch(getApiUrl('auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
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
  return getCurrentUser() !== null && localStorage.getItem('access_token') !== null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};
