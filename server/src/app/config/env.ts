import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables first
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL as string,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessTokenExpiry: '24h' as const,
    refreshTokenExpiry: '7d' as const,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID as string,
    authToken: process.env.TWILIO_AUTH_TOKEN as string,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID as string,
  },
};