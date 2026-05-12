import '../config/api_config.dart';
import '../services/api_service.dart';
import '../models/notification.dart';

class NotificationApiService {
  /// Fetch all notifications + unread count for the current patient
  static Future<Map<String, dynamic>> fetchNotifications({int limit = 50}) async {
    final response = await ApiService.get(
      '${ApiConfig.notificationsEndpoint}?limit=$limit',
    );
    final data = response['data'] as Map<String, dynamic>;
    final List<dynamic> raw = data['notifications'] as List<dynamic>? ?? [];
    return {
      'notifications': raw
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList(),
      'unread_count': data['unread_count'] as int? ?? 0,
    };
  }

  /// Get unread count only
  static Future<int> fetchUnreadCount() async {
    final response =
        await ApiService.get('${ApiConfig.notificationsEndpoint}/unread-count');
    return (response['data']['count'] as int?) ?? 0;
  }

  /// Mark a single notification as read
  static Future<void> markRead(String notificationId) async {
    await ApiService.patch(
      '${ApiConfig.notificationsEndpoint}/$notificationId/read',
      {},
    );
  }

  /// Mark all notifications as read
  static Future<void> markAllRead() async {
    await ApiService.patch(
      '${ApiConfig.notificationsEndpoint}/mark-all-read',
      {},
    );
  }

  /// Register FCM device token
  static Future<void> registerDeviceToken({
    required String fcmToken,
    required String platform,
  }) async {
    await ApiService.post('${ApiConfig.notificationsEndpoint}/device-token', {
      'fcm_token': fcmToken,
      'platform': platform,
    });
  }

  /// Unregister FCM device token on logout
  static Future<void> unregisterDeviceToken(String fcmToken) async {
    await ApiService.delete(
      '${ApiConfig.notificationsEndpoint}/device-token',
    );
  }
}
