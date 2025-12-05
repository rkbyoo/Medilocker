import { Request } from 'express';
import { pool } from '../config/database';

export const logAccess = async (
  userId: string | null,
  action: string,
  success: boolean,
  req: Request
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    await pool.query(
      `INSERT INTO access_logs (user_id, action, ip_address, user_agent, success, timestamp) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, action, ipAddress, userAgent, success]
    );
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};

export const ACCESS_ACTIONS = {
  REGISTER: 'REGISTER',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  ACCESS_PROFILE: 'ACCESS_PROFILE',
} as const;