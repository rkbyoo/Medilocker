import { Request } from 'express';

export interface AuthenticatedUser {
  user_id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface DatabaseUser {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: 'patient' | 'admin' | 'hospital_staff';
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  token_id: string;
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
}

export interface AccessLog {
  log_id: number;
  user_id?: string;
  action: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
}