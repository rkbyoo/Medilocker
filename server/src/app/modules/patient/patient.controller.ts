import { Request, Response } from 'express';
import { PatientService } from './patient.service';
import { PatientModel } from './patient.model';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class PatientController {
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

      // Try flexible lookup (patient_id, NFC card UID, or user_id)
      const patient = await PatientModel.findByAnyId(id);

      if (!patient) {
        return sendError(res, 'Patient not found', HTTP_STATUS.NOT_FOUND);
      }

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

