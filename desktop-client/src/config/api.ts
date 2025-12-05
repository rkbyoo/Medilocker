/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // API version
  VERSION: 'v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000, // milliseconds
  },
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    
    // Patients
    PATIENTS: {
      BASE: '/patients',
      BY_ID: (id: string) => `/patients/${id}`,
      SEARCH: '/patients/search',
    },
    
    // Appointments
    APPOINTMENTS: {
      BASE: '/appointments',
      BY_ID: (id: string) => `/appointments/${id}`,
      BY_DOCTOR: (doctorId: string) => `/appointments/doctor/${doctorId}`,
      BY_PATIENT: (patientId: string) => `/appointments/patient/${patientId}`,
      TODAY: (doctorId: string) => `/appointments/doctor/${doctorId}/today`,
    },
    
    // Medical Records
    MEDICAL_RECORDS: {
      BASE: '/medical-records',
      BY_ID: (id: string) => `/medical-records/${id}`,
      BY_PATIENT: (patientId: string) => `/medical-records/patient/${patientId}`,
      BY_DOCTOR: (doctorId: string) => `/medical-records/doctor/${doctorId}`,
    },
  },
} as const;

export default API_CONFIG;