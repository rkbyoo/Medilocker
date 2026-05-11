import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { prisma } from '../../config/prisma';
import type { DatabaseUser } from '../../types/global';

export class NotificationController {
  /**
   * GET /api/notifications
   * Returns notifications for the authenticated patient (newest first)
   */
  static async getMyNotifications(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const notifications = await NotificationService.getForPatient(patient.patient_id, limit);
      const unread_count = await NotificationService.getUnreadCount(patient.patient_id);

      return sendSuccess(res, 'Notifications retrieved', { notifications, unread_count });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return sendError(res, error.message || 'Failed to retrieve notifications', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      const count = await NotificationService.getUnreadCount(patient.patient_id);
      return sendSuccess(res, 'Unread count retrieved', { count });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve count', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  static async markRead(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      const { id } = req.params;
      await NotificationService.markRead(id, patient.patient_id);
      return sendSuccess(res, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark notification', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PATCH /api/notifications/mark-all-read
   * Mark all notifications of the patient as read
   */
  static async markAllRead(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      await NotificationService.markAllRead(patient.patient_id);
      return sendSuccess(res, 'All notifications marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark notifications', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/notifications/device-token
   * Register an FCM device token for push delivery
   */
  static async registerDeviceToken(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      const { fcm_token, platform } = req.body;
      if (!fcm_token || !platform) {
        return sendError(res, 'fcm_token and platform are required', HTTP_STATUS.BAD_REQUEST);
      }

      await NotificationService.registerDeviceToken(patient.patient_id, fcm_token, platform);
      return sendSuccess(res, 'Device token registered');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to register token', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * DELETE /api/notifications/device-token
   * Remove an FCM device token (on logout)
   */
  static async unregisterDeviceToken(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const patient = await prisma.patient.findUnique({
        where: { user_id: user.user_id },
        select: { patient_id: true },
      });
      if (!patient) return sendError(res, 'Patient record not found', HTTP_STATUS.NOT_FOUND);

      const { fcm_token } = req.body;
      if (!fcm_token) return sendError(res, 'fcm_token is required', HTTP_STATUS.BAD_REQUEST);

      await NotificationService.unregisterDeviceToken(patient.patient_id, fcm_token);
      return sendSuccess(res, 'Device token removed');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to remove token', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
