import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants/statusCodes';
import { AUTH_MESSAGES } from '../constants/messages';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    sendError(res, AUTH_MESSAGES.NO_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    sendError(res, AUTH_MESSAGES.NO_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, AUTH_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    return;
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, AUTH_MESSAGES.NO_TOKEN, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, AUTH_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      return;
    }

    next();
  };
};