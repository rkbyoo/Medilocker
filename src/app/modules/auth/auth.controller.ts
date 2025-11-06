import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { logAccess, ACCESS_ACTIONS } from '../../utils/logger';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { AUTH_MESSAGES } from '../../constants/messages';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from './auth.dto';

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const userData: RegisterRequest = req.body;
      
      const newUser = await AuthService.register(userData);
      const sanitizedUser = UserService.sanitizeUser(newUser);

      // Log successful registration
      await logAccess(newUser.user_id, ACCESS_ACTIONS.REGISTER, true, req);

      return sendSuccess(
        res,
        AUTH_MESSAGES.REGISTER_SUCCESS,
        sanitizedUser,
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      // Log failed registration
      await logAccess(null, ACCESS_ACTIONS.REGISTER, false, req);

      if (error.message === 'User with this email already exists') {
        return sendError(res, AUTH_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
      }

      console.error('Registration error:', error);
      return sendError(res, 'Registration failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const credentials: LoginRequest = req.body;
      
      const result = await AuthService.login(credentials);

      // Log successful login
      await logAccess(result.user.user_id, ACCESS_ACTIONS.LOGIN_SUCCESS, true, req);

      return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: result.user,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
    } catch (error: any) {
      // Log failed login
      await logAccess(null, ACCESS_ACTIONS.LOGIN_FAILED, false, req);

      if (error.message === 'Invalid credentials') {
        return sendError(res, AUTH_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
      }

      console.error('Login error:', error);
      return sendError(res, 'Login failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refresh_token }: RefreshTokenRequest = req.body;
      
      const result = await AuthService.refreshAccessToken(refresh_token);

      // Log successful token refresh
      await logAccess(null, ACCESS_ACTIONS.REFRESH_TOKEN, true, req);

      return sendSuccess(res, AUTH_MESSAGES.TOKEN_REFRESHED, {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
    } catch (error: any) {
      // Log failed token refresh
      await logAccess(null, ACCESS_ACTIONS.REFRESH_TOKEN, false, req);

      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return sendError(res, AUTH_MESSAGES.REFRESH_TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
      }

      console.error('Token refresh error:', error);
      return sendError(res, 'Token refresh failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { refresh_token }: RefreshTokenRequest = req.body;
      
      await AuthService.logout(refresh_token);

      // Log successful logout
      await logAccess(req.user?.user_id || null, ACCESS_ACTIONS.LOGOUT, true, req);

      return sendSuccess(res, AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 'Logout failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  static async me(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.user_id;
      const user = await UserService.getUserById(userId);

      if (!user) {
        return sendError(res, AUTH_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Log profile access
      await logAccess(userId, ACCESS_ACTIONS.ACCESS_PROFILE, true, req);

      const sanitizedUser = UserService.sanitizeUser(user);
      return sendSuccess(res, 'Profile retrieved successfully', sanitizedUser);
    } catch (error) {
      console.error('Get profile error:', error);
      return sendError(res, 'Failed to retrieve profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}