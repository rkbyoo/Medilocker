import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Notification list & count  (static paths first)
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/', NotificationController.getMyNotifications);

// Mark read (static path MUST precede /:id/read)
router.patch('/mark-all-read', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

// Device token management (for future push delivery)
router.post('/device-token', NotificationController.registerDeviceToken);
router.delete('/device-token', NotificationController.unregisterDeviceToken);


export const notificationRoutes = router;
