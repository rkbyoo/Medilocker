import { Request, Response } from 'express';
import { PatientService } from './patient.service';
import { PatientModel } from './patient.model';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class PatientController {
  /**
   * Get the authenticated patient's own profile
   * GET /api/patients/me
   */
  static async getMe(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const patient = await PatientModel.findByUserId(userId);

      if (!patient) {
        return sendError(res, 'Patient not found', HTTP_STATUS.NOT_FOUND);
      }

      const transformedPatient = PatientService.transformPatient(patient);
      return sendSuccess(res, 'Patient retrieved successfully', transformedPatient);
    } catch (error: any) {
      console.error('Get me error:', error);
      return sendError(res, 'Failed to retrieve patient', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update the authenticated patient's own profile
   * PUT /api/patients/me
   */
  static async updateMe(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const patient = await PatientModel.findByUserId(userId);

      if (!patient) {
        return sendError(res, 'Patient not found', HTTP_STATUS.NOT_FOUND);
      }

      const updated = await PatientModel.updateById(patient.patient_id, req.body);
      const transformedPatient = PatientService.transformPatient(updated);
      return sendSuccess(res, 'Profile updated successfully', transformedPatient);
    } catch (error: any) {
      console.error('Update me error:', error);
      return sendError(res, 'Failed to update patient', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }


  /**
   * Register a new patient
   * POST /api/patients
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const patientData = req.body;
      const patient = await PatientService.registerPatient(patientData);

      if (!patient) {
        return sendError(res, 'Failed to register patient', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      const transformedPatient = PatientService.transformPatient(patient);

      return sendSuccess(
        res,
        'Patient registered successfully',
        transformedPatient,
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      console.error('Patient registration error:', error);

      if (error.code === 'P2002') {
        // Unique constraint violation
        return sendError(res, 'Patient with this information already exists', HTTP_STATUS.CONFLICT);
      }

      return sendError(
        res,
        error.message || 'Failed to register patient',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get patient by ID (supports patient_id, NFC card UID, or user_id)
   * GET /api/patients/:id
   */
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, 'Patient ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      console.log('Searching for patient with identifier:', id);
      console.log('Identifier length:', id.length);
      console.log('Identifier trimmed:', id.trim());

      // Try flexible lookup (patient_id, NFC card UID, or user_id)
      const patient = await PatientModel.findByAnyId(id);

      if (!patient) {
        console.log('Patient not found for identifier:', id);
        return sendError(res, 'Patient not found', HTTP_STATUS.NOT_FOUND);
      }

      console.log('Patient found:', patient.patient_number, patient.name);
      const transformedPatient = PatientService.transformPatient(patient);

      return sendSuccess(res, 'Patient retrieved successfully', transformedPatient);
    } catch (error: any) {
      console.error('Get patient error:', error);
      return sendError(res, 'Failed to retrieve patient', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Search/list patients
   * GET /api/patients?q=search&page=1&limit=20
   */
  static async search(req: Request, res: Response): Promise<Response> {
    try {
      const query = (req.query.q as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await PatientService.searchPatients(query, page, limit);

      const transformedPatients = result.patients.map((patient) =>
        PatientService.transformPatient(patient)
      );

      return sendSuccess(res, 'Patients retrieved successfully', {
        patients: transformedPatients,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      console.error('Search patients error:', error);
      return sendError(res, 'Failed to search patients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

