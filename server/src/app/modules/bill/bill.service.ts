import { prisma } from '../../config/prisma';
import { PaymentStatus } from '@prisma/client';

export class BillService {
  /**
   * Get all bills for a specific patient.
   */
  static async getBills(patient_id: string) {
    if (!patient_id) {
      throw new Error('Patient ID must be provided');
    }

    const bills = await prisma.bill.findMany({
      where: {
        visit: {
          patient_id,
        },
      },
      include: {
        visit: {
          include: {
            hospital: true,
          },
        },
        billSections: {
          include: {
            billItems: true,
          },
        },
      },
    });

    return bills;
  }

  /**
   * Create a new bill for a visit.
   */
  static async createBill(data: {
    visit_id: string;
    total_amount: number;
    currency?: string;
    sections?: Array<{
      section_type: string;
      section_total: number;
      items?: Array<{
        description: string;
        quantity?: number;
        unit_price: number;
        total_price: number;
      }>;
    }>;
  }) {
    return prisma.bill.create({
      data: {
        visit_id: data.visit_id,
        total_amount: data.total_amount,
        currency: data.currency ?? 'INR',
        payment_status: PaymentStatus.pending,
        billSections: data.sections
          ? {
              create: data.sections.map((s) => ({
                section_type: s.section_type as any,
                section_total: s.section_total,
                billItems: s.items
                  ? {
                      create: s.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity ?? 1,
                        unit_price: i.unit_price,
                        total_price: i.total_price,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        visit: {
          select: { patient_id: true, visit_date: true, hospital: true },
        },
        billSections: { include: { billItems: true } },
      },
    });
  }

  /**
   * Update bill payment status.
   */
  static async updateBillStatus(bill_id: string, payment_status: string) {
    const status = payment_status as PaymentStatus;
    return prisma.bill.update({
      where: { bill_id },
      data: {
        payment_status: status,
        payment_date: status === PaymentStatus.paid ? new Date() : undefined,
      },
      include: {
        visit: {
          select: { patient_id: true, visit_date: true, hospital: true },
        },
        billSections: { include: { billItems: true } },
      },
    });
  }

  /**
   * Transforms Prisma Bill object to match the Flutter App's expected JSON format.
   */
  static transformBill(bill: any) {
    return {
      bill_id: bill.bill_id,
      visit_id: bill.visit_id,
      total_amount: bill.total_amount,
      currency: bill.currency,
      payment_status: bill.payment_status,
      payment_date: bill.payment_date ? bill.payment_date.toISOString() : null,
      visit_date: bill.visit?.visit_date ? bill.visit.visit_date.toISOString() : null,
      created_at: bill.created_at ? bill.created_at.toISOString() : null,
      hospital: bill.visit?.hospital ? {
        hospital_id: bill.visit.hospital.hospital_id,
        name: bill.visit.hospital.name,
        address: bill.visit.hospital.address,
        contact_number: bill.visit.hospital.contact_number,
      } : {},
      sections: bill.billSections?.map((section: any) => ({
        section_id: section.section_id,
        section_type: section.section_type,
        section_total: section.section_total,
        items: section.billItems?.map((item: any) => ({
          item_id: item.item_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })) || [],
      })) || [],
    };
  }
}

