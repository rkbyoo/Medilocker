import type { ApiResponse, PatientResponse, Patient } from '@/types';
import { getApiUrl, getAuthHeader } from '@/config/api';

/**
 * Patient API
 * Handles all patient-related operations with proper error handling
 */

export interface CreatePatientData extends Omit<Patient, 'id'> {
  id?: string;
}

/**
 * Get all patients
 */
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const response = await fetch(getApiUrl('patients'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch patients');
    }

    const data = await response.json();
    
    if (data.success && data.data?.patients) {
      return data.data.patients;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    if (!id) return null;

    const response = await fetch(getApiUrl(`patients/${id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

/**
 * Create new patient
 */
export const createPatient = async (data: CreatePatientData): Promise<PatientResponse> => {
  try {
    const response = await fetch(getApiUrl('patients'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to create patient',
      };
    }

    return {
      success: true,
      data: result.data,
    };
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
 * Search patients by name or ID
 */
export const searchPatientsByName = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const response = await fetch(getApiUrl(`patients?q=${encodeURIComponent(searchTerm)}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.success && data.data?.patients) {
      return data.data.patients;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
};

/**
 * Search patients by ID
 */
export const searchPatientsById = async (searchTerm: string): Promise<Patient[]> => {
  // Use the same search endpoint - backend searches both name and ID
  return searchPatientsByName(searchTerm);
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
