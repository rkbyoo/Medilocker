import { AppointmentModel } from './appointment.model';
import type { CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentQueryParams } from './appointment.dto';
import { AppointmentStatus } from '../../generated/prisma';

export class AppointmentService {
  /**
   * Create a new appointment
   * Note: This method expects patient_id and hospital_id to already be resolved
   */
  static async createAppointment(
    data: {
      patient_id: string;
      doctor_id: string;
      hospital_id: string;
      department: string;
      reason?: string;
      scheduled_date_time: string;
      notes?: string;
    },
    created_by: string
  ) {
    return await AppointmentModel.create({
      ...data,
      created_by,
    });
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(appointment_id: string) {
    const appointment = await AppointmentModel.findById(appointment_id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }

  /**
   * Get appointments with filters
   */
  static async getAppointments(filters: AppointmentQueryParams) {
    if (filters.doctor_id) {
      const dateFilter: any = {};
      
      if (filters.date) {
        dateFilter.date = new Date(filters.date);
      } else {
        if (filters.date_from) dateFilter.date_from = new Date(filters.date_from);
        if (filters.date_to) dateFilter.date_to = new Date(filters.date_to);
      }

      return await AppointmentModel.findByDoctorId(filters.doctor_id, {
        status: filters.status,
        ...dateFilter,
      });
    }

    if (filters.patient_id) {
      return await AppointmentModel.findByPatientId(filters.patient_id);
    }

    throw new Error('Either doctor_id or patient_id must be provided');
  }

  /**
   * Get today's appointments for a doctor
   */
  static async getTodaysAppointments(doctor_id: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await AppointmentModel.findByDoctorId(doctor_id, {
      date: today,
      status: AppointmentStatus.scheduled,
    });
  }

  /**
   * Get tomorrow's appointments for a doctor
   */
  static async getTomorrowsAppointments(doctor_id: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return await AppointmentModel.findByDoctorId(doctor_id, {
      date: tomorrow,
      status: AppointmentStatus.scheduled,
    });
  }

  /**
   * Get completed appointments for a doctor
   */
  static async getCompletedAppointments(doctor_id: string, limit = 5) {
    const appointments = await AppointmentModel.findByDoctorId(doctor_id, {
      status: AppointmentStatus.completed,
    });
    
    return appointments
      .sort((a, b) => 
        new Date(b.scheduled_date_time).getTime() - new Date(a.scheduled_date_time).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Update appointment
   */
  static async updateAppointment(appointment_id: string, data: UpdateAppointmentRequest) {
    return await AppointmentModel.update(appointment_id, data);
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointment_id: string, reason?: string) {
    return await AppointmentModel.update(appointment_id, {
      status: AppointmentStatus.cancelled,
      cancelled_reason: reason,
    });
  }

  /**
   * Transform appointment for API response
   */
  static transformAppointment(appointment: any) {
    return {
      id: appointment.appointment_id,
      appointment_id: appointment.appointment_id,
      patient_id: appointment.patient_id,
      patient_number: appointment.patient?.patient_number,
      patient_name: appointment.patient?.name,
      doctor_id: appointment.doctor_id,
      doctor_name: appointment.doctor?.full_name,
      hospital_id: appointment.hospital_id,
      hospital_name: appointment.hospital?.name,
      department: appointment.department,
      reason: appointment.reason,
      dateTime: appointment.scheduled_date_time.toISOString(),
      scheduled_date_time: appointment.scheduled_date_time.toISOString(),
      status: appointment.status,
      visit_id: appointment.visit_id || undefined, // Include visit_id if linked
      notes: appointment.notes,
      created_at: appointment.created_at.toISOString(),
      updated_at: appointment.updated_at.toISOString(),
    };
  }
}

