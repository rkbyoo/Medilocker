import 'package:flutter/foundation.dart';
import '../models/notification.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  bool _hasLoaded = false;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  bool get hasLoaded => _hasLoaded;

  /// Fetch notifications from server.
  /// On any error: shows empty list (no error screen).
  Future<void> fetchNotifications({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      final result = await NotificationApiService.fetchNotifications();
      _notifications = result['notifications'] as List<AppNotification>;
      _unreadCount = result['unread_count'] as int;
    } catch (e) {
      // Log but don't surface error to UI — show empty state instead
      debugPrint('[NotificationProvider] fetchNotifications error: $e');
      _notifications = [];
      _unreadCount = 0;
    } finally {
      _isLoading = false;
      _hasLoaded = true;
      notifyListeners();
    }
  }

  /// Mark a single notification as read (optimistic update)
  Future<void> markRead(String notificationId) async {
    final idx = _notifications.indexWhere((n) => n.id == notificationId);
    if (idx == -1 || _notifications[idx].isRead) return;

    // Optimistic update
    _notifications[idx] = _notifications[idx].copyWith(isRead: true);
    _unreadCount = (_unreadCount - 1).clamp(0, 9999);
    notifyListeners();

    try {
      await NotificationApiService.markRead(notificationId);
    } catch (e) {
      debugPrint('[NotificationProvider] markRead error: $e');
      // Rollback on failure
      _notifications[idx] = _notifications[idx].copyWith(isRead: false);
      _unreadCount++;
      notifyListeners();
    }
  }

  /// Mark all notifications as read (optimistic update)
  Future<void> markAllRead() async {
    final hadUnread = _notifications.any((n) => !n.isRead);
    if (!hadUnread) return;

    _notifications = _notifications
        .map((n) => n.isRead ? n : n.copyWith(isRead: true))
        .toList();
    _unreadCount = 0;
    notifyListeners();

    try {
      await NotificationApiService.markAllRead();
    } catch (e) {
      debugPrint('[NotificationProvider] markAllRead error: $e');
      // Re-fetch on failure to restore state
      await fetchNotifications(silent: true);
    }
  }

  /// Silently refresh the unread badge count (e.g., on app focus).
  /// Never throws — badge simply stays at 0 on error.
  Future<void> refreshUnreadCount() async {
    try {
      _unreadCount = await NotificationApiService.fetchUnreadCount();
      notifyListeners();
    } catch (e) {
      debugPrint('[NotificationProvider] refreshUnreadCount error: $e');
    }
  }

  void clear() {
    _notifications = [];
    _unreadCount = 0;
    _isLoading = false;
    _hasLoaded = false;
    notifyListeners();
  }
}

