import { apiClient } from '@/services';
import { API_CONFIG } from '@/config/api';
import type { ApiResponse, CreateAppointmentData, AppointmentResponse, Appointment, PaginatedResponse } from '@/types';

/**
 * Appointment API
 * Handles all appointment-related operations with proper error handling
 */

export interface AppointmentSearchParams {
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'completed' | 'cancelled';
  date?: string;
  doctorId?: string;
  patientId?: string;
}

/**
 * Get all appointments with pagination
 */
export const getAllAppointments = async (params: AppointmentSearchParams = {}): Promise<PaginatedResponse<Appointment>> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.date) queryParams.append('date', params.date);
    if (params.doctorId) queryParams.append('doctorId', params.doctorId);
    if (params.patientId) queryParams.append('patientId', params.patientId);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponse<Appointment>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch appointments',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch appointments',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
};

/**
 * Get appointments by doctor ID
 */
export const getAppointmentsByDoctorId = async (doctorId: string, params: AppointmentSearchParams = {}): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];
    
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.date) queryParams.append('date', params.date);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId)}?${queryParams.toString()}`;
    const response = await apiClient.get<Appointment[]>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return [];
  }
};

/**
 * Get appointments by patient ID
 */
export const getAppointmentsByPatientId = async (patientId: string, params: AppointmentSearchParams = {}): Promise<Appointment[]> => {
  try {
    if (!patientId) return [];
    
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.date) queryParams.append('date', params.date);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId)}?${queryParams.toString()}`;
    const response = await apiClient.get<Appointment[]>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return [];
  }
};

/**
 * Create new appointment
 */
export const createAppointment = async (data: CreateAppointmentData): Promise<AppointmentResponse> => {
  try {
    const response = await apiClient.post<Appointment>(
      API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE,
      data
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to create appointment' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    return { success: false, error: message };
  }
};

/**
 * Get today's appointments for a doctor
 */
export const getTodaysAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];
    
    const response = await apiClient.get<Appointment[]>(
      API_CONFIG.ENDPOINTS.APPOINTMENTS.TODAY(doctorId)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return [];
  }
};

/**
 * Get completed appointments for a doctor (recent patients)
 */
export const getCompletedAppointments = async (doctorId: string, limit = 5): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];
    
    const response = await getAppointmentsByDoctorId(doctorId, { 
      status: 'completed', 
      limit 
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching completed appointments:', error);
    return [];
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<AppointmentResponse> => {
  try {
    const response = await apiClient.put<Appointment>(
      API_CONFIG.ENDPOINTS.APPOINTMENTS.BY_ID(id),
      updates
    );

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    
    return { success: false, error: response.error || 'Failed to update appointment' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment';
    return { success: false, error: message };
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.APPOINTMENTS.BY_ID(id));
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Failed to delete appointment' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete appointment';
    return { success: false, error: message };
  }
};

/**
 * Format appointment time for display
 */
export const formatAppointmentTime = (dateTime: string): string => {
  try {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return 'Invalid time';
  }
};
