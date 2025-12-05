import { Request, Response } from 'express';
import { UserService } from './user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { AUTH_MESSAGES } from '../../constants/messages';

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.user_id;
      const user = await UserService.getUserById(userId);

      if (!user) {
        return sendError(res, AUTH_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const sanitizedUser = UserService.sanitizeUser(user);
      return sendSuccess(res, 'Profile retrieved successfully', sanitizedUser);
    } catch (error) {
      console.error('Get profile error:', error);
      return sendError(res, 'Failed to retrieve profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}