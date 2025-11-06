import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants/statusCodes';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal server error';

  sendError(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND);
};