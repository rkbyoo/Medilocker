import { apiClient } from '@/services';
import { API_CONFIG } from '@/config/api';
import type { User, UserRole, ApiResponse } from '@/types';

/**
 * Authentication API
 * Handles user login, logout, and session management
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse extends ApiResponse<User> {
  token?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

/**
 * Authenticate user with username and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      const { user, token, refreshToken } = response.data;
      
      // Store user and tokens in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set auth token in API client
      apiClient.setAuthToken(token);
      
      return { success: true, data: user, token };
    }

    return { success: false, error: response.error || 'Login failed' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return { success: false, error: message };
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate token on server
    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local storage and remove auth token
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    apiClient.removeAuthToken();
  }
};

/**
 * Get current logged-in user from localStorage or API
 */
export const getCurrentUser = async (forceRefresh = false): Promise<User | null> => {
  if (!forceRefresh) {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        // Invalid JSON, continue to API call
      }
    }
  }

  // Try to get user from API if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      apiClient.setAuthToken(token);
      const response = await apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      if (response.success && response.data) {
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch current user:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      apiClient.removeAuthToken();
    }
  }

  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  return !!(token && user);
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      return user.role === role;
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  
  if (!refreshTokenValue) {
    return false;
  }

  try {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken: refreshTokenValue }
    );

    if (response.success && response.data) {
      const { user, token, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      apiClient.setAuthToken(token);
      return true;
    }
  } catch (error) {
    console.warn('Token refresh failed:', error);
  }

  // Clear invalid tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
  apiClient.removeAuthToken();
  
  return false;
};
