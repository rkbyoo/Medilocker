import { Request } from 'express';
import { prisma } from '../config/prisma';

export const logAccess = async (
  userId: string | null,
  action: string,
  success: boolean,
  req: Request
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    await prisma.accessLog.create({
      data: {
        user_id: userId,
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
      },
    });
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