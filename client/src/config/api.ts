/**
 * API Configuration
 * Centralized API base URL and configuration
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
} as const;

/**
 * Get authorization header with access token
 */
export const getAuthHeader = (): Record<string, string> => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return {};
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

