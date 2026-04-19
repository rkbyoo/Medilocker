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

/**
 * Fetch wrapper with automatic token refresh on 401
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Add auth header
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  // Make the request
  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('Access token expired, attempting to refresh...');
    
    // Import dynamically to avoid circular dependency
    const { refreshAccessToken } = await import('@/api/auth');
    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log('Token refreshed successfully, retrying request...');
      // Retry the request with new token
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, { ...options, headers: newHeaders });
    } else {
      console.log('Token refresh failed, redirecting to login...');
      // Redirect to login page
      window.location.href = '/';
    }
  }

  return response;
};
