import { dummyPatients, generatePatientId as generateId } from '@/data/dummyData';
import type { ApiResponse, PatientResponse, Patient } from '@/types';

/**
 * Patient API
 * Handles all patient-related operations with proper error handling
 */

export interface CreatePatientData extends Omit<Patient, 'id'> {
  id?: string;
}

// PatientResponse type is imported from centralized types file

/**
 * Get all patients
 */
export const getAllPatients = (): Patient[] => {
  try {
    return [...dummyPatients];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = (id: string): Patient | null => {
  try {
    if (!id) return null;
    const patient = dummyPatients.find(p => p.id === id);
    return patient || null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

/**
 * Create new patient
 */
export const createPatient = (data: CreatePatientData): PatientResponse => {
  try {
    const newPatient: Patient = {
      ...data,
      id: data.id || generateId(),
    };

    dummyPatients.push(newPatient);
    return { success: true, data: newPatient };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create patient';
    return { success: false, error: message };
  }
};

/**
 * Update patient
 */
export const updatePatient = (id: string, updates: Partial<Patient>): PatientResponse => {
  try {
    const patientIndex = dummyPatients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return { success: false, error: 'Patient not found' };
    }

    dummyPatients[patientIndex] = {
      ...dummyPatients[patientIndex],
      ...updates
    };
    
    return { success: true, data: dummyPatients[patientIndex] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update patient';
    return { success: false, error: message };
  }
};

/**
 * Delete patient
 */
export const deletePatient = (id: string): ApiResponse => {
  try {
    const patientIndex = dummyPatients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return { success: false, error: 'Patient not found' };
    }

    dummyPatients.splice(patientIndex, 1);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete patient';
    return { success: false, error: message };
  }
};

/**
 * Search patients by name
 */
export const searchPatientsByName = (searchTerm: string): Patient[] => {
  const term = searchTerm.toLowerCase();
  return dummyPatients.filter(p => 
    p.name.toLowerCase().includes(term)
  );
};

/**
 * Search patients by ID
 */
export const searchPatientsById = (searchTerm: string): Patient[] => {
  return dummyPatients.filter(p => 
    p.id.includes(searchTerm)
  );
};



/**
 * Calculate patient age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
