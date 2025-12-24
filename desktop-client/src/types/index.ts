/**
 * Centralized Type Definitions
 * Re-exports all types for easy importing
 */

// Core Types
export type UserRole = 'receptionist' | 'doctor';

export interface User {
  id: string; // user_id (UUID) from backend
  user_id: string; // Same as id, for clarity
  username: string; // email from backend
  email: string; // email from backend
  password: string; // Not stored, kept for compatibility
  role: UserRole; // 'receptionist' | 'doctor'
  name: string; // full_name from backend
  hospitalRole?: string; // 'doctor' | 'receptionist' | etc. from backend
}

export interface Patient {
  id: string;
  patientId?: string; // UUID from backend (for API calls)
  patientNumber?: string; // 10-digit patient number
  nfcCardUid?: string; // NFC card UID
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phoneNumber: string;
  guardianPhone: string;
  address: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  caste: string;
  religion: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  allergies: string[];
  chronicConditions: string[];
  photo?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: string;
  advice: string;
  nextVisit?: string;
}

export interface Appointment {
  id: string; // This is appointment_id
  appointment_id?: string; // Explicitly store appointment_id
  patientId: string; // This is patient_id (UUID)
  patientNumber?: string; // 10-digit patient number
  patientName: string;
  doctorId: string; // This is doctor_id (UUID)
  doctorName: string;
  hospitalId?: string; // Hospital UUID
  hospitalName?: string; // Hospital Name
  department: string;
  reason: string;
  dateTime: string; // ISO string
  scheduled_date_time?: string; // ISO string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  visit_id?: string; // Link to visit (for completed appointments)
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PatientResponse extends ApiResponse<Patient> {
  patient?: Patient; // For backward compatibility
}

export interface AppointmentResponse extends ApiResponse<Appointment> { }

export interface MedicalRecordResponse extends ApiResponse<MedicalRecord> { }

export interface CreateAppointmentData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  reason: string;
  dateTime: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface PatientFormData extends Omit<Patient, 'id'> {
  id?: string;
}

export interface AppointmentFormData extends Omit<Appointment, 'id' | 'patientName' | 'doctorName'> {
  id?: string;
}

export interface MedicalRecordFormData extends Omit<MedicalRecord, 'id' | 'doctorName'> {
  id?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  roles?: UserRole[];
}

// Context Types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginFormData) => Promise<ApiResponse<User>>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  getCurrentUser?: () => User | null; // Helper to get fresh user from localStorage
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps extends BaseComponentProps {
  title?: string;
}

// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};