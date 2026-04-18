import { prisma } from '../../config/prisma';

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
