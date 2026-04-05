// // import { dummyMedicalRecords } from '@/data/dummyData';
// import type { ApiResponse, MedicalRecord } from '@/types';

// /**
//  * Medical Records API
//  * Handles all medical record operations
//  */

// export interface CreateMedicalRecordData {
//   patientId: string;
//   doctorId: string;
//   doctorName: string;
//   diagnosis: string;
//   medications: string;
//   advice: string;
//   nextVisit?: string;
// }

// export interface MedicalRecordResponse extends ApiResponse<MedicalRecord> {}

// /**
//  * Get medical records by patient ID
//  */
// export const getMedicalRecordsByPatientId = (patientId: string): MedicalRecord[] => {
//   return dummyMedicalRecords.filter(record => record.patientId === patientId);
// };

// /**
//  * Get medical records by doctor ID
//  */
// export const getMedicalRecordsByDoctorId = (doctorId: string): MedicalRecord[] => {
//   return dummyMedicalRecords.filter(record => record.doctorId === doctorId);
// };

// /**
//  * Get single medical record by ID
//  */
// export const getMedicalRecordById = (id: string): MedicalRecord | null => {
//   const record = dummyMedicalRecords.find(r => r.id === id);
//   return record || null;
// };

// /**
//  * Create new medical record
//  */
// export const createMedicalRecord = (data: CreateMedicalRecordData): MedicalRecordResponse => {
//   try {
//     const newRecord: MedicalRecord = {
//       id: `MR${Date.now()}`,
//       date: new Date().toISOString(),
//       ...data
//     };

//     // In real app: POST to backend API
//     // For now, just return the created record
//     return { success: true, data: newRecord };
//   } catch (error) {
//     return { success: false, error: 'Failed to create medical record' };
//   }
// };

// /**
//  * Get latest medical record for a patient
//  */
// export const getLatestMedicalRecord = (patientId: string): MedicalRecord | null => {
//   const records = getMedicalRecordsByPatientId(patientId);
  
//   if (records.length === 0) return null;
  
//   // Sort by date descending and return first
//   return records.sort((a, b) => 
//     new Date(b.date).getTime() - new Date(a.date).getTime()
//   )[0];
// };

// /**
//  * Format medical record date
//  */
// export const formatRecordDate = (date: string): string => {
//   return new Date(date).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });
// };
