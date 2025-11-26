/**
 * Validation Utilities
 * Common validation functions and schemas
 */

import { z } from 'zod';

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PATIENT_ID: /^\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  PATIENT_ID: 'Patient ID must be 10 digits',
  PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
} as const;

// Zod schemas for form validation
export const loginSchema = z.object({
  username: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
});

export const patientSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  dateOfBirth: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  phoneNumber: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(VALIDATION_PATTERNS.PHONE, VALIDATION_MESSAGES.PHONE),
  guardianPhone: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(VALIDATION_PATTERNS.PHONE, VALIDATION_MESSAGES.PHONE),
  address: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  spouseName: z.string().optional(),
  caste: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  religion: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  nationality: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  emergencyContactName: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  emergencyContactNumber: z.string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(VALIDATION_PATTERNS.PHONE, VALIDATION_MESSAGES.PHONE),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  doctorId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  department: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  reason: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  dateTime: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
});

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  doctorId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  diagnosis: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  medications: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  advice: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  nextVisit: z.string().optional(),
});

// Utility validation functions
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

export const isValidPatientId = (id: string): boolean => {
  return VALIDATION_PATTERNS.PATIENT_ID.test(id);
};

export const isValidPassword = (password: string): boolean => {
  return VALIDATION_PATTERNS.PASSWORD.test(password);
};

// Form validation helper
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};