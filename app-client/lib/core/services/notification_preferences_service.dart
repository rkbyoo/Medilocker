import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationPreference {
  final String key;
  final String label;
  final String fcmTopic;
  final bool defaultValue;

  const NotificationPreference({
    required this.key,
    required this.label,
    required this.fcmTopic,
    required this.defaultValue,
  });
}

class NotificationPreferencesService {
  static const String _prefsPrefix = 'notif_pref_';

  static const List<NotificationPreference> preferences = [
    NotificationPreference(
      key: 'appointment_reminders',
      label: 'Appointment Reminders',
      fcmTopic: 'appointment_reminders',
      defaultValue: true,
    ),
    NotificationPreference(
      key: 'prescription_alerts',
      label: 'Prescription Alerts',
      fcmTopic: 'prescription_alerts',
      defaultValue: true,
    ),
    NotificationPreference(
      key: 'lab_report_notifications',
      label: 'Lab Report Notifications',
      fcmTopic: 'lab_report_notifications',
      defaultValue: false,
    ),
    NotificationPreference(
      key: 'emergency_alerts',
      label: 'Emergency Alerts',
      fcmTopic: 'emergency_alerts',
      defaultValue: true,
    ),
  ];

  static Future<Map<String, bool>> loadAll() async {
    final prefs = await SharedPreferences.getInstance();
    final result = <String, bool>{};
    for (final pref in preferences) {
      result[pref.key] =
          prefs.getBool('$_prefsPrefix${pref.key}') ?? pref.defaultValue;
    }
    return result;
  }

  static Future<void> setPreference(String key, bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('$_prefsPrefix$key', enabled);

    final pref = preferences.firstWhere((p) => p.key == key);
    await _syncFcmTopic(pref.fcmTopic, enabled);
  }

  static Future<void> syncAllFcmTopics() async {
    final stored = await loadAll();
    for (final pref in preferences) {
      final enabled = stored[pref.key] ?? pref.defaultValue;
      await _syncFcmTopic(pref.fcmTopic, enabled);
    }
  }

  static Future<void> _syncFcmTopic(String topic, bool enabled) async {
    try {
      if (enabled) {
        await FirebaseMessaging.instance.subscribeToTopic(topic);
        debugPrint('[NotifPrefs] Subscribed to FCM topic: $topic');
      } else {
        await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
        debugPrint('[NotifPrefs] Unsubscribed from FCM topic: $topic');
      }
    } catch (e) {
      debugPrint('[NotifPrefs] FCM topic sync error for $topic: $e');
    }
  }
}
