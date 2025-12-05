import { apiClient } from '@/services';
import { API_CONFIG } from '@/config/api';
import type { ApiResponse, MedicalRecord, PaginatedResponse } from '@/types';

/**
 * Medical Records API
 * Handles all medical record operations
 */

export interface CreateMedicalRecordData {
  patientId: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  medications: string;
  advice: string;
  nextVisit?: string;
}

export interface MedicalRecordResponse extends ApiResponse<MedicalRecord> {}

export interface MedicalRecordSearchParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get medical records by patient ID
 */
export const getMedicalRecordsByPatientId = async (
  patientId: string, 
  params: MedicalRecordSearchParams = {}
): Promise<MedicalRecord[]> => {
  try {
    if (!patientId) return [];
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BY_PATIENT(patientId)}?${queryParams.toString()}`;
    const response = await apiClient.get<MedicalRecord[]>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    return [];
  }
};

/**
 * Get medical records by doctor ID
 */
export const getMedicalRecordsByDoctorId = async (
  doctorId: string, 
  params: MedicalRecordSearchParams = {}
): Promise<MedicalRecord[]> => {
  try {
    if (!doctorId) return [];
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BY_DOCTOR(doctorId)}?${queryParams.toString()}`;
    const response = await apiClient.get<MedicalRecord[]>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching doctor medical records:', error);
    return [];
  }
};

/**
 * Get single medical record by ID
 */
export const getMedicalRecordById = async (id: string): Promise<MedicalRecord | null> => {
  try {
    if (!id) return null;
    
    const response = await apiClient.get<MedicalRecord>(
      API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BY_ID(id)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return null;
  }
};

/**
 * Create new medical record
 */
export const createMedicalRecord = async (data: CreateMedicalRecordData): Promise<MedicalRecordResponse> => {
  try {
    const response = await apiClient.post<MedicalRecord>(
      API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BASE,
      data
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to create medical record' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create medical record';
    return { success: false, error: message };
  }
};

/**
 * Update medical record
 */
export const updateMedicalRecord = async (id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecordResponse> => {
  try {
    const response = await apiClient.put<MedicalRecord>(
      API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BY_ID(id),
      updates
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to update medical record' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update medical record';
    return { success: false, error: message };
  }
};

/**
 * Delete medical record
 */
export const deleteMedicalRecord = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.MEDICAL_RECORDS.BY_ID(id));
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Failed to delete medical record' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete medical record';
    return { success: false, error: message };
  }
};

/**
 * Get latest medical record for a patient
 */
export const getLatestMedicalRecord = async (patientId: string): Promise<MedicalRecord | null> => {
  try {
    const records = await getMedicalRecordsByPatientId(patientId, { limit: 1 });
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Error fetching latest medical record:', error);
    return null;
  }
};

/**
 * Format medical record date
 */
export const formatRecordDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
