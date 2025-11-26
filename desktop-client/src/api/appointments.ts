import { dummyAppointments, dummyUsers } from '@/data/dummyData';
import type { ApiResponse, CreateAppointmentData, AppointmentResponse, Appointment } from '@/types';

/**
 * Appointment API
 * Handles all appointment-related operations with proper error handling
 */

// Types are now imported from centralized types file

/**
 * Get all appointments
 */
export const getAllAppointments = (): Appointment[] => {
  try {
    return [...dummyAppointments];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

/**
 * Get appointments by doctor ID
 */
export const getAppointmentsByDoctorId = (doctorId: string): Appointment[] => {
  try {
    if (!doctorId) return [];
    return dummyAppointments.filter(apt => apt.doctorId === doctorId);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return [];
  }
};

/**
 * Get appointments by patient ID
 */
export const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
  return dummyAppointments.filter(apt => apt.patientId === patientId);
};

/**
 * Create new appointment
 */
export const createAppointment = (data: CreateAppointmentData): AppointmentResponse => {
  try {
    const doctor = dummyUsers.find(u => u.id === data.doctorId);
    
    if (!doctor) {
      return { success: false, error: 'Doctor not found' };
    }

    const newAppointment: Appointment = {
      id: `APT${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: doctor.name,
      department: data.department,
      reason: data.reason,
      dateTime: data.dateTime,
      status: 'scheduled'
    };

    dummyAppointments.push(newAppointment);
    return { success: true, data: newAppointment };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    return { success: false, error: message };
  }
};

/**
 * Get today's appointments for a doctor
 */
export const getTodaysAppointments = (doctorId: string): Appointment[] => {
  try {
    if (!doctorId) return [];
    const today = new Date().toDateString();
    return dummyAppointments.filter(apt => 
      apt.doctorId === doctorId && 
      new Date(apt.dateTime).toDateString() === today &&
      apt.status === 'scheduled'
    );
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return [];
  }
};

/**
 * Get completed appointments for a doctor (recent patients)
 */
export const getCompletedAppointments = (doctorId: string, limit = 5): Appointment[] => {
  try {
    if (!doctorId) return [];
    return dummyAppointments
      .filter(apt => apt.doctorId === doctorId && apt.status === 'completed')
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching completed appointments:', error);
    return [];
  }
};

/**
 * Update appointment
 */
export const updateAppointment = (id: string, updates: Partial<Appointment>): AppointmentResponse => {
  try {
    const appointmentIndex = dummyAppointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return { success: false, error: 'Appointment not found' };
    }

    dummyAppointments[appointmentIndex] = {
      ...dummyAppointments[appointmentIndex],
      ...updates
    };
    
    return { success: true, data: dummyAppointments[appointmentIndex] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment';
    return { success: false, error: message };
  }
};

/**
 * Delete appointment
 */
export const deleteAppointment = (id: string): ApiResponse => {
  try {
    const appointmentIndex = dummyAppointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return { success: false, error: 'Appointment not found' };
    }

    dummyAppointments.splice(appointmentIndex, 1);
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
