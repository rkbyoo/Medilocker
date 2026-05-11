import { Request, Response } from 'express';
import { BillService } from './bill.service';
import { sendSuccess, sendError } from '../../utils/response';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { prisma } from '../../config/prisma';
import { NotificationService } from '../notification';
import type { DatabaseUser } from '../../types/global';

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

  /**
   * POST /api/bills
   * Create a bill for a visit (hospital staff only) — fires bill_generated notification
   */
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user as DatabaseUser;
      if (!user) return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);

      const { visit_id, total_amount, currency, sections } = req.body;
      if (!visit_id || total_amount == null) {
        return sendError(res, 'visit_id and total_amount are required', HTTP_STATUS.BAD_REQUEST);
      }

      const bill = await BillService.createBill({ visit_id, total_amount, currency, sections });
      const transformed = BillService.transformBill(bill);

      // Notify patient (non-blocking)
      const patientId = bill.visit?.patient_id;
      if (patientId) {
        NotificationService.notifyBillGenerated({
          patient_id: patientId,
          bill_id: bill.bill_id,
          total_amount: Number(bill.total_amount),
          visit_id: bill.visit_id,
        }).catch((e) => console.error('Notification error (bill generated):', e));
      }

      return sendSuccess(res, 'Bill created successfully', transformed, HTTP_STATUS.CREATED);
    } catch (error: any) {
      console.error('Create bill error:', error);
      return sendError(res, error.message || 'Failed to create bill', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PATCH /api/bills/:id/status
   * Update bill payment status — fires bill_paid notification when status becomes 'paid'
   */
  static async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;

      if (!payment_status) {
        return sendError(res, 'payment_status is required', HTTP_STATUS.BAD_REQUEST);
      }

      const bill = await BillService.updateBillStatus(id, payment_status);
      const transformed = BillService.transformBill(bill);

      // Notify patient if payment confirmed
      if (payment_status === 'paid') {
        const patientId = bill.visit?.patient_id;
        if (patientId) {
          NotificationService.notifyBillPaid({
            patient_id: patientId,
            bill_id: bill.bill_id,
            total_amount: Number(bill.total_amount),
          }).catch((e) => console.error('Notification error (bill paid):', e));
        }
      }

      return sendSuccess(res, 'Bill status updated', transformed);
    } catch (error: any) {
      console.error('Update bill status error:', error);
      return sendError(res, error.message || 'Failed to update bill status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
