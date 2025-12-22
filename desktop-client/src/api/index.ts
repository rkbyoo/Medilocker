/**
 * API Index
 * Central export point for all API modules
 * 
 * Usage:
 * import { authApi, patientsApi, appointmentsApi, medicalRecordsApi } from '@/api';
 */

import * as authApi from './auth';
import * as patientsApi from './patients';
import * as appointmentsApi from './appointments';
import * as medicalRecordsApi from './medicalRecords';
import * as usersApi from './users';
import * as visitsApi from './visits';

export {
  authApi,
  patientsApi,
  appointmentsApi,
  medicalRecordsApi,
  usersApi,
  visitsApi
};

// Re-export types for convenience
export type { LoginCredentials, AuthResponse } from './auth';
export type { CreatePatientData } from './patients';
export type { CreateMedicalRecordData } from './medicalRecords';

// Note: CreateAppointmentData, PatientResponse, AppointmentResponse, 
// and MedicalRecordResponse are available from '@/types'
