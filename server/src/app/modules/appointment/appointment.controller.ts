import { Request, Response } from 'express';
import { AppointmentService } from './appointment.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import type { CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentQueryParams } from './appointment.dto';
import type { DatabaseUser } from '../../types/global';
import { prisma } from '../../config/prisma';
import { NotificationService } from '../notification';

export class AppointmentController {
  /**
   * Create a new appointment
   */
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const data = req.body as CreateAppointmentRequest;
      
      // Resolve patient_id from patient_number if needed
      let patient_id = data.patient_id;
      if (!patient_id && data.patient_number) {
        const patient = await prisma.patient.findUnique({
          where: { patient_number: data.patient_number },
          select: { patient_id: true },
        });
        if (!patient) {
          return sendError(res, `Patient not found with patient number: ${data.patient_number}`, HTTP_STATUS.NOT_FOUND);
        }
        patient_id = patient.patient_id;
      }

      if (!patient_id) {
        return sendError(res, 'Patient ID or patient number is required', HTTP_STATUS.BAD_REQUEST);
      }

      // If hospital_id is not provided, get it from user's hospital_users relationship
      let hospital_id = data.hospital_id;
      if (!hospital_id && user.role === 'hospital_staff') {
        const hospitalUser = await prisma.hospitalUser.findFirst({
          where: { user_id: user.user_id },
          select: { hospital_id: true },
        });
        if (hospitalUser) {
          hospital_id = hospitalUser.hospital_id;
        }
      }

      if (!hospital_id) {
        return sendError(res, 'Hospital ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Normalize scheduled_date_time format
      // If format is "2025-12-22T23:26", add seconds and default timezone (+05:30 for IST)
      // This prevents the time from being treated as UTC and shifted by 5.5 hours in the UI
      let scheduled_date_time = data.scheduled_date_time;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduled_date_time)) {
        scheduled_date_time = scheduled_date_time + ':00+05:30';
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(scheduled_date_time)) {
        // If it already has seconds but no timezone
        scheduled_date_time = scheduled_date_time + '+05:30';
      }

      const appointment = await AppointmentService.createAppointment(
        { 
          ...data, 
          patient_id,
          doctor_id: data.doctor_id,
          hospital_id,
          scheduled_date_time,
        },
        user.user_id
      );
      const transformed = AppointmentService.transformAppointment(appointment);

      // Fire notification (non-blocking)
      NotificationService.notifyAppointmentScheduled({
        patient_id: appointment.patient_id,
        doctor_name: appointment.doctor?.full_name ?? 'your doctor',
        department: appointment.department,
        scheduled_date_time: appointment.scheduled_date_time.toISOString(),
        appointment_id: appointment.appointment_id,
        hospital_name: appointment.hospital?.name ?? '',
      }).catch((e) => console.error('Notification error (create):', e));

