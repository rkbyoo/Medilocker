import { z } from 'zod';
import { VisitType } from '@prisma/client';

/**
 * Create Visit DTO
 * Accepts either patient_id (UUID) or patient_number (10-digit string)
 */
export const CreateVisitSchema = z.object({
  patient_id: z.string().refine(
    (val) => {
      // Accept UUID format
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
        return true;
      }
      // Accept 10-digit patient number
      if (/^\d{10}$/.test(val)) {
        return true;
      }
      return false;
    },
    { message: 'Patient ID must be a valid UUID or 10-digit patient number' }
  ),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  hospital_id: z.string().uuid('Invalid hospital ID').optional(),
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
  visit_date: z.string().datetime('Invalid date time format').optional(),
  visit_type: z.nativeEnum(VisitType).default('scheduled'),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  advice: z.string().optional(),
  next_visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export type CreateVisitRequest = z.infer<typeof CreateVisitSchema>;

/**
 * Update Visit DTO
 */
export const UpdateVisitSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  advice: z.string().optional(),
  next_visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export type UpdateVisitRequest = z.infer<typeof UpdateVisitSchema>;

/**
 * Query parameters for filtering visits
 */
export const VisitQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional(),
  hospital_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type VisitQueryParams = z.infer<typeof VisitQuerySchema>;

