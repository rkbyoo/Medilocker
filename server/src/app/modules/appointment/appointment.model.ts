import { prisma } from '../../config/prisma';
import { AppointmentStatus } from '../../../../prisma/generated/client';
import type { CreateAppointmentRequest, UpdateAppointmentRequest } from './appointment.dto';

export class AppointmentModel {
  /**
   * Create a new appointment
   * Note: patient_id and hospital_id must be resolved before calling this method
   */
  static async create(data: {
    patient_id: string; // Required - must be resolved from patient_number if needed
    doctor_id: string;
    hospital_id: string; // Required - must be resolved from user context if needed
    department: string;
    reason?: string;
    scheduled_date_time: string;
    created_by: string;
    notes?: string;
  }) {
    return await prisma.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        hospital_id: data.hospital_id,
        department: data.department,
        reason: data.reason,
        scheduled_date_time: new Date(data.scheduled_date_time),
        status: AppointmentStatus.scheduled,
        created_by: data.created_by,
        notes: data.notes,
      },
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        doctor: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find appointment by ID
   */
  static async findById(appointment_id: string) {
    return await prisma.appointment.findUnique({
      where: { appointment_id },
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        doctor: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find appointments by doctor ID
   */
  static async findByDoctorId(doctor_id: string, filters?: {
    status?: AppointmentStatus;
    date_from?: Date;
    date_to?: Date;
    date?: Date;
  }) {
    const where: any = {
      doctor_id,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.date) {
      // For specific date (today/tomorrow)
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduled_date_time = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      if (filters?.date_from) {
        where.scheduled_date_time = { ...where.scheduled_date_time, gte: filters.date_from };
      }
      if (filters?.date_to) {
        where.scheduled_date_time = { ...where.scheduled_date_time, lte: filters.date_to };
      }
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        doctor: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduled_date_time: 'asc',
      },
    });
  }

  /**
   * Find appointments by patient ID
   */
  static async findByPatientId(patient_id: string) {
    return await prisma.appointment.findMany({
      where: { patient_id },
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        doctor: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduled_date_time: 'desc',
      },
    });
  }

  /**
   * Update appointment
   */
  static async update(appointment_id: string, data: UpdateAppointmentRequest) {
    const updateData: any = {};

    if (data.department) updateData.department = data.department;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.scheduled_date_time) {
      updateData.scheduled_date_time = new Date(data.scheduled_date_time);
    }
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.cancelled_reason !== undefined) {
      updateData.cancelled_reason = data.cancelled_reason;
      if (data.status === AppointmentStatus.cancelled) {
        updateData.cancelled_at = new Date();
      }
    }

    return await prisma.appointment.update({
      where: { appointment_id },
      data: updateData,
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        doctor: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete appointment
   */
  static async delete(appointment_id: string) {
    return await prisma.appointment.delete({
      where: { appointment_id },
    });
  }
}

