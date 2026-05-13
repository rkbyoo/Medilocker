import { NotificationModel } from './notification.model';
import { NotificationType } from '@prisma/client';
import { PushNotificationService } from './push.service';

export class NotificationService {
  // ──────────────────────────────────────────────
  // CORE LOGIC
  // ──────────────────────────────────────────────

  /**
   * Internal method to save notification to DB AND send push
   */
  private static async sendNotification(
    patientId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // 1. Save to Database
      const notification = await NotificationModel.create({
        patient_id: patientId,
        type,
        title,
        body,
        data
      });

      // 2. Send Real-time Push (Async)
      PushNotificationService.sendToPatient(patientId, title, body, {
        type,
        ...data,
        notification_id: notification.notification_id
      }).catch(err => console.error('[NotificationService] Push failed:', err));

      return notification;
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error);
    }
  }

  // ──────────────────────────────────────────────
  // Notification creation helpers (called from other services)
  // ──────────────────────────────────────────────

  static async notifyAppointmentScheduled(data: {
    patient_id: string;
    doctor_name: string;
    department: string;
    scheduled_date_time: string;
    appointment_id: string;
    hospital_name: string;
  }) {
    const date = new Date(data.scheduled_date_time).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });
    return this.sendNotification(
      data.patient_id,
      NotificationType.appointment_scheduled,
      'Appointment Scheduled',
      `Appointment with ${data.doctor_name} (${data.department}) confirmed for ${date}.`,
      { appointment_id: data.appointment_id }
    );
  }

  static async notifyAppointmentConfirmed(data: {
    patient_id: string;
    doctor_name: string;
    scheduled_date_time: string;
    appointment_id: string;
  }) {
    const date = new Date(data.scheduled_date_time).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });
    return this.sendNotification(
      data.patient_id,
      NotificationType.appointment_confirmed,
      'Appointment Confirmed',
      `Confirmed: ${data.doctor_name} on ${date}.`,
      { appointment_id: data.appointment_id }
    );
  }

  static async notifyAppointmentCancelled(data: {
    patient_id: string;
    doctor_name: string;
    scheduled_date_time: string;
    appointment_id: string;
    reason?: string;
  }) {
    const date = new Date(data.scheduled_date_time).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });
    return this.sendNotification(
      data.patient_id,
      NotificationType.appointment_cancelled,
      'Appointment Cancelled',
      `Cancelled: ${data.doctor_name} on ${date}.${data.reason ? ` Reason: ${data.reason}` : ''}`,
      { appointment_id: data.appointment_id }
    );
  }

  static async notifyAppointmentCompleted(data: {
    patient_id: string;
    doctor_name: string;
    appointment_id: string;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.appointment_completed,
      'Visit Completed',
      `Visit with ${data.doctor_name} completed. Details available in records.`,
      { appointment_id: data.appointment_id }
    );
  }

  static async notifyVisitRecorded(data: {
    patient_id: string;
    doctor_name: string;
    visit_id: string;
    diagnosis?: string;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.visit_recorded,
      'Visit Record Added',
      `New record from ${data.doctor_name}.${data.diagnosis ? ` Diagnosis: ${data.diagnosis}` : ''}`,
      { visit_id: data.visit_id }
    );
  }

  static async notifyPrescriptionReady(data: {
    patient_id: string;
    doctor_name: string;
    prescription_id: string;
    visit_id: string;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.prescription_ready,
      'Prescription Available',
      `New prescription from ${data.doctor_name}. View in records.`,
      { prescription_id: data.prescription_id, visit_id: data.visit_id }
    );
  }

  static async notifyBillGenerated(data: {
    patient_id: string;
    bill_id: string;
    total_amount: number;
    visit_id: string;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.bill_generated,
      'New Bill Generated',
      `A new bill of ₹${data.total_amount.toFixed(2)} has been generated. Please review and complete payment.`,
      { bill_id: data.bill_id, visit_id: data.visit_id }
    );
  }

  static async notifyBillPaid(data: {
    patient_id: string;
    bill_id: string;
    total_amount: number;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.bill_paid,
      'Payment Confirmed',
      `Payment of ₹${data.total_amount.toFixed(2)} received. Thank you!`,
      { bill_id: data.bill_id }
    );
  }

  static async notifyReportUploaded(data: {
    patient_id: string;
    report_type: string;
    report_id: string;
    visit_id: string;
  }) {
    return this.sendNotification(
      data.patient_id,
      NotificationType.report_uploaded,
      'Report Available',
      `A new ${data.report_type} report has been uploaded to your Medical Records.`,
      { report_id: data.report_id, visit_id: data.visit_id }
    );
  }

  // ──────────────────────────────────────────────
  // Query helpers
  // ──────────────────────────────────────────────

  static async getForPatient(patient_id: string, limit = 50) {
    return NotificationModel.findByPatientId(patient_id, limit);
  }

  static async getUnreadCount(patient_id: string) {
    return NotificationModel.countUnread(patient_id);
  }

  static async markRead(notification_id: string, patient_id: string) {
    return NotificationModel.markRead(notification_id, patient_id);
  }

  static async markAllRead(patient_id: string) {
    return NotificationModel.markAllRead(patient_id);
  }

  // ──────────────────────────────────────────────
  // Device token helpers
  // ──────────────────────────────────────────────

  static async registerDeviceToken(patient_id: string, fcm_token: string, platform: string) {
    return NotificationModel.upsertDeviceToken({ patient_id, fcm_token, platform });
  }

  static async unregisterDeviceToken(patient_id: string, fcm_token: string) {
    return NotificationModel.removeDeviceToken(patient_id, fcm_token);
  }
}
