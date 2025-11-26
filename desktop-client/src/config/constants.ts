/**
 * Application Constants
 * Centralized configuration and constants
 */

export const APP_CONFIG = {
  name: 'Medical Management System',
  version: '1.0.0',
  description: 'Hospital Management Desktop Application',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  RECEPTIONIST: {
    DASHBOARD: '/receptionist',
    REGISTER_PATIENT: '/receptionist/register-patient',
    EXISTING_PATIENT: '/receptionist/existing-patient',
  },
  DOCTOR: {
    DASHBOARD: '/doctor',
    CONSULTATION: '/doctor/consultation/:patientId',
    CONSULTATION_WITH_ID: (patientId: string) => `/doctor/consultation/${patientId}`,
  },
  NOT_FOUND: '*',
} as const;

export const USER_ROLES = {
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  THEME: 'theme',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET_BY_ID: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET_BY_ID: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
  },
  MEDICAL_RECORDS: {
    LIST: '/medical-records',
    CREATE: '/medical-records',
    GET_BY_PATIENT: (patientId: string) => `/medical-records/patient/${patientId}`,
    GET_BY_ID: (id: string) => `/medical-records/${id}`,
    UPDATE: (id: string) => `/medical-records/${id}`,
    DELETE: (id: string) => `/medical-records/${id}`,
  },
} as const;

export const QUERY_KEYS = {
  AUTH: {
    CURRENT_USER: ['auth', 'currentUser'],
  },
  PATIENTS: {
    LIST: ['patients', 'list'],
    DETAIL: (id: string) => ['patients', 'detail', id],
  },
  APPOINTMENTS: {
    LIST: ['appointments', 'list'],
    BY_DOCTOR: (doctorId: string) => ['appointments', 'byDoctor', doctorId],
    TODAY: (doctorId: string) => ['appointments', 'today', doctorId],
    RECENT: (doctorId: string) => ['appointments', 'recent', doctorId],
  },
  MEDICAL_RECORDS: {
    BY_PATIENT: (patientId: string) => ['medicalRecords', 'byPatient', patientId],
  },
} as const;