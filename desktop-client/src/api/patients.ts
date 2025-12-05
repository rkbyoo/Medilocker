import { apiClient } from '@/services';
import { API_CONFIG } from '@/config/api';
import type { ApiResponse, PatientResponse, Patient, PaginatedResponse } from '@/types';

/**
 * Patient API
 * Handles all patient-related operations with proper error handling
 */

export interface CreatePatientData extends Omit<Patient, 'id'> {
  id?: string;
}

export interface PatientSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'id' | 'dateOfBirth';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all patients with pagination
 */
export const getAllPatients = async (params: PatientSearchParams = {}): Promise<PaginatedResponse<Patient>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.PATIENTS.BASE}?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponse<Patient>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch patients',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch patients',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    if (!id) return null;
    
    const response = await apiClient.get<Patient>(API_CONFIG.ENDPOINTS.PATIENTS.BY_ID(id));
    
    if (response.success && response.data) {
      return response.data;
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
    const response = await apiClient.post<Patient>(
      API_CONFIG.ENDPOINTS.PATIENTS.BASE,
      data
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to create patient' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create patient';
    return { success: false, error: message };
  }
};

/**
 * Update patient
 */
export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<PatientResponse> => {
  try {
    const response = await apiClient.put<Patient>(
      API_CONFIG.ENDPOINTS.PATIENTS.BY_ID(id),
      updates
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to update patient' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update patient';
    return { success: false, error: message };
  }
};

/**
 * Delete patient
 */
export const deletePatient = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PATIENTS.BY_ID(id));
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Failed to delete patient' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete patient';
    return { success: false, error: message };
  }
};

/**
 * Search patients
 */
export const searchPatients = async (params: PatientSearchParams): Promise<PaginatedResponse<Patient>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('q', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.PATIENTS.SEARCH}?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponse<Patient>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return {
      success: false,
      error: response.error || 'Search failed',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  } catch (error) {
    console.error('Error searching patients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
};

/**
 * Search patients by name (legacy support)
 */
export const searchPatientsByName = async (searchTerm: string): Promise<Patient[]> => {
  const result = await searchPatients({ query: searchTerm });
  return result.data || [];
};

/**
 * Search patients by ID (legacy support)
 */
export const searchPatientsById = async (searchTerm: string): Promise<Patient[]> => {
  const result = await searchPatients({ query: searchTerm });
  return result.data || [];
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
