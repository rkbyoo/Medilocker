import twilio from 'twilio';
import { config } from '../config/env';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export async function sendOtp(phoneNumber: string): Promise<void> {
  await client.verify.v2
    .services(config.twilio.verifyServiceSid)
    .verifications.create({ to: phoneNumber, channel: 'sms' });
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
  const result = await client.verify.v2
    .services(config.twilio.verifyServiceSid)
    .verificationChecks.create({ to: phoneNumber, code });
  return result.status === 'approved';
}
