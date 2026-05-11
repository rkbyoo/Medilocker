import { Request, Response } from 'express';
import { VisitService } from './visit.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import type { CreateVisitRequest, UpdateVisitRequest, VisitQueryParams } from './visit.dto';
import type { DatabaseUser } from '../../types/global';
import { prisma } from '../../config/prisma';
import { NotificationService } from '../notification';

export class VisitController {
  /**
   * Create a new visit
   * If appointment_id is provided, also updates appointment status to "completed"
   */
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const data = req.body as CreateVisitRequest;

      // Resolve patient_id from patient_number if needed
      let patient_id = data.patient_id;
      // Check if it's a patient_number (10-digit) instead of UUID
      if (patient_id && /^\d{10}$/.test(patient_id)) {
        const patient = await prisma.patient.findUnique({
          where: { patient_number: patient_id },
          select: { patient_id: true },
        });
        if (!patient) {
          return sendError(res, `Patient not found with patient number: ${patient_id}`, HTTP_STATUS.NOT_FOUND);
        }
        patient_id = patient.patient_id;
      }

      if (!patient_id) {
        return sendError(res, 'Patient ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Get hospital_id from user's hospital_users relationship if not provided
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

      const visit = await VisitService.createVisit({ ...data, patient_id }, hospital_id);
      const transformed = VisitService.transformVisit(visit);

      // Fire visit recorded notification (non-blocking)
      NotificationService.notifyVisitRecorded({
        patient_id: visit.patient_id,
        doctor_name: visit.doctor?.full_name ?? 'your doctor',
        visit_id: visit.visit_id,
        diagnosis: visit.diagnosis ?? undefined,
      }).catch((e) => console.error('Notification error (visit):', e));

      return sendSuccess(res, 'Visit created successfully', transformed, HTTP_STATUS.CREATED);
    } catch (error: any) {
      console.error('Create visit error:', error);
      return sendError(res, error.message || 'Failed to create visit', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get visit by ID
   */
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const visit = await VisitService.getVisitById(id);
      const transformed = VisitService.transformVisit(visit);

      return sendSuccess(res, 'Visit retrieved successfully', transformed);
    } catch (error: any) {
      if (error.message === 'Visit not found') {
        return sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
      }
      console.error('Get visit error:', error);
      return sendError(res, error.message || 'Failed to retrieve visit', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get visits with filters
   */
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const query = req.query as any;
      const filters: VisitQueryParams = {
        patient_id: query.patient_id,
        doctor_id: query.doctor_id,
        hospital_id: query.hospital_id,
        date_from: query.date_from,
        date_to: query.date_to,
        limit: query.limit,
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

      const visits = await VisitService.getVisits(filters);
      const transformed = visits.map(VisitService.transformVisit);

      return sendSuccess(res, 'Visits retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get visits error:', error);
      return sendError(res, error.message || 'Failed to retrieve visits', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get patient medical history
   * Supports both patient_id (UUID) and patient_number (10-digit)
   */
  static async getPatientHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { patient_id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      if (!patient_id) {
        return sendError(res, 'Patient ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      // Resolve patient_id from patient_number if needed
      let resolvedPatientId = patient_id;
      // Check if it's a patient_number (10-digit) instead of UUID
      if (/^\d{10}$/.test(patient_id)) {
        const patient = await prisma.patient.findUnique({
          where: { patient_number: patient_id },
          select: { patient_id: true },
        });
        if (!patient) {
          return sendError(res, `Patient not found with patient number: ${patient_id}`, HTTP_STATUS.NOT_FOUND);
        }
        resolvedPatientId = patient.patient_id;
      }

      const visits = await VisitService.getPatientMedicalHistory(resolvedPatientId, limit);
      const transformed = visits.map(VisitService.transformVisit);

      return sendSuccess(res, 'Patient medical history retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get patient history error:', error);
      return sendError(res, error.message || 'Failed to retrieve patient history', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update visit
   */
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateVisitRequest;

      const visit = await VisitService.updateVisit(id, data);
      const transformed = VisitService.transformVisit(visit);

      return sendSuccess(res, 'Visit updated successfully', transformed);
    } catch (error: any) {
      console.error('Update visit error:', error);
      return sendError(res, error.message || 'Failed to update visit', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/visits/:id/prescriptions
   * Add a prescription to a visit — fires prescription_ready notification
   */
  static async addPrescription(req: Request, res: Response): Promise<Response> {
    try {
      const { id: visit_id } = req.params;
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const { prescription_text, medications } = req.body;

      // Verify visit exists and get patient_id
      const visit = await prisma.visit.findUnique({
        where: { visit_id },
        select: {
          visit_id: true,
          patient_id: true,
          doctor: { select: { full_name: true } },
        },
      });
      if (!visit) return sendError(res, 'Visit not found', HTTP_STATUS.NOT_FOUND);

      const prescription = await prisma.prescription.create({
        data: {
          visit_id,
          prescribed_by: user.user_id,
          prescription_text: prescription_text ?? '',
          medications: medications
            ? {
                create: medications.map((m: any) => ({
                  name: m.name,
                  dosage: m.dosage,
                  frequency: m.frequency,
                  duration: m.duration,
                  instructions: m.instructions,
                })),
              }
            : undefined,
        },
        include: { medications: true },
      });

      // Fire notification (non-blocking)
      NotificationService.notifyPrescriptionReady({
        patient_id: visit.patient_id,
        doctor_name: visit.doctor?.full_name ?? 'your doctor',
        prescription_id: prescription.prescription_id,
        visit_id,
      }).catch((e) => console.error('Notification error (prescription):', e));

      return sendSuccess(res, 'Prescription added successfully', prescription, HTTP_STATUS.CREATED);
    } catch (error: any) {
      console.error('Add prescription error:', error);
      return sendError(res, error.message || 'Failed to add prescription', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/visits/:id/reports
   * Add a report to a visit — fires report_uploaded notification
   */
  static async addReport(req: Request, res: Response): Promise<Response> {
    try {
      const { id: visit_id } = req.params;
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const { report_type, file_url, file_type } = req.body;

      if (!report_type || !file_url) {
        return sendError(res, 'report_type and file_url are required', HTTP_STATUS.BAD_REQUEST);
      }

      // Verify visit exists and get patient_id
      const visit = await prisma.visit.findUnique({
        where: { visit_id },
        select: { visit_id: true, patient_id: true },
      });
      if (!visit) return sendError(res, 'Visit not found', HTTP_STATUS.NOT_FOUND);

      const report = await prisma.report.create({
        data: {
          visit_id,
          report_type,
          file_url,
          file_type: file_type ?? null,
        },
      });

      // Fire notification (non-blocking)
      NotificationService.notifyReportUploaded({
        patient_id: visit.patient_id,
        report_type,
        report_id: report.report_id,
        visit_id,
      }).catch((e) => console.error('Notification error (report):', e));

      return sendSuccess(res, 'Report added successfully', report, HTTP_STATUS.CREATED);
    } catch (error: any) {
      console.error('Add report error:', error);
      return sendError(res, error.message || 'Failed to add report', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}


