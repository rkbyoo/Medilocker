import { Request, Response } from 'express';
import { VisitService } from './visit.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import type { CreateVisitRequest, UpdateVisitRequest, VisitQueryParams } from './visit.dto';
import type { DatabaseUser } from '../../types/global';
import { prisma } from '../../config/prisma';

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
}

