import { VisitModel } from './visit.model';
import type { CreateVisitRequest, UpdateVisitRequest, VisitQueryParams } from './visit.dto';

export class VisitService {
  /**
   * Create a new visit
   * If appointment_id is provided, also updates appointment status to "completed"
   */
  static async createVisit(data: CreateVisitRequest, hospital_id: string) {
    return await VisitModel.create({
      ...data,
      hospital_id,
    });
  }

  /**
   * Get visit by ID
   */
  static async getVisitById(visit_id: string) {
    const visit = await VisitModel.findById(visit_id);
    if (!visit) {
      throw new Error('Visit not found');
    }
    return visit;
  }

  /**
   * Get visits with filters
   */
  static async getVisits(filters: VisitQueryParams) {
    if (filters.patient_id) {
      return await VisitModel.findByPatientId(filters.patient_id, filters.limit);
    }

    if (filters.doctor_id) {
      return await VisitModel.findByDoctorId(filters.doctor_id, filters.limit);
    }

    throw new Error('Either patient_id or doctor_id must be provided');
  }

  /**
   * Get patient medical history (all visits)
   */
  static async getPatientMedicalHistory(patient_id: string, limit?: number) {
    return await VisitModel.findByPatientId(patient_id, limit);
  }

  /**
   * Update visit
   */
  static async updateVisit(visit_id: string, data: UpdateVisitRequest) {
    return await VisitModel.update(visit_id, data);
  }

  /**
   * Transform visit for API response
   */
  static transformVisit(visit: any) {
    return {
      id: visit.visit_id,
      visit_id: visit.visit_id,
      patient_id: visit.patient_id,
      patient_number: visit.patient?.patient_number,
      patient_name: visit.patient?.name,
      doctor_id: visit.doctor_id,
      doctor_name: visit.doctor?.full_name,
      hospital_id: visit.hospital_id,
      hospital_name: visit.hospital?.name,
      appointment_id: visit.appointment?.appointment_id,
      visit_date: visit.visit_date.toISOString(),
      visit_type: visit.visit_type,
      diagnosis: visit.diagnosis,
      notes: visit.notes,
      advice: visit.advice,
      next_visit_date: visit.next_visit_date ? visit.next_visit_date.toISOString().split('T')[0] : null,
      prescriptions: visit.prescriptions || [],
      created_at: visit.created_at.toISOString(),
      updated_at: visit.updated_at.toISOString(),
    };
  }
}

