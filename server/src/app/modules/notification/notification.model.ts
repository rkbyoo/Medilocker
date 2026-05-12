import { prisma } from '../../config/prisma';
import { NotificationType } from '../../generated/prisma';

export class NotificationModel {
  /**
   * Create a notification for a patient
   */
  static async create(data: {
    patient_id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    return prisma.notification.create({
      data: {
        patient_id: data.patient_id,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ?? undefined,
      },
    });
  }

  /**
   * Get all notifications for a patient (newest first, max 50)
   */
  static async findByPatientId(patient_id: string, limit = 50) {
    return prisma.notification.findMany({
      where: { patient_id },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Count unread notifications for a patient
   */
  static async countUnread(patient_id: string) {
    return prisma.notification.count({
      where: { patient_id, is_read: false },
    });
  }

  /**
   * Mark a single notification as read
   */
  static async markRead(notification_id: string, patient_id: string) {
    return prisma.notification.updateMany({
      where: { notification_id, patient_id },
      data: { is_read: true },
    });
  }

  /**
   * Mark ALL notifications of a patient as read
   */
  static async markAllRead(patient_id: string) {
    return prisma.notification.updateMany({
      where: { patient_id, is_read: false },
      data: { is_read: true },
    });
  }

  // ──────────────────────────────────────────────
  // Device Token management
  // ──────────────────────────────────────────────

  /**
   * Register (upsert) a FCM device token for a patient
   */
  static async upsertDeviceToken(data: {
    patient_id: string;
    fcm_token: string;
    platform: string;
  }) {
    return prisma.deviceToken.upsert({
      where: {
        patient_id_fcm_token: {
          patient_id: data.patient_id,
          fcm_token: data.fcm_token,
        },
      },
      update: { updated_at: new Date() },
      create: {
        patient_id: data.patient_id,
        fcm_token: data.fcm_token,
        platform: data.platform,
      },
    });
  }

  /**
   * Remove a FCM device token (on logout)
   */
  static async removeDeviceToken(patient_id: string, fcm_token: string) {
    return prisma.deviceToken.deleteMany({
      where: { patient_id, fcm_token },
    });
  }

  /**
   * Get all device tokens for a patient (for push delivery)
   */
  static async getDeviceTokens(patient_id: string) {
    return prisma.deviceToken.findMany({
      where: { patient_id },
      select: { fcm_token: true, platform: true },
    });
  }
}
