import { Request, Response } from 'express';
import { BillService } from './bill.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { prisma } from '../../config/prisma';

export class BillController {
  /**
   * Get bills for a specific patient
   */
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      let patient_id = req.query.patient_id as string | undefined;
      
      // Fallback: If not provided in query, infer it from the logged-in patient's token
      if (!patient_id && req.user && req.user.role === 'patient') {
        const patient = await prisma.patient.findUnique({
          where: { user_id: req.user.user_id },
          select: { patient_id: true }
        });
        if (patient) {
          patient_id = patient.patient_id;
        }
      }

      if (!patient_id) {
        return sendError(res, 'patient_id query parameter or token must be provided', HTTP_STATUS.BAD_REQUEST);
      }

      const bills = await BillService.getBills(patient_id);
      const transformed = bills.map(BillService.transformBill);

      return sendSuccess(res, 'Bills retrieved successfully', transformed);
    } catch (error: any) {
      console.error('Get bills error:', error);
      return sendError(res, error.message || 'Failed to retrieve bills', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
