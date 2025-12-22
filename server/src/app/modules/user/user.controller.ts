import { Request, Response } from 'express';
import { UserService } from './user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { AUTH_MESSAGES } from '../../constants/messages';
import { prisma } from '../../config/prisma';

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

  /**
   * Get all doctors (hospital staff with doctor role)
   */
  static async getDoctors(req: Request, res: Response): Promise<Response> {
    try {
      const doctors = await prisma.user.findMany({
        where: {
          role: 'hospital_staff',
          hospitalUsers: {
            some: {
              role_in_hospital: 'doctor',
            },
          },
        },
        select: {
          user_id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      });

      return sendSuccess(res, 'Doctors retrieved successfully', { doctors });
    } catch (error) {
      console.error('Get doctors error:', error);
      return sendError(res, 'Failed to retrieve doctors', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}