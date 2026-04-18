import { Request, Response } from 'express';
import { BillService } from './bill.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class BillController {
  /**
   * Get bills for a specific patient
   */
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const patient_id = req.query.patient_id as string;
      
      if (!patient_id) {
        return sendError(res, 'patient_id query parameter must be provided', HTTP_STATUS.BAD_REQUEST);
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
