import { z } from 'zod';
import { AppointmentStatus } from '../../generated/prisma';

/**
 * Create Appointment DTO
 * Accepts either patient_id (UUID) or patient_number (10-digit string)
 */
export const CreateAppointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID').optional(),
  patient_number: z.string().regex(/^\d{10}$/, 'Patient number must be exactly 10 digits').optional(),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  hospital_id: z.string().uuid('Invalid hospital ID').optional(),
  department: z.string().min(1, 'Department is required').max(100),
  reason: z.string().optional(),
  scheduled_date_time: z.string().refine(
    (val) => {
      // Accept ISO 8601 format with or without seconds/milliseconds
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
      if (isoRegex.test(val)) return true;
      // Also accept format like "2025-12-22T23:26" and we'll normalize it
      const simpleRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      return simpleRegex.test(val);
    },
    { message: 'Invalid date time format. Use ISO 8601 format (e.g., 2025-12-22T23:26:00)' }
  ),
  notes: z.string().optional(),
}).refine(
  (data) => data.patient_id || data.patient_number,
  { message: 'Either patient_id or patient_number must be provided', path: ['patient_id'] }
);

export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;

/**
 * Update Appointment DTO
 */
export const UpdateAppointmentSchema = z.object({
  department: z.string().min(1).max(100).optional(),
  reason: z.string().optional(),
  scheduled_date_time: z.string().datetime().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  cancelled_reason: z.string().optional(),
});

export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;

/**
 * Query parameters for filtering appointments
 */
export const AppointmentQuerySchema = z.object({
  doctor_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  hospital_id: z.string().uuid().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  date: z.string().datetime().optional(), // For specific date (today/tomorrow)
});

export type AppointmentQueryParams = z.infer<typeof AppointmentQuerySchema>;

