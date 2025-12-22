import { PatientModel } from './patient.model';
import { CreatePatientRequest, UpdatePatientRequest } from './patient.dto';
import { hashPassword } from '../../utils/bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class PatientService {
  /**
   * Register a new patient
   */
  static async registerPatient(data: CreatePatientRequest) {
    // Generate email for patient (using phone or UUID)
    const email = data.phoneNumber
      ? `patient.${data.phoneNumber.replace(/\D/g, '')}@hospital.local`
      : `patient.${uuidv4()}@hospital.local`;

    // Parse date of birth
    const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;

    // Create patient with user account
    const patient = await PatientModel.createPatientWithUser({
      email,
      full_name: data.name,
      phone: data.phoneNumber,
      password_hash: '', // Patients don't need password for now
      name: data.name,
      dob,
      gender: data.gender,
      blood_group: data.bloodGroup,
      phone_number: data.phoneNumber,
      guardian_phone: data.guardianPhone,
      address: data.address,
      marital_status: data.maritalStatus,
      spouse_name: data.spouseName,
      caste: data.caste,
      religion: data.religion,
      nationality: data.nationality,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_number: data.emergencyContactNumber,
      photo_url: data.photo,
    });

    // Add allergies if provided
    if (data.allergies && data.allergies.length > 0) {
      await PatientModel.addAllergies(patient.patient_id, data.allergies);
    }

    // Add chronic conditions if provided
    if (data.chronicConditions && data.chronicConditions.length > 0) {
      await PatientModel.addChronicConditions(patient.patient_id, data.chronicConditions);
    }

    // Fetch complete patient data with allergies and conditions
    const completePatient = await PatientModel.findById(patient.patient_id);

    return completePatient;
  }

  /**
   * Get patient by ID (supports patient_id, NFC card UID, or user_id)
   */
  static async getPatientById(identifier: string) {
    return await PatientModel.findByAnyId(identifier);
  }

  /**
   * Search patients
   */
  static async searchPatients(query: string, page: number = 1, limit: number = 20) {
    if (query.trim()) {
      return await PatientModel.search(query, page, limit);
    }
    return await PatientModel.findAll(page, limit);
  }

  /**
   * Transform patient data to frontend format
   */
  static transformPatient(patient: any) {
    if (!patient) return null;

    return {
      id: patient.patient_number || patient.patient_id, // Return patient_number as primary ID, fallback to UUID
      patientId: patient.patient_id, // Full UUID (for internal use)
      patientNumber: patient.patient_number, // 10-digit patient number (primary identifier)
      nfcCardUid: patient.nfc_card_uid || '', // NFC card ID
      name: patient.name,
      dateOfBirth: patient.dob ? patient.dob.toISOString().split('T')[0] : '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.blood_group || '',
      phoneNumber: patient.phone_number || '',
      guardianPhone: patient.guardian_phone || '',
      address: patient.address || '',
      maritalStatus: patient.marital_status || 'Single',
      spouseName: patient.spouse_name || '',
      caste: patient.caste || '',
      religion: patient.religion || '',
      nationality: patient.nationality || '',
      emergencyContactName: patient.emergency_contact_name || '',
      emergencyContactNumber: patient.emergency_contact_number || '',
      allergies: patient.allergies?.map((a: any) => a.allergy_name) || [],
      chronicConditions: patient.chronicConditions?.map((c: any) => c.condition_name) || [],
      photo: patient.photo_url || '',
    };
  }
}

