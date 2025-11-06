export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  NO_TOKEN: 'No token provided',
  FORBIDDEN: 'Access forbidden',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
} as const;