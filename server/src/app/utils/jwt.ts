import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticatedUser } from '../types/global';

export const generateAccessToken = (payload: AuthenticatedUser): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessTokenExpiry,
  };
  return jwt.sign(payload, config.jwt.accessSecret!, options);
};

export const generateRefreshToken = (payload: { user_id: string }): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshTokenExpiry,
  };
  return jwt.sign(payload, config.jwt.refreshSecret!, options);
};

export const verifyAccessToken = (token: string): AuthenticatedUser => {
  return jwt.verify(token, config.jwt.accessSecret!) as AuthenticatedUser;
};

export const verifyRefreshToken = (token: string): { user_id: string } => {
  return jwt.verify(token, config.jwt.refreshSecret!) as { user_id: string };
};