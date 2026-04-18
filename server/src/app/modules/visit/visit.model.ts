import { prisma } from '../../config/prisma';
import { VisitType, AppointmentStatus } from '../../../../prisma/generated/client';
import type { CreateVisitRequest, UpdateVisitRequest } from './visit.dto';

export class VisitModel {
  /**
   * Create a new visit
   * If appointment_id is provided, also updates the appointment status to "completed"
   */
  static async create(data: CreateVisitRequest & { hospital_id: string }) {
    return await prisma.$transaction(async (tx) => {
      // Create visit
      const visit = await tx.visit.create({
        data: {
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          hospital_id: data.hospital_id,
          visit_date: data.visit_date ? new Date(data.visit_date) : new Date(),
          visit_type: data.visit_type,
          diagnosis: data.diagnosis,
          notes: data.notes,
          advice: data.advice,
          next_visit_date: data.next_visit_date ? new Date(data.next_visit_date) : null,
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
          appointment: {
            select: {
              appointment_id: true,
              scheduled_date_time: true,
              department: true,
            },
          },
        },
      });

      // If appointment_id is provided, update appointment status and link visit
      if (data.appointment_id) {
        await tx.appointment.update({
          where: { appointment_id: data.appointment_id },
          data: {
            status: AppointmentStatus.completed,
            visit_id: visit.visit_id,
          },
        });
      }

      return visit;
    });
  }

  /**
   * Find visit by ID
   */
  static async findById(visit_id: string) {
    return await prisma.visit.findUnique({
      where: { visit_id },
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
        appointment: {
          select: {
            appointment_id: true,
            scheduled_date_time: true,
            department: true,
          },
        },
        prescriptions: {
          select: {
            prescription_id: true,
            prescription_text: true,
            created_at: true,
            medications: true,
          },
        },
      },
    });
  }

  /**
   * Find visits by patient ID (medical history)
   */
  static async findByPatientId(patient_id: string, limit?: number) {
    return await prisma.visit.findMany({
      where: { patient_id },
      include: {
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
        appointment: {
          select: {
            appointment_id: true,
            scheduled_date_time: true,
            department: true,
          },
        },
        prescriptions: {
          select: {
            prescription_id: true,
            prescription_text: true,
            created_at: true,
            medications: true,
          },
        },
      },
      orderBy: {
        visit_date: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Find visits by doctor ID
   */
  static async findByDoctorId(doctor_id: string, limit?: number) {
    return await prisma.visit.findMany({
      where: { doctor_id },
      include: {
        patient: {
          select: {
            patient_id: true,
            patient_number: true,
            name: true,
            phone_number: true,
          },
        },
        hospital: {
          select: {
            hospital_id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            appointment_id: true,
            scheduled_date_time: true,
            department: true,
          },
        },
      },
      orderBy: {
        visit_date: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Update visit
   */
  static async update(visit_id: string, data: UpdateVisitRequest) {
    const updateData: any = {};

    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.advice !== undefined) updateData.advice = data.advice;
    if (data.next_visit_date !== undefined) {
      updateData.next_visit_date = data.next_visit_date ? new Date(data.next_visit_date) : null;
    }

    return await prisma.visit.update({
      where: { visit_id },
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
        appointment: {
          select: {
            appointment_id: true,
            scheduled_date_time: true,
            department: true,
          },
        },
        prescriptions: {
          select: {
            prescription_id: true,
            prescription_text: true,
            created_at: true,
            medications: true,
          },
        },
      },
    });
  }

  /**
   * Delete visit
   */
  static async delete(visit_id: string) {
    return await prisma.visit.delete({
      where: { visit_id },
    });
  }
}