      return sendSuccess(res, 'Appointment created successfully', transformed, HTTP_STATUS.CREATED);
    } catch (error: any) {
      console.error('Create appointment error:', error);
      return sendError(res, error.message || 'Failed to create appointment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get appointment by ID
   */
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.getAppointmentById(id);
      const transformed = AppointmentService.transformAppointment(appointment);

      return sendSuccess(res, 'Appointment retrieved successfully', transformed);
    } catch (error: any) {
      if (error.message === 'Appointment not found') {
        return sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
      }
      console.error('Get appointment error:', error);
      return sendError(res, error.message || 'Failed to retrieve appointment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get appointments with filters
   */
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const query = req.query as any;
      const filters: AppointmentQueryParams = {
        doctor_id: query.doctor_id,
        patient_id: query.patient_id,
        hospital_id: query.hospital_id,
        status: query.status,
        date_from: query.date_from,
        date_to: query.date_to,
        date: query.date,
      };

      if (req.user && req.user.role === 'patient') {
        const patient = await prisma.patient.findUnique({
          where: { user_id: req.user.user_id },
          select: { patient_id: true }
        });
        if (patient) {
          filters.patient_id = patient.patient_id;
        }
      }

      const appointments = await AppointmentService.getAppointments(filters);
      const transformed = appointments.map(AppointmentService.transformAppointment);

      return sendSuccess(res, 'Appointments retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get appointments error:', error);
      return sendError(res, error.message || 'Failed to retrieve appointments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get today's appointments for a doctor
   */
  static async getTodays(req: Request, res: Response): Promise<Response> {
    try {
      const { doctor_id } = req.params;
      if (!doctor_id) {
        return sendError(res, 'Doctor ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const appointments = await AppointmentService.getTodaysAppointments(doctor_id);
      const transformed = appointments.map(AppointmentService.transformAppointment);

      return sendSuccess(res, 'Today\'s appointments retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get today\'s appointments error:', error);
      return sendError(res, error.message || 'Failed to retrieve today\'s appointments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get tomorrow's appointments for a doctor
   */
  static async getTomorrows(req: Request, res: Response): Promise<Response> {
    try {
      const { doctor_id } = req.params;
      if (!doctor_id) {
        return sendError(res, 'Doctor ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const appointments = await AppointmentService.getTomorrowsAppointments(doctor_id);
      const transformed = appointments.map(AppointmentService.transformAppointment);

      return sendSuccess(res, 'Tomorrow\'s appointments retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get tomorrow\'s appointments error:', error);
      return sendError(res, error.message || 'Failed to retrieve tomorrow\'s appointments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get completed appointments for a doctor
   */
  static async getCompleted(req: Request, res: Response): Promise<Response> {
    try {
      const { doctor_id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

      if (!doctor_id) {
        return sendError(res, 'Doctor ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const appointments = await AppointmentService.getCompletedAppointments(doctor_id, limit);
      const transformed = appointments.map(AppointmentService.transformAppointment);

      return sendSuccess(res, 'Completed appointments retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get completed appointments error:', error);
      return sendError(res, error.message || 'Failed to retrieve completed appointments', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update appointment
   */
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateAppointmentRequest;
      
      // Normalize scheduled_date_time if provided
      if (data.scheduled_date_time) {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.scheduled_date_time)) {
          data.scheduled_date_time = data.scheduled_date_time + ':00+05:30';
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(data.scheduled_date_time)) {
          data.scheduled_date_time = data.scheduled_date_time + '+05:30';
        }
      }

      const appointment = await AppointmentService.updateAppointment(id, data);
      const transformed = AppointmentService.transformAppointment(appointment);

      // Fire status-specific notifications
      if (data.status === 'confirmed') {
        NotificationService.notifyAppointmentConfirmed({
          patient_id: appointment.patient_id,
          doctor_name: appointment.doctor?.full_name ?? 'your doctor',
          scheduled_date_time: appointment.scheduled_date_time.toISOString(),
          appointment_id: appointment.appointment_id,
        }).catch((e) => console.error('Notification error (confirmed):', e));
      } else if (data.status === 'completed') {
        NotificationService.notifyAppointmentCompleted({
          patient_id: appointment.patient_id,
          doctor_name: appointment.doctor?.full_name ?? 'your doctor',
          appointment_id: appointment.appointment_id,
        }).catch((e) => console.error('Notification error (completed):', e));
      }

      return sendSuccess(res, 'Appointment updated successfully', transformed);
    } catch (error: any) {
      console.error('Update appointment error:', error);
      return sendError(res, error.message || 'Failed to update appointment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cancel appointment
   */
  static async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await AppointmentService.cancelAppointment(id, reason);
      const transformed = AppointmentService.transformAppointment(appointment);

      // Notify patient of cancellation
      NotificationService.notifyAppointmentCancelled({
        patient_id: appointment.patient_id,
        doctor_name: appointment.doctor?.full_name ?? 'your doctor',
        scheduled_date_time: appointment.scheduled_date_time.toISOString(),
        appointment_id: appointment.appointment_id,
        reason,
      }).catch((e) => console.error('Notification error (cancel):', e));

      return sendSuccess(res, 'Appointment cancelled successfully', transformed);
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      return sendError(res, error.message || 'Failed to cancel appointment', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

