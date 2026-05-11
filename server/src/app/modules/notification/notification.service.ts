import { NotificationModel } from './notification.model';
import { NotificationType } from '../../../../prisma/generated/client';

export class NotificationService {
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
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.appointment_scheduled,
      title: '📅 Appointment Scheduled',
      body: `Your appointment with Dr. ${data.doctor_name} (${data.department}) is confirmed for ${date} at ${data.hospital_name}.`,
      data: { appointment_id: data.appointment_id },
    });
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
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.appointment_confirmed,
      title: '✅ Appointment Confirmed',
      body: `Your appointment with Dr. ${data.doctor_name} on ${date} has been confirmed.`,
      data: { appointment_id: data.appointment_id },
    });
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
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.appointment_cancelled,
      title: '❌ Appointment Cancelled',
      body: `Your appointment with Dr. ${data.doctor_name} on ${date} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`,
      data: { appointment_id: data.appointment_id },
    });
  }

  static async notifyAppointmentCompleted(data: {
    patient_id: string;
    doctor_name: string;
    appointment_id: string;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.appointment_completed,
      title: '🩺 Visit Completed',
      body: `Your consultation with Dr. ${data.doctor_name} has been completed. Check your Medical Records for details.`,
      data: { appointment_id: data.appointment_id },
    });
  }

  static async notifyVisitRecorded(data: {
    patient_id: string;
    doctor_name: string;
    visit_id: string;
    diagnosis?: string;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.visit_recorded,
      title: '📋 Visit Record Added',
      body: `A new visit record by Dr. ${data.doctor_name} has been added to your health history.${data.diagnosis ? ` Diagnosis: ${data.diagnosis}` : ''}`,
      data: { visit_id: data.visit_id },
    });
  }

  static async notifyPrescriptionReady(data: {
    patient_id: string;
    doctor_name: string;
    prescription_id: string;
    visit_id: string;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.prescription_ready,
      title: '💊 Prescription Available',
      body: `Dr. ${data.doctor_name} has issued a new prescription. View it in your Medical Records.`,
      data: { prescription_id: data.prescription_id, visit_id: data.visit_id },
    });
  }

  static async notifyBillGenerated(data: {
    patient_id: string;
    bill_id: string;
    total_amount: number;
    visit_id: string;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.bill_generated,
      title: '🧾 New Bill Generated',
      body: `A new bill of ₹${data.total_amount.toFixed(2)} has been generated. Please review and complete payment.`,
      data: { bill_id: data.bill_id, visit_id: data.visit_id },
    });
  }

  static async notifyBillPaid(data: {
    patient_id: string;
    bill_id: string;
    total_amount: number;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.bill_paid,
      title: '✅ Payment Confirmed',
      body: `Payment of ₹${data.total_amount.toFixed(2)} received. Thank you!`,
      data: { bill_id: data.bill_id },
    });
  }

  static async notifyReportUploaded(data: {
    patient_id: string;
    report_type: string;
    report_id: string;
    visit_id: string;
  }) {
    return NotificationModel.create({
      patient_id: data.patient_id,
      type: NotificationType.report_uploaded,
      title: '📄 Report Available',
      body: `A new ${data.report_type} report has been uploaded to your Medical Records.`,
      data: { report_id: data.report_id, visit_id: data.visit_id },
    });
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
