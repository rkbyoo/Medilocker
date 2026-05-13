import * as admin from 'firebase-admin';
import { prisma } from '../../config/prisma';

/**
 * PushNotificationService
 * Handles sending push notifications via Firebase Cloud Messaging (FCM)
 */
export class PushNotificationService {
  private static initialized = false;

  /**
   * Initialize Firebase Admin SDK
   * Note: This requires a serviceAccountKey.json file in the root or env variables
   */
  private static init() {
    if (this.initialized) return true;

    try {
      // Check if we have credentials (either file or env)
      const hasConfig = process.env.FIREBASE_PROJECT_ID && 
                        process.env.FIREBASE_CLIENT_EMAIL && 
                        process.env.FIREBASE_PRIVATE_KEY;

      if (hasConfig) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
        this.initialized = true;
        console.log('[FCM] Firebase Admin initialized successfully');
      } else {
        console.warn('[FCM] Firebase credentials missing. Push notifications will be skipped.');
      }
    } catch (error) {
      console.error('[FCM] Failed to initialize Firebase:', error);
    }
    
    return this.initialized;
  }

  /**
   * Send a push notification to all devices registered to a patient
   */
  static async sendToPatient(patientId: string, title: string, body: string, data?: any) {
    if (!this.init()) return;

    try {
      // 1. Get all active device tokens for this patient
      const tokens = await prisma.deviceToken.findMany({
        where: { patient_id: patientId },
        select: { fcm_token: true }
      });

      if (tokens.length === 0) {
        console.log(`[FCM] No registered devices for patient ${patientId}`);
        return;
      }

      const tokenStrings = tokens.map((t: { fcm_token: string }) => t.fcm_token);

      // 2. Prepare the message
      const message: admin.messaging.MulticastMessage = {
        tokens: tokenStrings,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'medilocker_notifications',
            icon: 'ic_launcher',
            color: '#2563eb',
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      // 3. Send via Firebase
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`[FCM] Successfully sent ${response.successCount} messages to patient ${patientId}`);
      
      // 4. Cleanup invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokenStrings[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await prisma.deviceToken.deleteMany({
            where: { fcm_token: { in: failedTokens } }
          });
          console.log(`[FCM] Removed ${failedTokens.length} expired tokens`);
        }
      }
    } catch (error) {
      console.error('[FCM] Error sending push notification:', error);
    }
  }
}
