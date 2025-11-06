import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants/statusCodes';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        sendError(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST, errorMessages.join(', '));
        return;
      }
      sendError(res, 'Invalid request data', HTTP_STATUS.BAD_REQUEST);
      return;
    }
  };
};