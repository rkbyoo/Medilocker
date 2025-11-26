/**
 * Centralized Type Definitions
 * Re-exports all types for easy importing
 */

// Core Types
export type UserRole = 'receptionist' | 'doctor';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Patient {
  id: string;
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
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  reason: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
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
  username: string;
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