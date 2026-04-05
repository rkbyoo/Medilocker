import { z } from 'zod';

// Patient Registration DTO
export const CreatePatientDto = z.object({
  name: z.string().min(2).max(200),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  bloodGroup: z.string().max(5).optional(),
  phoneNumber: z.string().max(20).optional(),
  guardianPhone: z.string().max(20).optional(),
  address: z.string().optional(),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  spouseName: z.string().max(200).optional(),
  caste: z.string().max(100).optional(),
  religion: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactNumber: z.string().max(20).optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  photo: z.string().url().optional().or(z.literal('')),
  nfcCardUid: z.string().max(100).optional(),
});

// Patient Update DTO (all fields optional)
export const UpdatePatientDto = CreatePatientDto.partial();

// Patient Search Query DTO
export const SearchPatientsDto = z.object({
  q: z.string().min(1).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

export type CreatePatientRequest = z.infer<typeof CreatePatientDto>;
export type UpdatePatientRequest = z.infer<typeof UpdatePatientDto>;
export type SearchPatientsRequest = z.infer<typeof SearchPatientsDto>;

