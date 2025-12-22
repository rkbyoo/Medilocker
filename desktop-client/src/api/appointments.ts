import type { ApiResponse, CreateAppointmentData, AppointmentResponse, Appointment } from '@/types';
import { getApiUrl, getAuthHeader } from '@/config/api';

/**
 * Appointment API
 * Handles all appointment-related operations with proper error handling
 */

/**
 * Transform backend appointment to frontend format
 */
const transformAppointment = (apt: any): Appointment => {
  return {
    id: apt.id || apt.appointment_id,
    appointment_id: apt.appointment_id || apt.id,
    patientId: apt.patient_id,
    patientNumber: apt.patient_number,
    patientName: apt.patient_name,
    doctorId: apt.doctor_id,
    doctorName: apt.doctor_name,
    hospitalId: apt.hospital_id,
    hospitalName: apt.hospital_name,
    department: apt.department,
    reason: apt.reason,
    dateTime: apt.dateTime || apt.scheduled_date_time,
    scheduled_date_time: apt.scheduled_date_time || apt.dateTime,
    status: apt.status,
    visit_id: apt.visit_id, // Include visit_id if available
  };
};

/**
 * Get all appointments
 */
export const getAllAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await fetch(getApiUrl('appointments'), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

/**
 * Get appointments by doctor ID
 */
export const getAppointmentsByDoctorId = async (doctorId: string): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];

    const response = await fetch(getApiUrl(`appointments?doctor_id=${doctorId}`), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
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
export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
  try {
    if (!patientId) return [];

    const response = await fetch(getApiUrl(`appointments?patient_id=${patientId}`), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
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
    // Determine if patientId is a UUID or patient_number (10-digit)
    const isPatientNumber = /^\d{10}$/.test(data.patientId);
    
    // Determine if doctorId is a UUID or needs to be looked up
    const isDoctorUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.doctorId);
    
    const requestBody: any = {
      department: data.department,
      reason: data.reason,
      scheduled_date_time: data.dateTime,
    };

    // Add patient identifier
    if (isPatientNumber) {
      requestBody.patient_number = data.patientId;
    } else {
      requestBody.patient_id = data.patientId;
    }

    // Add doctor identifier
    if (isDoctorUUID) {
      requestBody.doctor_id = data.doctorId;
    } else {
      // If it's not a UUID, it should be a UUID - return error
      return {
        success: false,
        error: 'Doctor ID must be a valid UUID',
      };
    }

    // hospital_id will be auto-filled from logged-in user's context in backend

    const response = await fetch(getApiUrl('appointments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to create appointment',
      };
    }

    return {
      success: true,
      data: transformAppointment(result.data),
    };
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

    const response = await fetch(getApiUrl(`appointments/doctor/${doctorId}/today`), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return [];
  }
};

/**
 * Get tomorrow's appointments for a doctor
 */
export const getTomorrowsAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];

    const response = await fetch(getApiUrl(`appointments/doctor/${doctorId}/tomorrow`), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tomorrow\'s appointments:', error);
    return [];
  }
};

/**
 * Get completed appointments for a doctor (recent patients)
 */
export const getCompletedAppointments = async (doctorId: string, limit = 5): Promise<Appointment[]> => {
  try {
    if (!doctorId) return [];

    const response = await fetch(getApiUrl(`appointments/doctor/${doctorId}/completed?limit=${limit}`), {
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
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformAppointment) : [];
    }
    
    return [];
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
    const updateData: any = {};
    if (updates.department) updateData.department = updates.department;
    if (updates.reason !== undefined) updateData.reason = updates.reason;
    if (updates.dateTime) updateData.scheduled_date_time = updates.dateTime;
    if (updates.status) updateData.status = updates.status;

    const response = await fetch(getApiUrl(`appointments/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to update appointment',
      };
    }

    return {
      success: true,
      data: transformAppointment(result.data),
    };
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
    const response = await fetch(getApiUrl(`appointments/${id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to delete appointment',
      };
    }

    return { success: true };
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
