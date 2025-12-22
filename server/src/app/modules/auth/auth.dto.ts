import { z } from 'zod';
import { USER_ROLES } from '../../constants/roles';

export const RegisterDto = z.object({
  full_name: z.string().min(2).max(150),
  email: z.string().email().max(150),
  phone: z.string().max(20).optional(),
  password: z.string().min(6),
  role: z.enum([USER_ROLES.PATIENT, USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF]),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenDto = z.object({
  refresh_token: z.string().min(1),
});

export type RegisterRequest = z.infer<typeof RegisterDto>;
export type LoginRequest = z.infer<typeof LoginDto>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenDto>;