export const USER_ROLES = {
  PATIENT: 'patient',
  ADMIN: 'admin',
  HOSPITAL_STAFF: 'hospital_staff',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];